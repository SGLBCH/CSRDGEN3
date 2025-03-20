import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

// Get all questionnaires
export async function GET(request: Request) {
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
    
    const { data: questionnaires, error } = await supabaseAdmin
      .from('questionnaires')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching questionnaires:', error)
      return NextResponse.json(
        { error: 'Error fetching questionnaires' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(questionnaires)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST a new questionnaire
export async function POST(request: Request) {
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
    
    // Parse the request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Title and sections are required' },
        { status: 400 }
      )
    }
    
    const now = new Date().toISOString()
    
    // Prepare insert data
    const insertData = {
      title: body.title,
      description: body.description || null,
      sections: body.sections,
      created_at: now,
      updated_at: now
    }
    
    // Insert the questionnaire
    const { data, error } = await supabaseAdmin
      .from('questionnaires')
      .insert(insertData)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating questionnaire:', error)
      return NextResponse.json(
        { error: 'Failed to create questionnaire' },
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