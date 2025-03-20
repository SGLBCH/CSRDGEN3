'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Questionnaire } from '@/lib/types'

export default function QuestionnairesAdminPage() {
  const router = useRouter()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestionnaires()
  }, [])

  const fetchQuestionnaires = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const res = await fetch('/api/questionnaires')
      
      if (!res.ok) {
        throw new Error('Failed to fetch questionnaires')
      }
      
      const data = await res.json()
      setQuestionnaires(data)
    } catch (err) {
      console.error('Error fetching questionnaires:', err)
      setError('Error loading questionnaires. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this questionnaire? This action cannot be undone.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/questionnaires/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete questionnaire')
      }
      
      // Refresh the list
      await fetchQuestionnaires()
    } catch (err) {
      console.error('Error deleting questionnaire:', err)
      setError('Error deleting questionnaire. Please try again.')
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/questionnaires/${id}/edit`)
  }

  const handleCreate = () => {
    router.push('/admin/questionnaires/new')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Questionnaires
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage questionnaires for CSRD reports
              </p>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Questionnaire
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

          {isLoading ? (
            <div className="mt-6 py-8 text-center">Loading questionnaires...</div>
          ) : (
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Title
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Sections
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Questions
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Last Updated
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {questionnaires.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 px-6 text-center text-sm text-gray-500">
                              No questionnaires found. Create your first one!
                            </td>
                          </tr>
                        ) : (
                          questionnaires.map((questionnaire) => {
                            // Count total questions
                            const totalQuestions = questionnaire.sections.reduce(
                              (count, section) => count + section.questions.length,
                              0
                            )
                            
                            return (
                              <tr key={questionnaire.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {questionnaire.title}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {questionnaire.sections.length}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {totalQuestions}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {questionnaire.updated_at ? new Date(questionnaire.updated_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => handleEdit(questionnaire.id)}
                                      className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    >
                                      <PencilIcon className="mr-1 h-4 w-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(questionnaire.id)}
                                      className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                      <TrashIcon className="mr-1 h-4 w-4 text-red-500" />
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 