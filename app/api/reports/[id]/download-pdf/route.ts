import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Reports API] Download PDF request received', { id: params.id })
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Parse request body to get generated content
    const { content } = await req.json()
    
    if (!content) {
      return NextResponse.json(
        { error: 'Report content is required' },
        { status: 400 }
      )
    }
    
    // Verify that the report belongs to the user
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id, user_email, title')
      .eq('id', params.id)
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
    
    // The PDF generation will be handled client-side using jsPDF
    // This endpoint just verifies permissions and returns successful response
    
    return NextResponse.json({
      success: true,
      reportTitle: report.title
    })
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