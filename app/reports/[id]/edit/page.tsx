'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '../../../components/Navigation'
import { Tab } from '@headlessui/react'
import QuestionnaireForm from '@/app/components/QuestionnaireForm'
import { Report } from '@/lib/types'
import { ArrowUturnLeftIcon, DocumentTextIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ReportEditPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id
  
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('draft')
  
  // Add selected tab state
  const [selectedTab, setSelectedTab] = useState(0)
  // Add a ref to access the QuestionnaireForm component
  const questionnaireFormRef = useRef<{ saveResponses: () => Promise<void> }>(null)

  // Fetch the report data when the component mounts
  useEffect(() => {
    if (reportId) {
      fetchReport(reportId)
    }
  }, [reportId])

  const fetchReport = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const res = await fetch(`/api/reports/${id}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch report')
      }
      
      const data = await res.json()
      
      // Extract the report object from the response
      const reportData = data.report || data
      console.log('Report data fetched:', reportData)
      
      setReport(reportData)
      // Ensure we set the title from the data, with a fallback to an empty string
      setTitle(reportData.title || '')
      setStatus(reportData.status || 'draft')
    } catch (err) {
      console.error('Error fetching report:', err)
      setError('Error loading report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (preview = false) => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      // First, save questionnaire responses if we're on the questionnaire tab
      if (selectedTab === 1 && questionnaireFormRef.current) {
        try {
          await questionnaireFormRef.current.saveResponses()
        } catch (err) {
          console.error('Error saving questionnaire responses:', err)
          // Continue with report save even if questionnaire save fails
        }
      }

      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          status,
          content: {
            text: '', // Keep an empty string for backward compatibility
            ...(report?.content || {})  // Preserve other content properties
          }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save report')
      }

      // Only show success message if we're not on the questionnaire tab
      // This avoids duplicate success messages
      if (selectedTab === 0) {
        setSuccessMessage('Report saved successfully!')
        
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      }
      
      if (preview) {
        router.push(`/reports/${reportId}/preview`)
      }
    } catch (err) {
      console.error('Error saving report:', err)
      setError('Error saving report. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackToReports = () => {
    router.push('/reports')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center min-w-0">
              <button
                type="button"
                onClick={handleBackToReports}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-4"
              >
                <ArrowUturnLeftIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Edit Report
              </h1>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto mr-3"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                Preview
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{successMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="mt-6 py-8 text-center">Loading report...</div>
          ) : (
            <>
              <div className="mt-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Report Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder={title ? "Edit Report Title" : "Enter a title for your report"}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                          selected
                            ? 'bg-white text-primary-700 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        Guidelines
                      </div>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                          selected
                            ? 'bg-white text-primary-700 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                        Questionnaire
                      </div>
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-2">
                    <Tab.Panel className={classNames('rounded-xl p-3', 'ring-white focus:outline-none')}>
                      <div className="mt-2 bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-800 mb-4">Guidelines for Completing the Sustainability Questionnaire</h3>
                        
                        <div className="space-y-4 text-sm text-blue-700">
                          <p>This sustainability questionnaire is designed to help assess your company's readiness for CSRD (Corporate Sustainability Reporting Directive) compliance. Follow these guidelines to complete it effectively:</p>
                          
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>Navigate through different sections using the numbered buttons at the top of the questionnaire.</li>
                            <li>Answer all questions as accurately as possible based on your current company practices.</li>
                            <li>For questions marked with an asterisk (*), a response is required before saving.</li>
                            <li>Use the "Save Draft" button regularly to save your progress.</li>
                            <li>Once complete, use the "Preview" button to review your responses before final submission.</li>
                          </ol>
                          
                          <p className="mt-4 font-medium">Benefits of completing this questionnaire:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Identify gaps in your sustainability reporting practices</li>
                            <li>Prepare for upcoming CSRD compliance requirements</li>
                            <li>Gain insights into your company's sustainability performance</li>
                            <li>Receive a comprehensive sustainability assessment report</li>
                          </ul>
                          
                          <p className="mt-4">Click on the "Questionnaire" tab to begin answering the questions.</p>
                        </div>
                      </div>
                    </Tab.Panel>
                    <Tab.Panel className={classNames('rounded-xl p-3', 'ring-white focus:outline-none')}>
                      {reportId && <QuestionnaireForm 
                        reportId={reportId} 
                        ref={questionnaireFormRef}
                        onSave={(success) => {
                          if (success) {
                            // Just log success, we don't need to show a message here
                            // since the QuestionnaireForm will show its own message
                            console.log('Questionnaire saved successfully from parent')
                          }
                        }}
                      />}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 