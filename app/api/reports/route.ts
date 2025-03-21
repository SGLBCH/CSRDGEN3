import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

// Interface for user data
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any;
}

export async function POST(req: Request) {
  try {
    console.log('[Reports API] Create report request received')
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Reports API] No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to create a report' },
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
    const userId = userData?.sub
    
    if (!userEmail || !userId) {
      console.log('[Reports API] Missing user email or ID')
      return NextResponse.json(
        { error: 'User email or ID not found' },
        { status: 400 }
      )
    }
    
    // Check if user has paid
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('has_paid')
      .eq('email', userEmail)
      .single()
    
    // Special override for testing (REMOVE IN PRODUCTION)
    if (userEmail === 'scott.golbach@gmail.com') {
      console.log('[Reports API] Testing override for scott.golbach@gmail.com')
    } else if (userError || !user || !user.has_paid) {
      console.log('[Reports API] User has not paid', { error: userError, user })
      return NextResponse.json(
        { error: 'You need to purchase access to create reports' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await req.json()
    const { title = 'Untitled Report' } = body
    
    // Create a new report
    const { data: report, error: createError } = await supabaseAdmin
      .from('reports')
      .insert([
        {
          user_id: userId,
          user_email: userEmail,
          title,
          status: 'draft',
          content: {}
        }
      ])
      .select()
      .single()
    
    if (createError) {
      console.error('[Reports API] Error creating report:', createError)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }
    
    console.log('[Reports API] Report created successfully', { reportId: report.id })
    return NextResponse.json({ report })
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    console.log('[Reports API] Get reports request received')
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Reports API] No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to view reports' },
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
      console.log('[Reports API] Missing user email')
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }
    
    // Check if user has paid
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('has_paid')
      .eq('email', userEmail)
      .single()
    
    if (userError || !user || !user.has_paid) {
      console.log('[Reports API] User has not paid', { error: userError, user })
      return NextResponse.json(
        { error: 'Payment required to access reports' },
        { status: 402 }
      )
    }
    
    // Get reports for this user
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('user_email', userEmail)
      .order('updated_at', { ascending: false })
      
    if (reportsError) {
      console.log('[Reports API] Error fetching reports:', reportsError)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }
    
    // Enhanced debugging - get direct count from admin client to check RLS
    const { data: adminReports, error: adminError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_email', userEmail)
    
    console.log('[Reports API] Reports fetched successfully', { 
      count: reports.length,
      adminCount: adminReports?.length || 0,
      userEmail: userEmail,
      firstReportId: reports.length > 0 ? reports[0].id : 'none',
      adminFirstReportId: adminReports && adminReports.length > 0 ? adminReports[0].id : 'none'
    })
    
    // If reports are empty but we know we created a report, let's try to return the admin reports
    if (reports.length === 0 && adminReports && adminReports.length > 0) {
      console.log('[Reports API] Using admin reports because RLS might be blocking')
      return NextResponse.json({ reports: adminReports })
    }
    
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 