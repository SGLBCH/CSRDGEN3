'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import { ArrowLeftIcon, PencilIcon, ArrowPathIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import Navigation from '../../../components/Navigation'

interface Report {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  content: any
  questionnaire_id?: string
}

interface Questionnaire {
  id: string
  title: string
  description: string
  sections: {
    id: string
    title: string
    description: string
    questions: {
      id: string
      text: string
      type: string
      required: boolean
      options?: string[]
    }[]
  }[]
}

interface Responses {
  [key: string]: string
}

export default function ReportPreviewPage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [responses, setResponses] = useState<Responses | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [hasQuestionnaire, setHasQuestionnaire] = useState<boolean>(false)
  const [consoleLogMessages, setConsoleLogMessages] = useState<string[]>([])

  // Function to add timestamped console logs for debugging
  const addConsoleLog = (message: string) => {
    console.log(message)
    setConsoleLogMessages(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  // Fetch report data
  const fetchReport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      addConsoleLog(`Fetching report with ID: ${params.id}`)
      const response = await fetch(`/api/reports/${params.id}`)
      
      if (!response.ok) {
        throw new Error(`Error fetching report: ${response.statusText}`)
      }
      
      const reportData = await response.json()
      addConsoleLog(`Report data received: ${JSON.stringify(reportData).substring(0, 100)}...`)
      setReport(reportData)
      
      // Prepare debug info
      const debugInfo = {
        reportId: reportData.id,
        hasContent: !!reportData.content,
        contentKeys: reportData.content ? Object.keys(reportData.content) : [],
        hasQuestionnaireId: !!reportData.questionnaire_id,
        hasResponses: false,
        responseCount: 0
      }
      
      setDebugInfo(debugInfo)
      
      // Always try to fetch responses directly by report ID
      const responseData = await fetchResponses(params.id)
      
      // If responses exist, we need to fetch or create a questionnaire structure
      if (responseData && Object.keys(responseData).length > 0) {
        // Update response status in debug info
        debugInfo.hasResponses = true
        debugInfo.responseCount = Object.keys(responseData).length
        setDebugInfo(debugInfo)
        
        // Try to get questionnaire ID from different possible locations
        let questionnaireId = reportData.questionnaire_id
        
        // If no questionnaire ID in the report, check if it's in the response data
        if (!questionnaireId && responseData.questionnaire_id) {
          questionnaireId = responseData.questionnaire_id
          addConsoleLog(`Found questionnaire ID in responses: ${questionnaireId}`)
        }
        
        // If we have a questionnaire ID, fetch the questionnaire
        if (questionnaireId) {
          try {
            const questionnaireData = await fetchQuestionnaire(questionnaireId)
            setQuestionnaire(questionnaireData)
            setHasQuestionnaire(true)
          } catch (error) {
            console.error('Error fetching questionnaire:', error)
            // Create a minimal questionnaire structure if we can't fetch the real one
            createMinimalQuestionnaireStructure(responseData)
          }
        } else {
          // Create a minimal questionnaire structure if we don't have an ID
          createMinimalQuestionnaireStructure(responseData)
        }
      } else {
        // If no responses, check if there are responses embedded in the report content
        if (reportData.content && typeof reportData.content === 'object') {
          const embeddedResponses = extractEmbeddedResponses(reportData.content)
          if (embeddedResponses && Object.keys(embeddedResponses).length > 0) {
            addConsoleLog(`Found ${Object.keys(embeddedResponses).length} embedded responses in report content`)
            setResponses(embeddedResponses)
            debugInfo.hasResponses = true
            debugInfo.responseCount = Object.keys(embeddedResponses).length
            setDebugInfo(debugInfo)
            
            // Create a minimal questionnaire structure for these embedded responses
            createMinimalQuestionnaireStructure(embeddedResponses)
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching report:', err)
      setError(err.message || 'Error fetching report')
    } finally {
      setIsLoading(false)
    }
  }

  // Extract possible embedded responses from report content
  const extractEmbeddedResponses = (content: any): Responses | null => {
    // Check various possible locations for embedded responses
    if (content.responses && typeof content.responses === 'object') {
      return content.responses
    }
    
    if (content.answers && typeof content.answers === 'object') {
      return content.answers
    }
    
    // If the content itself looks like responses (key-value pairs)
    const possibleResponses: Responses = {}
    let foundResponses = false
    
    Object.entries(content).forEach(([key, value]) => {
      // Skip known metadata keys
      if (['id', 'title', 'status', 'created_at', 'updated_at', 'text'].includes(key)) {
        return
      }
      
      // If it looks like a question ID and has a string or number value
      if (typeof value === 'string' || typeof value === 'number') {
        possibleResponses[key] = String(value)
        foundResponses = true
      } else if (value && typeof value === 'object' && 'value' in value) {
        // Handle format { value: "answer", unit: "unit" }
        possibleResponses[key] = String(value.value)
        foundResponses = true
      }
    })
    
    return foundResponses ? possibleResponses : null
  }

  // Create a minimal questionnaire structure based on responses
  const createMinimalQuestionnaireStructure = (responseData: any) => {
    addConsoleLog('Creating minimal questionnaire structure from responses')
    
    const questions = Object.keys(responseData).map(questionId => {
      // Skip metadata fields that aren't actual responses
      if (['id', 'report_id', 'questionnaire_id', 'created_at', 'updated_at'].includes(questionId)) {
        return null
      }
      
      return {
        id: questionId,
        text: `Question ${questionId}`,
        type: 'text',
        required: false
      }
    }).filter(Boolean)
    
    const minimalQuestionnaire: Questionnaire = {
      id: 'generated',
      title: 'Questionnaire Responses',
      description: 'Generated from responses',
      sections: [{
        id: 'section-1',
        title: 'Responses',
        description: 'Your submitted responses',
        questions: questions as any[]
      }]
    }
    
    setQuestionnaire(minimalQuestionnaire)
    setHasQuestionnaire(true)
    setResponses(responseData)
  }

  // Fetch questionnaire data
  const fetchQuestionnaire = async (questionnaireId: string) => {
    addConsoleLog(`Fetching questionnaire with ID: ${questionnaireId}`)
    const response = await fetch(`/api/questionnaires/${questionnaireId}`)
    
    if (!response.ok) {
      throw new Error(`Error fetching questionnaire: ${response.statusText}`)
    }
    
    const data = await response.json()
    addConsoleLog(`Questionnaire data received with ${data.sections?.length || 0} sections`)
    return data
  }

  // Fetch response data
  const fetchResponses = async (reportId: string) => {
    try {
      addConsoleLog(`Fetching responses for report ID: ${reportId}`)
      const response = await fetch(`/api/responses?reportId=${reportId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          addConsoleLog('No responses found (404)')
          return null
        }
        throw new Error(`Error fetching responses: ${response.statusText}`)
      }
      
      const data = await response.json()
      addConsoleLog(`Responses received: ${Object.keys(data).length} items`)
      
      if (data && data.answers) {
        setResponses(data.answers)
        return data.answers
      }
      
      return data
    } catch (err) {
      console.error('Error fetching responses:', err)
      return null
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Not available';
    }
  }

  // Navigate back to edit page
  const handleBackToEdit = () => {
    router.push(`/reports/${params.id}/edit`)
  }

  // Render a question and its response
  const renderQuestionAndResponse = (question: any, response: string | undefined) => {
    return (
      <div key={question.id} className="mb-6 border-b pb-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {response ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-500" />
          )}
        </div>
        
        <div className="mt-2">
          {response ? (
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <p className="text-gray-800">{response}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No response provided</p>
          )}
        </div>
      </div>
    )
  }

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchReport()
    }
  }, [user, params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading report</h3>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => router.push('/reports')}
            className="flex items-center text-primary-600 hover:text-primary-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Reports
          </button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Report not found</h2>
            <p className="mt-1 text-sm text-gray-500">The report you're looking for doesn't exist or you don't have permission to view it.</p>
            <button 
              onClick={() => router.push('/reports')}
              className="mt-4 flex items-center mx-auto text-primary-600 hover:text-primary-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Preview banner */}
      <div className="bg-blue-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <EyeIcon className="h-6 w-6 text-white mr-2" aria-hidden="true" />
              <h1 className="text-lg font-medium text-white">You are viewing a preview of your completed questionnaire</h1>
            </div>
            <button
              onClick={handleBackToEdit}
              className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
            >
              Back to Edit
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => router.push('/reports')}
          className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Reports
        </button>
        
        <div className="flex justify-end mb-4">
          <button
            onClick={handleBackToEdit}
            className="flex items-center space-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit Report</span>
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-2">
                {report.status}
              </span>
              Created: {formatDate(report.created_at)}
              {report.created_at !== report.updated_at && (
                <span className="ml-2">
                  Last updated: {formatDate(report.updated_at)}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Debug information (only shown in development) */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <details className="mb-6 border rounded-md">
            <summary className="bg-gray-100 px-4 py-2 cursor-pointer flex items-center">
              <span className="text-sm font-medium text-gray-700">Debug Information</span>
            </summary>
            <div className="p-4 bg-gray-50">
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              <div className="mt-4">
                <button
                  onClick={fetchReport}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-800"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Retry fetch
                </button>
              </div>
            </div>
          </details>
        )}
        
        {/* Questionnaire responses section */}
        {hasQuestionnaire && questionnaire && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {questionnaire.title}
              </h3>
              {questionnaire.description && (
                <p className="mt-1 text-sm text-gray-500">{questionnaire.description}</p>
              )}
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              {questionnaire.sections.map((section, index) => (
                <div key={section.id || index} className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">{section.title}</h4>
                  {section.description && (
                    <p className="text-sm text-gray-500 mb-6">{section.description}</p>
                  )}
                  
                  <div className="space-y-6">
                    {section.questions.map((question) => (
                      renderQuestionAndResponse(
                        question,
                        responses ? responses[question.id] : undefined
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No responses message */}
        {!hasQuestionnaire && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No questionnaire responses found for this report. Please return to the editor to complete the questionnaire.
                </p>
                <div className="mt-4">
                  <div className="flex">
                    <button
                      type="button"
                      className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
                      onClick={fetchReport}
                    >
                      Retry fetch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 