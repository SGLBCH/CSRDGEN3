'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import { ArrowLeftIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Navigation from '../../components/Navigation'

interface Report {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  content: any
}

export default function ReportViewPage({ params }: { params: { id: string } }) {
  const { user, isLoading: isUserLoading } = useUser()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading && user && params.id) {
      fetchReport()
    }
  }, [user, isUserLoading, params.id])

  const fetchReport = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/reports/${params.id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch report')
      }
      
      setReport(data.report)
    } catch (err: any) {
      console.error('Error fetching report:', err)
      setError(err.message || 'An error occurred while fetching the report')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <div className="flex flex-1 items-center justify-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top navigation */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => router.push('/reports')}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-1 h-5 w-5" />
              Back to Reports
            </button>
            
            {report && (
              <button
                onClick={() => router.push(`/reports/${params.id}/edit`)}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Edit Report
              </button>
            )}
          </div>
          
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          ) : report ? (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              {/* Report header */}
              <div className="border-b border-gray-200 px-6 py-5">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-x-1">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      {report.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(report.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span> {formatDate(report.updated_at)}
                  </div>
                </div>
              </div>
              
              {/* Report content */}
              <div className="px-6 py-5">
                {report.content && typeof report.content === 'object' ? (
                  <div className="prose max-w-none">
                    {/* Display report content here based on its structure */}
                    {Object.keys(report.content).length === 0 ? (
                      <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              This report has no content yet. Click the "Edit Report" button to start building your report.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h2 className="text-lg font-medium">Report Content</h2>
                        <pre className="overflow-auto rounded-md bg-gray-50 p-4 text-sm">
                          {JSON.stringify(report.content, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          This report has no valid content structure. Click the "Edit Report" button to update your report.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Report not found. It may have been deleted or you may not have permission to view it.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 