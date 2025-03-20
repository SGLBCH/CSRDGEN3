import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabaseClient'

// Interface for user data
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any;
}

export async function GET(req: Request) {
  try {
    console.log('[CheckPayment API] Payment status check request received')
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[CheckPayment API] No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to check payment status' },
        { status: 401 }
      )
    }
    
    // Extract user data, handling potential nesting
    let userData: UserData | undefined
    
    if (session?.user) {
      userData = session.user
    } else if (session && 'user' in session && session.user) {
      const typedSession = session as unknown as { user: { user: UserData } }
      userData = typedSession.user.user
    }
    
    const userEmail = userData?.email
    
    if (!userEmail) {
      console.log('[CheckPayment API] Missing user email')
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }
    
    console.log('[CheckPayment API] Checking payment status for:', userEmail)
    
    // Directly query for the specific user by email (case-insensitive)
    const { data: userMatch, error: userError } = await supabase
      .from('users')
      .select('has_paid, email, stripe_customer_id')
      .ilike('email', userEmail) // Case-insensitive match

    if (userError) {
      console.error('[CheckPayment API] Error querying user:', userError)
      return NextResponse.json(
        { error: 'Error checking payment status' },
        { status: 500 }
      )
    }
    
    console.log('[CheckPayment API] User search results:', {
      count: userMatch?.length || 0,
      emails: userMatch?.map(u => u.email) || []
    })
    
    // Get the user if found
    const user = userMatch && userMatch.length > 0 ? userMatch[0] : null
    
    if (!user || !user.has_paid) {
      console.log('[CheckPayment API] User has not paid:', {
        email: userEmail,
        found: !!user,
        hasPaid: user?.has_paid
      })
      
      // If we have a user but they haven't paid, return 402
      // If we don't have a user at all, we'll also return 402 (they need to pay)
      return NextResponse.json(
        { 
          error: 'Payment required',
          message: 'You need to purchase access to use this feature',
          isPaid: false,
          userFound: !!user
        },
        { status: 402 }
      )
    }
    
    console.log('[CheckPayment API] User has paid:', {
      email: userEmail,
      hasPaid: user.has_paid,
      stripeId: user.stripe_customer_id || 'none'
    })
    
    return NextResponse.json({ 
      isPaid: true,
      message: 'Payment verified'
    })
  } catch (error) {
    console.error('[CheckPayment API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 