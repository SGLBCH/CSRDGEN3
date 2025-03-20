import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const session = await getSession(req, res);
    console.log('[/api/auth/me] Request received');
    console.log('[/api/auth/me] Session available:', !!session);
    
    if (session) {
      console.log('[/api/auth/me] User available:', !!session.user);
      console.log('[/api/auth/me] User keys:', session.user ? Object.keys(session.user) : []);
      console.log('[/api/auth/me] Full session:', JSON.stringify(session, null, 2));
    }
    
    if (!session?.user) {
      console.log('[/api/auth/me] No user in session');
      return NextResponse.json({ 
        authenticated: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }
    
    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('[/api/auth/me] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve user session' 
    }, { status: 500 });
  }
} 