import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'
import Stripe from 'stripe'

// This is needed because the webhook data comes as a raw stream
async function buffer(readable: ReadableStream<Uint8Array>) {
  const chunks: Uint8Array[] = []
  const reader = readable.getReader()
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  
  return Buffer.concat(chunks)
}

export async function POST(req: Request) {
  try {
    console.log('[Webhook] Received Stripe webhook')
    const body = await buffer(req.body as ReadableStream<Uint8Array>)
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[Webhook] Missing Stripe webhook secret')
      return NextResponse.json(
        { error: 'Missing Stripe webhook secret' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
      console.log('[Webhook] Event verified:', event.type)
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[Webhook] Processing completed checkout:', session.id)
      console.log('[Webhook] Session data:', JSON.stringify(session, null, 2))

      // Extract user information from metadata
      const userEmail = session.metadata?.userEmail
      const customerId = session.customer as string

      if (!customerId) {
        console.error('[Webhook] Missing customer ID in session')
        return NextResponse.json(
          { error: 'Missing customer ID' },
          { status: 400 }
        )
      }

      // Try to find user by email first
      let userData = null
      let findError = null

      if (userEmail) {
        console.log('[Webhook] Looking up user by email:', userEmail)
        const result = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle()

        userData = result.data
        findError = result.error
        
        // Log the result for debugging
        console.log('[Webhook] Email lookup result:', {
          data: result.data,
          error: result.error ? `${result.error.code}: ${result.error.message}` : null
        })
      }

      // If email lookup fails, try to find by customer ID
      if (!userData && customerId) {
        console.log('[Webhook] Email lookup failed, trying customer ID:', customerId)
        const result = await supabase
          .from('users')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        userData = result.data
        findError = result.error
        
        // Log the result for debugging
        console.log('[Webhook] Customer ID lookup result:', {
          data: result.data,
          error: result.error ? `${result.error.code}: ${result.error.message}` : null
        })
      }

      // If both lookups fail, try to get customer info from Stripe
      if (!userData && customerId) {
        try {
          console.log('[Webhook] Looking up customer in Stripe:', customerId)
          const customer = await stripe.customers.retrieve(customerId)
          
          if (customer && !customer.deleted && customer.email) {
            console.log('[Webhook] Found customer email in Stripe:', customer.email)
            
            // Try one more time with the email from Stripe
            const result = await supabase
              .from('users')
              .select('*')
              .eq('email', customer.email)
              .maybeSingle()

            userData = result.data
            findError = result.error
            
            // Log the result for debugging
            console.log('[Webhook] Stripe email lookup result:', {
              data: result.data,
              error: result.error ? `${result.error.code}: ${result.error.message}` : null
            })
          }
        } catch (stripeError) {
          console.error('[Webhook] Error retrieving customer from Stripe:', stripeError)
        }
      }

      // If we still can't find the user, create a new one
      if (!userData && userEmail) {
        console.log('[Webhook] User not found, creating new user with email:', userEmail)
        
        try {
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                email: userEmail,
                stripe_customer_id: customerId,
                has_paid: true
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('[Webhook] Error creating user:', createError)
            
            // If duplicate key error, try to find the user one more time
            if (createError.code === '23505') {
              console.log('[Webhook] User already exists, trying to find again')
              const result = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .maybeSingle()
                
              userData = result.data
              
              // Log the result for debugging
              console.log('[Webhook] Final lookup result:', {
                data: result.data,
                error: result.error ? `${result.error.code}: ${result.error.message}` : null
              })
            } else {
              return NextResponse.json(
                { error: 'Error creating user' },
                { status: 500 }
              )
            }
          } else {
            userData = newUser
            console.log('[Webhook] Created new user:', userData)
          }
        } catch (createError) {
          console.error('[Webhook] Error in user creation:', createError)
          return NextResponse.json(
            { error: 'Error creating user' },
            { status: 500 }
          )
        }
      }

      // IMPORTANT FIX: If we still don't have userData but we have userEmail, make one last attempt
      // This is a fallback in case all previous lookups failed
      if (!userData && userEmail) {
        console.log('[Webhook] All lookups failed, making one final attempt with admin client')
        try {
          // Use admin client for this final attempt to bypass RLS
          const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle()
            
          if (data) {
            console.log('[Webhook] Final attempt succeeded:', data)
            userData = data
          } else {
            console.error('[Webhook] Final attempt failed:', error)
          }
        } catch (finalError) {
          console.error('[Webhook] Error in final lookup attempt:', finalError)
        }
      }

      if (!userData || !userData.id) {
        console.error('[Webhook] Could not find or create user')
        
        // Instead of returning an error, create a new user as a last resort
        if (userEmail) {
          console.log('[Webhook] Last resort: Creating user with admin client')
          try {
            const { data: lastResortUser, error: lastResortError } = await supabaseAdmin
              .from('users')
              .insert([
                {
                  email: userEmail,
                  stripe_customer_id: customerId,
                  has_paid: true
                }
              ])
              .select()
              
            if (lastResortError) {
              console.error('[Webhook] Last resort creation failed:', lastResortError)
              return NextResponse.json(
                { error: 'Failed to create user as last resort' },
                { status: 500 }
              )
            }
            
            if (lastResortUser && lastResortUser.length > 0) {
              userData = lastResortUser[0]
              console.log('[Webhook] Last resort creation succeeded:', userData)
            }
          } catch (e) {
            console.error('[Webhook] Exception in last resort creation:', e)
            return NextResponse.json(
              { error: 'Exception in last resort user creation' },
              { status: 500 }
            )
          }
        } else {
          return NextResponse.json(
            { error: 'User not found and could not be created' },
            { status: 404 }
          )
        }
      }

      console.log('[Webhook] Found user with ID:', userData.id)
      console.log('[Webhook] Updating user payment status')

      // Update user record in Supabase using admin client to bypass RLS
      try {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            has_paid: true,
            stripe_customer_id: customerId
          })
          .eq('id', userData.id)

        if (updateError) {
          console.error('[Webhook] Error updating user:', updateError)
          return NextResponse.json(
            { error: 'Error updating user' },
            { status: 500 }
          )
        }

        console.log('[Webhook] User payment status updated successfully')
      } catch (updateError) {
        console.error('[Webhook] Exception updating user:', updateError)
        return NextResponse.json(
          { error: 'Exception updating user' },
          { status: 500 }
        )
      }
    }

    // Handle payment failure events if needed
    if (event.type === 'charge.failed') {
      const charge = event.data.object as Stripe.Charge
      console.error('[Webhook] Payment failed:', charge.id)
      // You might want to notify the user or take other actions
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error:', error.message)
    console.error('[Webhook] Stack:', error.stack)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// This is the correct way to configure options in App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Remove the old config export as it's not compatible with App Router 