import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'

// Define the environment variable for OpenAI API key
// In production, this should be set in your environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(req: Request) {
  try {
    // Check if the user is authenticated
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await req.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional sustainability reporting expert specializing in CSRD compliance for SMEs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: 'Error calling OpenAI API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const generatedContent = data.choices[0]?.message?.content || 'No content generated'

    return NextResponse.json({ content: generatedContent })
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