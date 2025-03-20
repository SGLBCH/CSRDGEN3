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

// Get a report by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Reports API] Get single report request received', { id: params.id })
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Reports API] No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to view this report' },
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
    
    // Special override for testing (REMOVE IN PRODUCTION)
    if (userEmail === 'scott.golbach@gmail.com') {
      console.log('[Reports API] Testing override for scott.golbach@gmail.com')
    } else if (userError || !user || !user.has_paid) {
      console.log('[Reports API] User has not paid', { error: userError, user })
      return NextResponse.json(
        { error: 'You need to purchase access to view reports' },
        { status: 403 }
      )
    }
    
    // Get the report and verify ownership - using supabaseAdmin to bypass RLS
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single()
      
    if (reportError) {
      console.log('[Reports API] Error fetching report:', reportError)
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    // Verify that the user owns this report
    if (report.user_email !== userEmail) {
      console.log('[Reports API] Unauthorized access attempt', { 
        reportOwner: report.user_email, 
        requestUser: userEmail 
      })
      return NextResponse.json(
        { error: 'You do not have permission to view this report' },
        { status: 403 }
      )
    }
    
    console.log('[Reports API] Report fetched successfully', { id: report.id })
    return NextResponse.json(report)
    
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Update a report by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Reports API] Update report request received', { id: params.id })
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Reports API] No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to update this report' },
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
    
    // Special override for testing (REMOVE IN PRODUCTION)
    if (userEmail === 'scott.golbach@gmail.com') {
      console.log('[Reports API] Testing override for scott.golbach@gmail.com')
    } else if (userError || !user || !user.has_paid) {
      console.log('[Reports API] User has not paid', { error: userError, user })
      return NextResponse.json(
        { error: 'You need to purchase access to update reports' },
        { status: 403 }
      )
    }
    
    // Get the report to verify ownership
    const { data: existingReport, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('user_email')
      .eq('id', params.id)
      .single()
      
    if (reportError) {
      console.log('[Reports API] Error fetching report:', reportError)
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    // Verify that the user owns this report
    if (existingReport.user_email !== userEmail) {
      console.log('[Reports API] Unauthorized update attempt', { 
        reportOwner: existingReport.user_email, 
        requestUser: userEmail 
      })
      return NextResponse.json(
        { error: 'You do not have permission to update this report' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await req.json()
    const { title, status, content } = body
    
    if (!title && !status && !content) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      )
    }
    
    // Prepare update data
    const updateData: any = {}
    if (title) updateData.title = title
    if (status) updateData.status = status
    if (content) updateData.content = content
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()
    
    // Update the report
    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('reports')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
      
    if (updateError) {
      console.log('[Reports API] Error updating report:', updateError)
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      )
    }
    
    console.log('[Reports API] Report updated successfully', { id: updatedReport.id })
    return NextResponse.json({ report: updatedReport })
    
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Delete a report by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Reports API] Delete report request received', { id: params.id })
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Reports API] No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to delete this report' },
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
    
    // Special override for testing (REMOVE IN PRODUCTION)
    if (userEmail === 'scott.golbach@gmail.com') {
      console.log('[Reports API] Testing override for scott.golbach@gmail.com')
    } else if (userError || !user || !user.has_paid) {
      console.log('[Reports API] User has not paid', { error: userError, user })
      return NextResponse.json(
        { error: 'You need to purchase access to delete reports' },
        { status: 403 }
      )
    }
    
    // Get the report to verify ownership
    const { data: existingReport, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('user_email')
      .eq('id', params.id)
      .single()
      
    if (reportError) {
      console.log('[Reports API] Error fetching report:', reportError)
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    // Verify that the user owns this report
    if (existingReport.user_email !== userEmail) {
      console.log('[Reports API] Unauthorized delete attempt', { 
        reportOwner: existingReport.user_email, 
        requestUser: userEmail 
      })
      return NextResponse.json(
        { error: 'You do not have permission to delete this report' },
        { status: 403 }
      )
    }
    
    // Delete the report
    // First, delete all responses associated with this report
    const { error: responsesDeleteError } = await supabaseAdmin
      .from('responses')
      .delete()
      .eq('report_id', params.id)
      
    if (responsesDeleteError) {
      console.log('[Reports API] Error deleting associated responses:', responsesDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete associated responses' },
        { status: 500 }
      )
    }
    
    console.log('[Reports API] Associated responses deleted successfully')
    
    // Now delete the report
    const { error: deleteError } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', params.id)
      
    if (deleteError) {
      console.log('[Reports API] Error deleting report:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      )
    }
    
    console.log('[Reports API] Report deleted successfully', { id: params.id })
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 