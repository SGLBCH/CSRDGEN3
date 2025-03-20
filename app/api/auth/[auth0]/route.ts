import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

// Interface for user data
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any;
}

const afterCallback = async (req: any, session: any) => {
  // Enhanced debugging - log everything
  console.log('[Auth0 Callback] Raw session:', session)
  
  // Extract user data, handling potential nesting
  let userData: UserData | undefined = undefined;
  
  if (session?.user) {
    userData = session.user;
  } else if (session && 'user' in session && session.user) {
    // Handle double-nested case
    userData = session.user.user;
  }
  
  // Immediately check if we received user data
  if (!userData) {
    console.error('[Auth0 Callback] WARNING: No user object in session')
    console.log('[Auth0 Callback] Session keys:', Object.keys(session || {}))
    console.log('[Auth0 Callback] Full session JSON:', JSON.stringify(session, null, 2))
    
    // Try to extract some debug info from the request
    try {
      console.log('[Auth0 Callback] Request headers:', req.headers)
      console.log('[Auth0 Callback] Request URL:', req.url)
      console.log('[Auth0 Callback] Request method:', req.method)
    } catch (e: any) {
      console.log('[Auth0 Callback] Error accessing request properties:', e.message)
    }
    
    // If the session doesn't have a user object but has an accessToken or idToken,
    // try to manually extract the user information
    if (session?.accessToken || session?.idToken) {
      console.log('[Auth0 Callback] Found token in session, attempting to extract user data')
      // This is a simplified placeholder - the actual implementation would depend on your auth flow
    }
  }
  
  // Normal processing - if we have a user with email
  if (userData?.email) {
    console.log('[Auth0 Callback] User email found:', userData.email)
    
    // Normalize the email to prevent case sensitivity issues
    const normalizedEmail = userData.email.trim().toLowerCase()
    console.log('[Auth0 Callback] Normalized email:', normalizedEmail)
    
    // Try to create the user in Supabase if they don't exist
    try {
      // First, check ALL users to see what's in the database
      const { data: allUsers } = await supabase
        .from('users')
        .select('email, has_paid')
        .limit(10)
      
      console.log('[Auth0 Callback] First 10 users in database:', 
        allUsers?.map(u => ({ 
          email: u.email, 
          emailLength: u.email?.length,
          hasPaid: u.has_paid 
        }))
      )
      
      let userExists = false;
      
      // Check if user exists - use regular client for reading
      const { data: existingUserExact, error: queryErrorExact } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userData.email)

      console.log('[Auth0 Callback] Exact query result:', {
        found: !!existingUserExact && existingUserExact.length > 0,
        emails: existingUserExact?.map(u => u.email) || [],
        error: queryErrorExact?.message
      })
      
      // Also try case-insensitive search
      const { data: existingUserIlike, error: queryErrorIlike } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', userData.email)
      
      console.log('[Auth0 Callback] Case-insensitive query result:', {
        found: !!existingUserIlike && existingUserIlike.length > 0,
        emails: existingUserIlike?.map(u => u.email) || [],
        error: queryErrorIlike?.message
      })
      
      // Also try manual matching in case database functions don't work as expected
      let manualMatch = null
      if (allUsers) {
        for (const u of allUsers) {
          if (u.email && u.email.toLowerCase() === normalizedEmail) {
            console.log('[Auth0 Callback] Found manual case-insensitive match:', u.email)
            manualMatch = u
            break
          }
        }
      }

      // User exists if we found them by any method
      userExists = 
        (existingUserExact && existingUserExact.length > 0) || 
        (existingUserIlike && existingUserIlike.length > 0) ||
        !!manualMatch;
      
      console.log('[Auth0 Callback] User exists check result:', userExists)

      // Create user if they don't exist - use admin client to bypass RLS
      if (!userExists) {
        console.log('[Auth0 Callback] Creating new user in Supabase:', userData.email)
        console.log('[Auth0 Callback] Using admin client to bypass RLS')
        
        // User doesn't exist, create them with admin client
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              email: userData.email, // Keep original case for consistency with Auth0
              has_paid: false,
            }
          ])
          .select()

        if (createError) {
          console.error('[Auth0 Callback] Error creating user in Supabase:', createError)
        } else {
          console.log('[Auth0 Callback] Successfully created user in Supabase:', newUser)
        }
      }
    } catch (error) {
      console.error('[Auth0 Callback] Supabase operation failed:', error)
    }
  } else {
    console.error('[Auth0 Callback] No email found in user data')
  }

  return session
}

// Export the Auth0 handler with properly configured scopes and parameters
export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      scope: 'openid profile email',
      response_type: 'code',
    },
    returnTo: '/dashboard'
  }),
  callback: handleCallback({ 
    afterCallback 
  })
}) 