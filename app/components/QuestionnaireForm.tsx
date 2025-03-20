'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Questionnaire, Question, Section, ResponseMap } from '@/lib/types'
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface QuestionnaireFormProps {
  reportId: string
  onSave?: (success: boolean) => void
}

// Create an extended section interface to handle both formats
interface ExtendedSection extends Omit<Section, 'questions'> {
  section?: string; // For alternative format where section is used instead of title
  description?: string;
  questions?: Question[]; // Make questions optional
}

// Create an extended question interface to handle different formats
interface ExtendedQuestion extends Question {
  question?: string; // Alternative to 'text' in some formats
  question_id?: string;
  question_text?: string;
  question_type?: string;
}

// Source format interfaces
interface SourceSection {
  section: string;
  description?: string;
  questions: SourceQuestion[];
}

interface SourceQuestion {
  question_id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  options: string[] | null;
  unit?: string | null;
}

// Make the component use forwardRef to expose methods to parent components
const QuestionnaireForm = forwardRef<
  { saveResponses: () => Promise<void> },
  QuestionnaireFormProps
>(function QuestionnaireForm({ reportId, onSave }, ref) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [activeSection, setActiveSection] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [questionnaireDebug, setQuestionnaireDebug] = useState<any>(null)

  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/questionnaires')
        
        if (!response.ok) {
          throw new Error(`Error fetching questionnaire: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Questionnaire raw data:', data)
        
        if (!data || data.length === 0) {
          setError('No questionnaires found in the database')
          setIsLoading(false)
          return
        }
        
        // Always use the first questionnaire
        let questionnaireData = data[0]
        // Store raw data for debugging
        setQuestionnaireDebug(questionnaireData)
        console.log('Using questionnaire:', questionnaireData)
        console.log('Questions property:', questionnaireData.questions)
        console.log('Sections property:', questionnaireData.sections)
        
        // Deep log of structure
        if (questionnaireData.questions) {
          console.log('Questions object keys:', Object.keys(questionnaireData.questions))
          if (questionnaireData.questions.sections) {
            console.log('Found questions.sections:', questionnaireData.questions.sections)
            console.log('First section in questions.sections:', questionnaireData.questions.sections[0])
          }
        }
        
        // SPECIAL HANDLING FOR CSRD SME QUESTIONNAIRE FORMAT
        // This format has:
        // 1. A 'questions' object containing a 'sections' array where each section has:
        //    - A 'section' property (not 'title')
        //    - Questions with 'question_id', 'question_text', etc.
        // 2. A 'sections' property that's just an array of section names
        
        // Create restructured questionnaire
        const restructuredQuestionnaire = {
          ...questionnaireData,
          sections: []
        };
        
        // Parse sections if it's a string (happens when stored as JSONB in Postgres)
        let parsedSections = null;
        if (questionnaireData.sections && typeof questionnaireData.sections === 'string') {
          try {
            parsedSections = JSON.parse(questionnaireData.sections);
            console.log('Parsed sections string:', parsedSections);
          } catch (e) {
            console.error('Error parsing sections JSON string:', e);
          }
        } else if (questionnaireData.sections && typeof questionnaireData.sections === 'object') {
          // If it's already an object, use directly
          parsedSections = questionnaireData.sections;
          console.log('Sections is already an object:', parsedSections);
        }
        
        // Try to use questions.sections array if exists (primary approach)
        if (questionnaireData.questions && 
            questionnaireData.questions.sections && 
            Array.isArray(questionnaireData.questions.sections)) {
            
          console.log('Restructuring from questions.sections format');
          
          // Map the sections from the questions.sections format to the expected format
          restructuredQuestionnaire.sections = questionnaireData.questions.sections.map((section: SourceSection, index: number) => {
            return {
              id: `section-${index}`,
              title: section.section || `Section ${index + 1}`,
              description: section.description || '',
              questions: (section.questions || []).map((q: SourceQuestion, qIndex: number) => {
                return {
                  id: q.question_id || `question-${qIndex}`,
                  text: q.question_text || '',
                  type: q.question_type || 'text',
                  required: q.required || false,
                  options: q.options || [],
                  unit: q.unit || null
                };
              })
            };
          });
        } 
        // If the above didn't work, try with the parsed sections if available
        else if (parsedSections) {
          console.log('Using parsed sections format');
          
          // Check if parsedSections has a nested sections array
          if (parsedSections.sections && Array.isArray(parsedSections.sections)) {
            restructuredQuestionnaire.sections = parsedSections.sections.map((sectionName: string, index: number) => {
              return {
                id: `section-${index}`,
                title: sectionName,
                questions: [] // No questions directly available in this format
              };
            });
          } 
          // Or if it's directly an array
          else if (Array.isArray(parsedSections)) {
            restructuredQuestionnaire.sections = parsedSections.map((sectionName: string, index: number) => {
              return {
                id: `section-${index}`,
                title: sectionName,
                questions: [] // No questions directly available in this format
              };
            });
          }
        }
        // Last resort - try to derive sections from the questions structure if possible
        else if (questionnaireData.questions && typeof questionnaireData.questions === 'object') {
          console.log('Attempting to derive sections from questions object');
          
          // Check if questions is a nested object with first-level keys that could be section titles
          const keys = Object.keys(questionnaireData.questions);
          if (keys.length > 0 && typeof questionnaireData.questions[keys[0]] === 'object') {
            restructuredQuestionnaire.sections = keys.map((sectionKey, index) => {
              const sectionQuestions = questionnaireData.questions[sectionKey];
              // Check if the section contains an array of questions or is itself an object with question properties
              if (Array.isArray(sectionQuestions)) {
                return {
                  id: `section-${index}`,
                  title: sectionKey,
                  questions: sectionQuestions.map((q: any, qIndex: number) => ({
                    id: q.id || q.question_id || `question-${qIndex}`,
                    text: q.text || q.question_text || '',
                    type: q.type || q.question_type || 'text',
                    required: q.required || false,
                    options: q.options || [],
                    unit: q.unit || null
                  }))
                };
              } else {
                // If not an array, treat the object properties as question fields
                return {
                  id: `section-${index}`,
                  title: sectionKey,
                  questions: [{
                    id: `question-${index}-0`,
                    text: sectionQuestions.text || sectionQuestions.question_text || sectionKey,
                    type: sectionQuestions.type || sectionQuestions.question_type || 'text',
                    required: sectionQuestions.required || false,
                    options: sectionQuestions.options || [],
                    unit: sectionQuestions.unit || null
                  }]
                };
              }
            });
          }
        }
        
        console.log('Restructured questionnaire:', restructuredQuestionnaire);
        console.log('Restructured sections:', restructuredQuestionnaire.sections);
        
        // Final validation
        if (!restructuredQuestionnaire.sections || 
            !Array.isArray(restructuredQuestionnaire.sections) || 
            restructuredQuestionnaire.sections.length === 0) {
          console.error('Unable to create valid sections structure from data:', questionnaireData);
          setError('Could not create a valid questionnaire structure. Please check the database format.');
          setIsLoading(false);
          return;
        }
        
        // Set the restructured questionnaire
        setQuestionnaire(restructuredQuestionnaire);
        
        // Initialize responses for each question
        await fetchResponses(restructuredQuestionnaire, reportId);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
        setError('Failed to load questionnaire. Please try again later.');
        setIsLoading(false);
      }
    }

    if (reportId) {
      fetchQuestionnaire()
    }
  }, [reportId])

  // Fetch existing responses
  const fetchResponses = async (questionnaire: Questionnaire, reportId: string) => {
    try {
      const res = await fetch(`/api/responses?reportId=${reportId}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch responses')
      }
      
      const data = await res.json()
      console.log('Fetched responses data:', data)
      
      const responseMap: ResponseMap = {}
      
      // Initialize with empty responses
      if (questionnaire && questionnaire.sections) {
        questionnaire.sections.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              responseMap[question.id] = ''
            })
          }
        })
      }
      
      // Add any existing responses
      if (data && typeof data === 'object') {
        // The API now returns a map of question_id -> response_value
        Object.entries(data).forEach(([questionId, value]) => {
          responseMap[questionId] = value as string
        })
      }
      
      console.log('Final responseMap:', responseMap)
      setResponses(responseMap)
    } catch (err) {
      console.error('Error fetching responses:', err)
      // Continue without responses - they'll be created when saved
    }
  }

  // Handle input changes
  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Save responses
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      if (!questionnaire) {
        throw new Error('No questionnaire loaded')
      }

      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          questionnaireId: questionnaire.id,
          responses
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save responses')
      }

      setSuccessMessage('Responses saved successfully')
      
      // Also update the report content with the responses
      await updateReportContent()
      
      if (onSave) {
        onSave(true)
      }
    } catch (err) {
      console.error('Error saving responses:', err)
      setError('Error saving responses. Please try again.')
      if (onSave) {
        onSave(false)
      }
    } finally {
      setIsSaving(false)
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    }
  }

  // Update the report content with the responses
  const updateReportContent = async () => {
    try {
      // Format responses for saving to report content
      const formattedResponses: any = {}
      
      if (questionnaire) {
        questionnaire.sections.forEach(section => {
          section.questions.forEach(question => {
            if (responses[question.id]) {
              formattedResponses[question.id] = responses[question.id]
            }
          })
        })
      }
      
      // Update the report with the responses in the content field
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: {
            responses: formattedResponses
          }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update report content')
      }
    } catch (err) {
      console.error('Error updating report content:', err)
      // Don't set an error message here as this is a secondary operation
    }
  }

  // Navigate to the next section
  const handleNextSection = () => {
    if (questionnaire && activeSection < questionnaire.sections.length - 1) {
      setActiveSection(activeSection + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to the previous section
  const handlePreviousSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1)
      window.scrollTo(0, 0)
    }
  }

  // Render question based on type
  const renderQuestion = (question: ExtendedQuestion) => {
    console.log('Rendering question:', question);
    
    // Extract question details with fallbacks
    const questionId = question.id;
    const questionText = question.text || question.question || 'Unnamed Question';
    const questionType = question.type || 'text';
    const isRequired = question.required === true;
    const options = question.options || [];
    
    // Render appropriate input based on question type
    switch (questionType) {
      case 'text':
        return (
          <textarea
            id={questionId}
            name={questionId}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={responses[questionId] || ''}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={isRequired}
          />
        )
      
      case 'number':
        return (
          <div className="flex rounded-md shadow-sm">
            <input
              type="number"
              id={questionId}
              name={questionId}
              value={responses[questionId] || ''}
              onChange={(e) => handleInputChange(questionId, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter a number"
              required={isRequired}
            />
            {question.unit && (
              <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                {question.unit}
              </span>
            )}
          </div>
        )
      
      case 'select':
        return (
          <select
            id={questionId}
            name={questionId}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={responses[questionId] || ''}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={isRequired}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id={`${questionId}-yes`}
                type="radio"
                name={questionId}
                value="true"
                checked={responses[questionId] === 'true'}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                required={isRequired}
              />
              <label htmlFor={`${questionId}-yes`} className="ml-2 block text-sm text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id={`${questionId}-no`}
                type="radio"
                name={questionId}
                value="false"
                checked={responses[questionId] === 'false'}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                required={isRequired}
              />
              <label htmlFor={`${questionId}-no`} className="ml-2 block text-sm text-gray-700">
                No
              </label>
            </div>
          </div>
        )
      
      default:
        return <p>Unsupported question type</p>
    }
  }

  // Expose methods to parent components using ref
  useImperativeHandle(ref, () => ({
    saveResponses: async () => {
      await handleSave();
    }
  }));

  if (isLoading) {
    return <div className="py-6">Loading questionnaire...</div>
  }

  if (error) {
    return (
      <div>
        <div className="rounded-md bg-red-50 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Information</h3>
          <p className="text-xs text-gray-600 mb-4">The following is the raw questionnaire structure received from the server:</p>
          <details>
            <summary className="text-xs font-medium text-blue-600 cursor-pointer">Click to show/hide raw data</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-96 bg-gray-100 p-2 rounded">
              {JSON.stringify(questionnaireDebug || {}, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  if (!questionnaire) {
    return <div className="py-6">No questionnaire available. Please ensure you have run the sample questionnaire SQL script in the Supabase SQL Editor.</div>
  }

  // Get current section
  if (!questionnaire.sections || !Array.isArray(questionnaire.sections) || questionnaire.sections.length === 0) {
    return <div className="py-6">The questionnaire does not contain any sections. Please check the database structure.</div>
  }
  
  // Check if activeSection is out of bounds
  if (activeSection < 0 || activeSection >= questionnaire.sections.length) {
    setActiveSection(0) // Reset to first section
    return <div className="py-6">Loading section...</div>
  }
  
  const currentSection = questionnaire.sections[activeSection] as ExtendedSection
  
  // Handle different section formats - old format uses title/questions, new might use section/questions
  const sectionTitle = currentSection.title || currentSection.section || "Untitled Section"
  const sectionQuestions = currentSection.questions || []
  const sectionDescription = currentSection.description || ""
  
  console.log('Current section:', currentSection)
  console.log('Section title:', sectionTitle)
  console.log('Section questions:', sectionQuestions)

  return (
    <div className="space-y-6">
      {/* Section navigation */}
      <nav className="flex items-center justify-center" aria-label="Progress">
        <ol className="flex items-center space-x-5">
          {questionnaire.sections.map((section, index) => (
            <li key={section.id || `section-${index}`}>
              <button
                onClick={() => setActiveSection(index)}
                className={`relative flex items-center justify-center ${
                  index === activeSection
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                } rounded-full h-8 w-8 text-sm font-medium`}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Section title */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{sectionTitle}</h3>
        {sectionDescription && (
          <p className="mt-2 text-sm text-gray-500">{sectionDescription}</p>
        )}
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {sectionQuestions.map((question) => {
          const q = question as ExtendedQuestion;
          return (
            <div key={q.id} className="space-y-2">
              <label
                htmlFor={q.id}
                className="block text-sm font-medium text-gray-700"
              >
                {q.text || q.question || 'Unnamed Question'} 
                {q.required && <span className="text-red-500">*</span>}
              </label>
              {renderQuestion(q)}
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-5">
        <button
          type="button"
          onClick={handlePreviousSection}
          disabled={activeSection === 0}
          className={`rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            activeSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Previous
        </button>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isSaving ? 'Saving...' : 'Save Responses'}
          </button>
          
          {activeSection < questionnaire.sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isSaving ? 'Submitting...' : 'Complete Questionnaire'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default QuestionnaireForm; 