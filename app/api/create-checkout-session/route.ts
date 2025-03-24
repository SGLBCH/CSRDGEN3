import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const { userId, userEmail } = await req.json()

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing user information' },
        { status: 400 }
      )
    }

    console.log('[Checkout] Creating session for:', { userId, userEmail })

    // Check if user exists in Supabase - using case-insensitive search
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .ilike('email', userEmail) // Case-insensitive search
      .limit(1) // Just get the first match
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('[Checkout] Error checking user:', userError)
      return NextResponse.json(
        { error: 'Error checking user in database' },
        { status: 500 }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = existingUser?.stripe_customer_id

    if (!customerId) {
      console.log('[Checkout] Creating new Stripe customer')
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          auth0_user_id: userId
        }
      })
      customerId = customer.id

      if (existingUser) {
        // User exists but doesn't have a Stripe customer ID yet
        console.log('[Checkout] Updating existing user with Stripe customer ID:', existingUser.id)
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('[Checkout] Error updating user:', updateError)
          return NextResponse.json(
            { error: 'Error updating user in database' },
            { status: 500 }
          )
        }
      } else {
        // User doesn't exist in Supabase yet (new Google account login)
        console.log('[Checkout] Creating new user in Supabase')
        
        // Try to create the user
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              email: userEmail,
              stripe_customer_id: customerId,
              has_paid: false,
              created_at: new Date().toISOString()
            }
          ])
          .select()

        if (createError) {
          console.error('[Checkout] Error creating user:', createError)
          
          // Try a "get or create" approach with a second attempt
          if (createError.code === '23505') { // Unique constraint violation
            console.log('[Checkout] Duplicate key error. Trying to fetch existing user record.')
            
            // Try to get the existing user record
            const { data: existingUserRetry, error: retryError } = await supabaseAdmin
              .from('users')
              .select('id')
              .ilike('email', userEmail)
              .limit(1)
            
            if (retryError || !existingUserRetry || existingUserRetry.length === 0) {
              console.error('[Checkout] Failed to get existing user after constraint violation:', retryError)
              return NextResponse.json(
                { error: 'Failed to create or retrieve user record' },
                { status: 500 }
              )
            }
            
            // Update the existing user record with the customer ID
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({ 
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingUserRetry[0].id)
            
            if (updateError) {
              console.error('[Checkout] Error updating existing user after retry:', updateError)
              return NextResponse.json(
                { error: 'Error updating user after retry' },
                { status: 500 }
              )
            }
            
            console.log('[Checkout] Successfully updated existing user after retry')
          } else {
            // Not a duplicate key error, return the error
            return NextResponse.json(
              { error: 'Error creating user in database' },
              { status: 500 }
            )
          }
        } else {
          console.log('[Checkout] Successfully created new user:', newUser)
        }
      }
    } else {
      console.log('[Checkout] Using existing Stripe customer ID:', customerId)
    }

    // Create Stripe checkout session
    console.log('[Checkout] Creating checkout session with customer:', customerId)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'CSRD Report Access',
              description: 'Full access to CSRD reporting tools and features - One-time purchase'
            },
            unit_amount: 19900, // 199 EUR in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        userId,
        userEmail
      }
    })

    console.log('[Checkout] Session created:', session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('[Checkout] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 