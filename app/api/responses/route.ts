import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

// Get responses for a specific report
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const reportId = url.searchParams.get('reportId')
    
    console.log('[Responses API] Get responses request received', { reportId })
    
    if (!reportId) {
      console.log('[Responses API] No reportId provided')
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Responses API] No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Verify that the report belongs to the user
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id, user_email')
      .eq('id', reportId)
      .single()
    
    if (reportError || !report) {
      console.error('Error fetching report:', reportError)
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    if (report.user_email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Fetch responses for the report
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('report_id', reportId)
    
    if (responsesError) {
      console.error('Error fetching responses:', responsesError)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }
    
    // Transform responses into a more usable format
    const formattedResponses: Record<string, string> = {}
    responses.forEach(response => {
      formattedResponses[response.question_id] = response.response_value
    })
    
    return NextResponse.json(formattedResponses)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Save responses for a specific report
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { reportId, questionnaireId, responses } = body
    
    console.log('[Responses API] Save responses request received', { reportId, questionnaireId })
    
    if (!reportId || !responses) {
      console.log('[Responses API] Missing required parameters')
      return NextResponse.json(
        { error: 'Report ID and responses are required' },
        { status: 400 }
      )
    }
    
    if (!questionnaireId) {
      console.log('[Responses API] Missing questionnaire ID')
      return NextResponse.json(
        { error: 'Questionnaire ID is required' },
        { status: 400 }
      )
    }
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      console.log('[Responses API] No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Verify that the report belongs to the user
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id, user_email, user_id')
      .eq('id', reportId)
      .single()
    
    if (reportError || !report) {
      console.error('Error fetching report:', reportError)
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    if (report.user_email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // If user_id is in auth0 format, get the actual UUID from the users table
    let userId = report.user_id
    if (typeof userId === 'string' && userId.includes('|')) {
      // This is likely an Auth0 ID - need to fetch the UUID from users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()
        
      if (userError || !userData) {
        console.error('Error fetching user UUID:', userError)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 500 }
        )
      }
      
      userId = userData.id
    }
    
    // Format responses for insertion
    const now = new Date().toISOString()
    const responsesToInsert = Object.entries(responses).map(([questionId, value]) => ({
      report_id: reportId,
      user_id: userId,
      questionnaire_id: questionnaireId,
      question_id: questionId,
      response_value: value,
      answers: JSON.stringify(responses),
      created_at: now,
      updated_at: now
    }))
    
    // First delete any existing responses for this report
    const { error: deleteError } = await supabaseAdmin
      .from('responses')
      .delete()
      .eq('report_id', reportId)
    
    if (deleteError) {
      console.error('Error deleting existing responses:', deleteError)
      return NextResponse.json(
        { error: 'Failed to update responses' },
        { status: 500 }
      )
    }
    
    // Only insert if there are responses to insert
    if (responsesToInsert.length > 0) {
      // Insert new responses
      const { error: insertError } = await supabaseAdmin
        .from('responses')
        .insert(responsesToInsert)
      
      if (insertError) {
        console.error('Error inserting responses:', insertError)
        return NextResponse.json(
          { error: 'Failed to save responses' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 