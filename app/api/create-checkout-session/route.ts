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
    console.log('[Checkout] Using Stripe in mode:', process.env.NODE_ENV || 'unknown')

    try {
      // Check if user exists in Supabase - first try by exact email match
      const { data: directCheck } = await supabaseAdmin
        .from('users')
        .select('id, email, stripe_customer_id')
        .eq('email', userEmail)
      
      console.log('[Checkout] Direct email check results:', {
        found: !!directCheck && directCheck.length > 0,
        count: directCheck?.length || 0
      })

      // Then try case-insensitive match if direct check failed
      let existingUser = null
      if (!directCheck || directCheck.length === 0) {
        const { data: caseInsensitiveCheck } = await supabaseAdmin
          .from('users')
          .select('id, email, stripe_customer_id')
          .ilike('email', userEmail)
          .limit(1)
        
        console.log('[Checkout] Case-insensitive email check results:', {
          found: !!caseInsensitiveCheck && caseInsensitiveCheck.length > 0,
          count: caseInsensitiveCheck?.length || 0
        })
        
        if (caseInsensitiveCheck && caseInsensitiveCheck.length > 0) {
          existingUser = caseInsensitiveCheck[0]
        }
      } else if (directCheck && directCheck.length > 0) {
        existingUser = directCheck[0]
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
        console.log('[Checkout] Successfully created Stripe customer:', customerId)

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
            console.error('[Checkout] Error updating user:', updateError, JSON.stringify(updateError))
            return NextResponse.json(
              { error: 'Error updating user in database' },
              { status: 500 }
            )
          }
          console.log('[Checkout] Successfully updated existing user')
        } else {
          // User doesn't exist in Supabase yet
          console.log('[Checkout] Creating new user in Supabase for email:', userEmail)
          
          // First, fetch existing users to better debug potential issues
          const { data: allUsers } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .limit(5)

          console.log('[Checkout] First 5 users in database:', 
            allUsers?.map(u => ({ id: u.id, email: u.email })) || 'none found')
          
          // Get the current timestamp (once, to use consistently)
          const timestamp = new Date().toISOString()
          
          // Try to create the user
          console.log('[Checkout] Attempting to insert user with details:', {
            email: userEmail,
            stripe_customer_id: customerId,
            timestamp
          })
          
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                email: userEmail,
                stripe_customer_id: customerId,
                has_paid: false,
                created_at: timestamp,
                updated_at: timestamp
              }
            ])
            .select()

          if (createError) {
            console.error('[Checkout] Error creating user:', createError, JSON.stringify(createError))
            
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
                
                // Create Stripe checkout session anyway, even if user creation failed
                // This is a fallback to let the user complete checkout, and we'll handle user creation in the webhook
                console.log('[Checkout] Creating checkout session without user record')
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
                    userEmail,
                    needs_user_creation: 'true' // Flag for webhook to create user
                  }
                })
                
                console.log('[Checkout] Session created (without user record):', session.id)
                return NextResponse.json({ sessionId: session.id })
              }
              
              // Update the existing user record with the customer ID
              const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ 
                  stripe_customer_id: customerId,
                  updated_at: timestamp
                })
                .eq('id', existingUserRetry[0].id)
              
              if (updateError) {
                console.error('[Checkout] Error updating existing user after retry:', updateError)
                // Continue to checkout anyway
                console.log('[Checkout] Continuing to checkout despite update error')
              } else {
                console.log('[Checkout] Successfully updated existing user after retry')
              }
            } else {
              // Not a duplicate key error, but continue to checkout anyway
              console.log('[Checkout] Continuing to checkout despite user creation error')
              // We will handle user creation in the webhook if needed
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
    } catch (dbError: any) {
      console.error('[Checkout] Database operation error:', dbError, JSON.stringify(dbError))
      return NextResponse.json(
        { error: `Database error: ${dbError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[Checkout] Unhandled error:', error.message, JSON.stringify(error))
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 