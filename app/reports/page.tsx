'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import Navigation from '../components/Navigation'
import {
  DocumentTextIcon,
  PlusIcon,
  ArrowPathIcon,
  DocumentPlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'

interface Report {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  content: any
}

export default function ReportsPage() {
  const { user, isLoading: isUserLoading } = useUser()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReportTitle, setNewReportTitle] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  // Load reports when component mounts
  useEffect(() => {
    if (!isUserLoading && user) {
      fetchReports()
    }
  }, [user, isUserLoading])

  // Add client-side payment verification
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        // If the API returns a 402 Payment Required status, redirect to pricing
        if (response.status === 402) {
          console.log('User payment required, redirecting to pricing page');
          router.push('/pricing');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };
    
    if (user) {
      checkPaymentStatus();
    }
  }, [user, router]);

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Add debug info
      console.log('Fetching reports with user:', user?.email)
      
      const response = await fetch('/api/reports')
      const data = await response.json()
      
      // Store debug info
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        responseData: data
      })
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports')
      }
      
      console.log('Reports fetched:', data.reports)
      setReports(data.reports || [])
    } catch (err: any) {
      console.error('Error fetching reports:', err)
      setError(err.message || 'An error occurred while fetching reports')
    } finally {
      setIsLoading(false)
    }
  }

  // Add debug refresh function
  const handleRefreshReports = () => {
    fetchReports()
  }

  const handleCreateReport = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const title = newReportTitle.trim() || 'Untitled Report'
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create report')
      }
      
      // Navigate to the edit page for the new report
      router.push(`/reports/${data.report.id}/edit`)
    } catch (err: any) {
      console.error('Error creating report:', err)
      setError(err.message || 'An error occurred while creating the report')
      setIsSubmitting(false)
    }
  }

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return
    }
    
    try {
      setError(null)
      
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete report')
      }
      
      // Remove the deleted report from the list
      setReports(reports.filter(report => report.id !== id))
    } catch (err: any) {
      console.error('Error deleting report:', err)
      setError(err.message || 'An error occurred while deleting the report')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  // Handle not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Not logged in</h3>
              <p className="mt-1 text-sm text-gray-500">Please log in to view your reports.</p>
              <div className="mt-6">
                <a
                  href="/api/auth/login?returnTo=/reports"
                  className="inline-flex items-center rounded-md bg-primary-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
                >
                  Log In
                </a>
              </div>
            </div>
            
            {/* New member information section */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <h3 className="text-base font-medium text-gray-900">Not a member yet?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Discover how our CSRD reporting tool can help your business meet sustainability reporting requirements efficiently and affordably.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/pricing"
                  className="inline-flex items-center rounded-md bg-primary-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
                >
                  View Pricing
                </a>
                <a
                  href="/pricing#faq"
                  className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm ring-1 ring-inset ring-primary-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Read FAQ
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <div className="flex space-x-3">
              <button
                onClick={handleRefreshReports}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center">
                  <ArrowPathIcon className="mr-1 h-5 w-5" />
                  Refresh
                </span>
              </button>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="rounded-md bg-primary-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
              >
                <span className="flex items-center">
                  <PlusIcon className="mr-1 h-5 w-5" />
                  New Report
                </span>
              </button>
            </div>
          </div>
          
          {/* Create Report Form */}
          {isCreating && (
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">Create New Report</h2>
              <div className="mt-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Report Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="Enter report title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="mr-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateReport}
                  disabled={isSubmitting}
                  className="rounded-md bg-primary-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
                >
                  {isSubmitting ? 'Creating...' : 'Create Report'}
                </button>
              </div>
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
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
          )}
          
          {/* Debug Info (commented out as it's no longer needed) */}
          {/* 
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-6 rounded-lg bg-gray-100 p-4">
              <h3 className="text-sm font-semibold">Debug Info</h3>
              <div className="mt-2 text-xs">
                <p>Status: {debugInfo.status} {debugInfo.statusText}</p>
                <p>User Email: {user?.email}</p>
                <pre className="mt-2 overflow-auto bg-gray-200 p-2">
                  {JSON.stringify(debugInfo.responseData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          */}
          
          {/* Reports List */}
          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new report.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center rounded-md bg-primary-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    New Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-md bg-white shadow">
                <ul role="list" className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <li key={report.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center">
                          <div className="flex-shrink-0">
                            <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1 px-4">
                            <div>
                              <p className="truncate text-sm font-medium text-primary-800">{report.title}</p>
                              <div className="mt-1 flex">
                                <p className="text-xs text-gray-500 truncate">
                                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    {report.status}
                                  </span>
                                  <span className="ml-2">
                                    Created: {formatDate(report.created_at)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="relative group">
                            <button
                              onClick={() => router.push(`/reports/${report.id}/edit`)}
                              className="rounded-md bg-white p-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:bg-gray-100 group-hover:text-primary-800 transition-colors duration-200"
                              aria-label="Edit Report"
                            >
                              <PencilIcon className="h-5 w-5 group-hover:text-primary-800 transition-colors duration-200" />
                            </button>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => router.push(`/reports/${report.id}/generate`)}
                              className="rounded-md bg-white p-2 text-sm font-semibold text-green-600 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:bg-green-50 group-hover:text-green-700 transition-colors duration-200"
                              aria-label="Generate Report"
                            >
                              <DocumentChartBarIcon className="h-5 w-5 group-hover:text-green-700 transition-colors duration-200" />
                            </button>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => {
                                // Directly trigger file download without navigating
                                window.location.href = `/api/reports/${report.id}/download`;
                              }}
                              className="rounded-md bg-white p-2 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-200"
                              aria-label="Download Report"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5 group-hover:text-blue-700 transition-colors duration-200" />
                            </button>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="rounded-md bg-white p-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:bg-red-50 group-hover:text-red-700 transition-colors duration-200"
                              aria-label="Delete Report"
                            >
                              <TrashIcon className="h-5 w-5 group-hover:text-red-700 transition-colors duration-200" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 