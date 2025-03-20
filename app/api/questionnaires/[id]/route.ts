import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

// GET a specific questionnaire by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    const user = session?.user
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user has paid for access
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('has_paid')
      .eq('email', user.email)
      .single()
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!userData.has_paid) {
      return NextResponse.json(
        { error: 'Payment required to access questionnaires' },
        { status: 402 }
      )
    }
    
    const { data: questionnaire, error } = await supabaseAdmin
      .from('questionnaires')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error) {
      console.error('Error fetching questionnaire:', error)
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(questionnaire)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// UPDATE a questionnaire by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    const user = session?.user
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user is an admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('email', user.email)
      .single()
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!userData.is_admin) {
      return NextResponse.json(
        { error: 'Admin permissions required' },
        { status: 403 }
      )
    }
    
    // Check if questionnaire exists
    const { data: existingQuestionnaire, error: fetchError } = await supabaseAdmin
      .from('questionnaires')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !existingQuestionnaire) {
      console.error('Error fetching questionnaire:', fetchError)
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }
    
    // Parse the request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Title and sections are required' },
        { status: 400 }
      )
    }
    
    // Prepare update data
    const updateData = {
      title: body.title,
      description: body.description || null,
      sections: body.sections,
      updated_at: new Date().toISOString()
    }
    
    // Update the questionnaire
    const { data, error } = await supabaseAdmin
      .from('questionnaires')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating questionnaire:', error)
      return NextResponse.json(
        { error: 'Failed to update questionnaire' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a questionnaire by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    const user = session?.user
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user is an admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('email', user.email)
      .single()
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!userData.is_admin) {
      return NextResponse.json(
        { error: 'Admin permissions required' },
        { status: 403 }
      )
    }
    
    // First check if there are any responses linked to this questionnaire
    const { data: relatedResponses, error: responsesError } = await supabaseAdmin
      .from('responses')
      .select('id')
      .eq('questionnaire_id', params.id)
      .limit(1)
    
    if (responsesError) {
      console.error('Error checking related responses:', responsesError)
      return NextResponse.json(
        { error: 'Failed to check related responses' },
        { status: 500 }
      )
    }
    
    if (relatedResponses && relatedResponses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete questionnaire that has existing responses' },
        { status: 400 }
      )
    }
    
    // Delete the questionnaire
    const { error } = await supabaseAdmin
      .from('questionnaires')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      console.error('Error deleting questionnaire:', error)
      return NextResponse.json(
        { error: 'Failed to delete questionnaire' },
        { status: 500 }
      )
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