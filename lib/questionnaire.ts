import { supabase } from './supabaseClient'

type QuestionType = 'number' | 'select' | 'text'

interface Question {
  id: string
  type: QuestionType
  required: boolean
  label: string
  unit?: string
  options?: string[]
}

interface QuestionSection {
  title: string
  questions: Question[]
}

interface Questionnaire {
  id: string
  title: string
  questions: {
    sections: QuestionSection[]
  }
}

interface Answer {
  value: string | number
  unit?: string
}

interface QuestionnaireResponse {
  id: string
  user_id: string
  questionnaire_id: string
  answers: Record<string, Answer>
  created_at: string
  updated_at?: string
}

/**
 * Get an existing response or create a new one for a user and questionnaire
 */
export async function getOrCreateResponse(
  userId: string,
  questionnaireId: string
): Promise<QuestionnaireResponse> {
  // First, try to get an existing response
  const { data: response, error } = await supabase
    .from('responses')
    .select('*')
    .eq('user_id', userId)
    .eq('questionnaire_id', questionnaireId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error code
    throw error
  }

  // If no response exists, create a new one
  if (!response) {
    const { data: newResponse, error: insertError } = await supabase
      .from('responses')
      .insert([
        {
          user_id: userId,
          questionnaire_id: questionnaireId,
          answers: {} // Empty object for storing answers
        }
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return newResponse
  }

  return response
}

/**
 * Validate answers against questionnaire schema
 */
export async function validateAnswers(
  questionnaireId: string,
  answers: Record<string, Answer>
): Promise<boolean> {
  // Get the questionnaire schema
  const { data: questionnaire, error } = await supabase
    .from('questionnaires')
    .select('questions')
    .eq('id', questionnaireId)
    .single()

  if (error) {
    throw error
  }

  const questions = (questionnaire as Questionnaire).questions.sections.flatMap(
    section => section.questions
  )

  // Validate each answer against its question schema
  const errors: string[] = []
  
  questions.forEach(question => {
    const answer = answers[question.id]
    
    // Check required fields
    if (question.required && !answer) {
      errors.push(`Question ${question.id} is required`)
    }

    // Type validation
    if (answer) {
      switch (question.type) {
        case 'number':
          if (typeof answer.value !== 'number') {
            errors.push(`Question ${question.id} must be a number`)
          }
          break
        case 'select':
          if (!question.options?.includes(answer.value as string)) {
            errors.push(`Question ${question.id} must be one of: ${question.options?.join(', ')}`)
          }
          break
        // Add more type validations as needed
      }
    }
  })

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  return true
} 