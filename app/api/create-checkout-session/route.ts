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

    // Check if user exists in Supabase
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('email', userEmail)
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
          supabase_user_id: userId
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
        // User doesn't exist in Supabase yet (rare case)
        console.log('[Checkout] Creating new user in Supabase')
        
        // First check if user with this email already exists (double-check)
        const { data: emailCheck } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail)
        
        if (emailCheck && emailCheck.length > 0) {
          // User exists by email, update instead of insert
          console.log('[Checkout] User exists by email, updating instead:', emailCheck[0].id)
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ 
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            })
            .eq('id', emailCheck[0].id)

          if (updateError) {
            console.error('[Checkout] Error updating existing user:', updateError)
            return NextResponse.json(
              { error: 'Error updating user in database' },
              { status: 500 }
            )
          }
        } else {
          // Create new user
          const { error: createError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                email: userEmail,
                stripe_customer_id: customerId,
                has_paid: false,
                created_at: new Date().toISOString()
              }
            ])

          if (createError) {
            console.error('[Checkout] Error creating user:', createError)
            // If we get a duplicate key error, the user was created in a race condition
            if (createError.code === '23505') {
              console.log('[Checkout] User was created in a race condition, proceeding with checkout')
            } else {
              return NextResponse.json(
                { error: 'Error creating user in database' },
                { status: 500 }
              )
            }
          }
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