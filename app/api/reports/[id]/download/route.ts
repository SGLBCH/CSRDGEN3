import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

// Define custom interfaces for the flexible questionnaire structure
interface ExtendedQuestion {
  id?: string;
  text?: string;
  type?: string;
  required?: boolean;
  options?: string[];
  unit?: string;
  question_id?: string;
  question_text?: string;
  question_type?: string;
}

interface ExtendedSection {
  id?: string;
  title?: string;
  description?: string;
  questions?: ExtendedQuestion[];
  section?: string;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Reports API] Download questionnaire request received', { id: params.id })
    
    // Get the session to check authentication
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
    
    // Fetch the questionnaire
    const { data: questionnaires, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (questionnaireError || !questionnaires || questionnaires.length === 0) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }
    
    const questionnaire = questionnaires[0]
    
    // Fetch responses for the report
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('report_id', params.id)
    
    if (responsesError) {
      console.error('Error fetching responses:', responsesError)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }
    
    // Transform responses into a map for easy access
    const responseMap: Record<string, string> = {}
    responses.forEach(response => {
      responseMap[response.question_id] = response.response_value
    })
    
    // Format the questionnaire data and responses into a text file
    let textContent = `# Questionnaire Responses for "${report.title}"\n`;
    textContent += `# Generated on ${new Date().toLocaleString()}\n\n`;
    
    // Determine questionnaire structure - handle both old and new formats
    let sections: ExtendedSection[] = [];
    
    if (questionnaire.sections && Array.isArray(questionnaire.sections)) {
      // New format with sections array directly on questionnaire
      sections = questionnaire.sections;
    } else if (questionnaire.questions && questionnaire.questions.sections && 
               Array.isArray(questionnaire.questions.sections)) {
      // Old format with sections inside questions object
      sections = questionnaire.questions.sections;
    } else {
      return NextResponse.json(
        { error: 'Invalid questionnaire format' },
        { status: 500 }
      );
    }
    
    // Iterate through sections and questions
    sections.forEach((section: ExtendedSection, sectionIndex: number) => {
      const sectionTitle = section.title || section.section || `Section ${sectionIndex + 1}`;
      textContent += `## ${sectionTitle}\n\n`;
      
      // Handle both question formats
      const questions = section.questions || [];
      
      questions.forEach((question: ExtendedQuestion) => {
        const questionId = question.id || question.question_id;
        const questionText = question.text || question.question_text;
        
        if (questionId && questionText) {
          // Add the question text
          textContent += `Q: ${questionText}\n`;
          
          // Add the response or N/A if not answered
          const response = responseMap[questionId] || 'N/A';
          textContent += `A: ${response}\n\n`;
        }
      });
    });
    
    // Create a NextResponse with the text content
    const response = new NextResponse(textContent);
    
    // Set the appropriate headers
    response.headers.set('Content-Type', 'text/plain; charset=utf-8');
    response.headers.set('Content-Disposition', `attachment; filename="questionnaire-${report.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt"`);
    
    return response;
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