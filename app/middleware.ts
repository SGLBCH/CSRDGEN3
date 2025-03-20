import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Types for the nested user structure
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any;
}

interface SessionData {
  user?: UserData;
  [key: string]: any;
}

async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Clear logging to make it easier to track execution
  console.log('----------------------------------------')
  console.log(`[Middleware] Starting, URL: ${req.url}`)
  console.log(`[Middleware] Path: ${req.nextUrl.pathname}`)
  
  try {
    // Get the Auth0 session
    const session = await getSession(req, res);
    
    // Handle potentially nested user structure
    let userData: UserData | undefined;
    
    if (session?.user) {
      userData = session.user;
    } else if (session && 'user' in session && session.user) {
      const typedSession = session as unknown as { user: { user: UserData } };
      userData = typedSession.user.user;
    }
    
    const userEmail = userData?.email;
    
    console.log('[Middleware] Session check:', {
      hasSession: !!session,
      hasUser: !!userData,
      email: userEmail,
      userKeys: userData ? Object.keys(userData) : [],
      path: req.nextUrl.pathname
    })

    // Enhanced debugging for session
    if (!session) {
      console.log('[Middleware] No session found')
    } else if (!userData) {
      console.log('[Middleware] Session found but no user data')
      console.log('[Middleware] Session keys:', Object.keys(session))
    } else {
      console.log('[Middleware] Full user data available')
    }

    if (!userData) {
      console.log('[Middleware] No user data, redirecting to login')
      return NextResponse.redirect(new URL('/api/auth/login', req.url))
    }

    // Check if the current path is public
    const url = new URL(req.url)
    const publicPaths = ['/pricing', '/api', '/', '/about', '/contact', '/auth-debug']
    
    // Explicit check for protected paths
    const isProtectedPath = (
      url.pathname === '/dashboard' || 
      url.pathname.startsWith('/dashboard/') ||
      url.pathname === '/reports' || 
      url.pathname.startsWith('/reports/') ||
      url.pathname === '/guidelines' || 
      url.pathname.startsWith('/guidelines/')
    );
    
    console.log(`[Middleware] Path ${url.pathname} is protected: ${isProtectedPath}`)
    
    if (publicPaths.some(path => url.pathname === path || url.pathname.startsWith(path + '/'))) {
      console.log('[Middleware] Public path accessed:', url.pathname)
      return res
    }

    // Check payment status in Supabase
    try {
      // If we don't have an email, we can't check payment status
      if (!userEmail) {
        console.log('[Middleware] No email found in user data, redirecting to error')
        return NextResponse.redirect(new URL('/error', req.url))
      }
    
      console.log(`[Middleware] Checking payment status for ${userEmail}`)
      
      // First query all users to see what we have in the database
      const { data: allUsers } = await supabase
        .from('users')
        .select('email, has_paid')
        .limit(10)
      
      console.log('[Middleware] First 10 users in database:', 
        allUsers?.map(u => ({ 
          email: u.email, 
          emailLength: u.email?.length,
          hasPaid: u.has_paid 
        }))
      )
      
      // Try exact match first
      const { data: userData, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('email', userEmail)
        .maybeSingle()

      console.log('[Middleware] Exact match payment check:', {
        email: userEmail,
        hasPaid: userData?.has_paid,
        error: error?.message,
        found: !!userData
      })
      
      // If no exact match, try a manual match
      let manualMatch = null
      if (!userData && allUsers) {
        for (const u of allUsers) {
          // Case-insensitive match
          if (u.email.toLowerCase() === userEmail.toLowerCase()) {
            console.log('[Middleware] Found manual case-insensitive match:', u.email)
            manualMatch = u
            break
          }
        }
      }
      
      // Use userData if found, otherwise use manualMatch
      const userHasPaid = userData?.has_paid || manualMatch?.has_paid
      
      console.log('[Middleware] Final payment status:', {
        email: userEmail,
        hasPaid: userHasPaid,
        exactMatch: !!userData,
        manualMatch: !!manualMatch
      })

      // If user doesn't exist or hasn't paid, redirect to pricing page
      if (error || (!userData && !manualMatch) || !userHasPaid) {
        console.log('[Middleware] User not paid, redirecting to pricing')
        return NextResponse.redirect(new URL('/pricing', req.url))
      }
      
      console.log('[Middleware] User has paid, allowing access')
    } catch (dbError) {
      console.error('[Middleware] Database error:', dbError)
      return NextResponse.redirect(new URL('/error', req.url))
    }

    return res
  } catch (error) {
    console.error('[Middleware] Error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  } finally {
    console.log('[Middleware] Finished processing request')
    console.log('----------------------------------------')
  }
}

export default withMiddlewareAuthRequired(middleware)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reports/:path*',
    '/guidelines/:path*',
    '/dashboard',
    '/reports',
    '/guidelines'
  ]
} 