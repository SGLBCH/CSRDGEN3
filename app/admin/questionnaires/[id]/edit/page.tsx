'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '../../../../components/Navigation'
import { ArrowUturnLeftIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Questionnaire, Section, Question } from '@/lib/types'

export default function EditQuestionnairePage() {
  const params = useParams()
  const router = useRouter()
  const questionnaireId = Array.isArray(params.id) ? params.id[0] : params.id
  const isNew = questionnaireId === 'new'
  
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchQuestionnaire(questionnaireId)
    } else {
      // Initialize with a blank section
      setSections([{
        id: `section-${Date.now()}`,
        title: 'Untitled Section',
        description: '',
        questions: []
      }])
    }
  }, [questionnaireId, isNew])

  const fetchQuestionnaire = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const res = await fetch(`/api/questionnaires/${id}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch questionnaire')
      }
      
      const data = await res.json()
      setQuestionnaire(data)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setSections(data.sections || [])
    } catch (err) {
      console.error('Error fetching questionnaire:', err)
      setError('Error loading questionnaire. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const payload = {
        title,
        description,
        sections
      }

      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/questionnaires' : `/api/questionnaires/${questionnaireId}`
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error(`Failed to ${isNew ? 'create' : 'update'} questionnaire`)
      }

      const data = await res.json()
      
      setSuccessMessage(`Questionnaire ${isNew ? 'created' : 'updated'} successfully!`)
      
      if (isNew) {
        // Redirect to edit page for the new questionnaire
        router.push(`/admin/questionnaires/${data.id}/edit`)
      }
    } catch (err) {
      console.error('Error saving questionnaire:', err)
      setError(`Error ${isNew ? 'creating' : 'updating'} questionnaire. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: 'Untitled Section',
        description: '',
        questions: []
      }
    ])
  }

  const handleUpdateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...sections]
    newSections[index] = {
      ...newSections[index],
      [field]: value
    }
    setSections(newSections)
  }

  const handleDeleteSection = (index: number) => {
    if (!confirm('Are you sure you want to delete this section and all its questions?')) {
      return
    }
    
    const newSections = [...sections]
    newSections.splice(index, 1)
    setSections(newSections)
  }

  const handleAddQuestion = (sectionIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].questions.push({
      id: `question-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: 'New Question',
      type: 'text',
      required: false,
      options: []
    })
    setSections(newSections)
  }

  const handleUpdateQuestion = (sectionIndex: number, questionIndex: number, field: keyof Question, value: any) => {
    const newSections = [...sections]
    newSections[sectionIndex].questions[questionIndex] = {
      ...newSections[sectionIndex].questions[questionIndex],
      [field]: value
    }
    setSections(newSections)
  }

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].questions.splice(questionIndex, 1)
    setSections(newSections)
  }

  const handleAddOption = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...sections]
    const question = newSections[sectionIndex].questions[questionIndex]
    
    if (!question.options) {
      question.options = []
    }
    
    question.options.push(`Option ${question.options.length + 1}`)
    setSections(newSections)
  }

  const handleUpdateOption = (sectionIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const newSections = [...sections]
    const question = newSections[sectionIndex].questions[questionIndex]
    
    if (question.options) {
      question.options[optionIndex] = value
      setSections(newSections)
    }
  }

  const handleDeleteOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const newSections = [...sections]
    const question = newSections[sectionIndex].questions[questionIndex]
    
    if (question.options) {
      question.options.splice(optionIndex, 1)
      setSections(newSections)
    }
  }

  const handleBackToList = () => {
    router.push('/admin/questionnaires')
  }

  const renderQuestionForm = (question: Question, sectionIndex: number, questionIndex: number) => {
    return (
      <div key={question.id} className="border border-gray-200 rounded-md p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-md font-medium text-gray-900">Question {questionIndex + 1}</h4>
          <button
            type="button"
            onClick={() => handleDeleteQuestion(sectionIndex, questionIndex)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor={`question-${sectionIndex}-${questionIndex}-text`} className="block text-sm font-medium text-gray-700">
            Question Text
          </label>
          <input
            type="text"
            id={`question-${sectionIndex}-${questionIndex}-text`}
            value={question.text}
            onChange={(e) => handleUpdateQuestion(sectionIndex, questionIndex, 'text', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor={`question-${sectionIndex}-${questionIndex}-type`} className="block text-sm font-medium text-gray-700">
            Question Type
          </label>
          <select
            id={`question-${sectionIndex}-${questionIndex}-type`}
            value={question.type}
            onChange={(e) => handleUpdateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
            <option value="boolean">Yes/No</option>
          </select>
        </div>
        
        {question.type === 'number' && (
          <div className="mb-4">
            <label htmlFor={`question-${sectionIndex}-${questionIndex}-unit`} className="block text-sm font-medium text-gray-700">
              Unit (optional)
            </label>
            <input
              type="text"
              id={`question-${sectionIndex}-${questionIndex}-unit`}
              value={question.unit || ''}
              onChange={(e) => handleUpdateQuestion(sectionIndex, questionIndex, 'unit', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="e.g. kg, %, €"
            />
          </div>
        )}
        
        {question.type === 'select' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Options</label>
              <button
                type="button"
                onClick={() => handleAddOption(sectionIndex, questionIndex)}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Add Option
              </button>
            </div>
            
            {question.options && question.options.length > 0 ? (
              <ul className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex} className="flex items-center">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(sectionIndex, questionIndex, optionIndex)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No options added yet.</p>
            )}
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`question-${sectionIndex}-${questionIndex}-required`}
            checked={question.required}
            onChange={(e) => handleUpdateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor={`question-${sectionIndex}-${questionIndex}-required`} className="ml-2 block text-sm text-gray-700">
            Required
          </label>
        </div>
      </div>
    )
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
                onClick={handleBackToList}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-4"
              >
                <ArrowUturnLeftIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                {isNew ? 'Create Questionnaire' : 'Edit Questionnaire'}
              </h1>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                {isSaving ? 'Saving...' : 'Save Questionnaire'}
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
            <div className="mt-6 py-8 text-center">Loading questionnaire...</div>
          ) : (
            <div className="mt-6 space-y-6 bg-white p-6 shadow sm:rounded-md">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Questionnaire Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="e.g. CSRD Environmental Report"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Provide a brief description of this questionnaire"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Sections</h3>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <PlusCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                    Add Section
                  </button>
                </div>
                
                {sections.length === 0 ? (
                  <p className="text-sm text-gray-500">No sections added yet. Click "Add Section" to get started.</p>
                ) : (
                  <div className="space-y-8">
                    {sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Section {sectionIndex + 1}</h3>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sectionIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor={`section-${sectionIndex}-title`} className="block text-sm font-medium text-gray-700">
                            Section Title
                          </label>
                          <input
                            type="text"
                            id={`section-${sectionIndex}-title`}
                            value={section.title}
                            onChange={(e) => handleUpdateSection(sectionIndex, 'title', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        
                        <div className="mb-6">
                          <label htmlFor={`section-${sectionIndex}-description`} className="block text-sm font-medium text-gray-700">
                            Section Description (optional)
                          </label>
                          <textarea
                            id={`section-${sectionIndex}-description`}
                            value={section.description}
                            onChange={(e) => handleUpdateSection(sectionIndex, 'description', e.target.value)}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-md font-medium text-gray-900">Questions</h4>
                            <button
                              type="button"
                              onClick={() => handleAddQuestion(sectionIndex)}
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            >
                              <PlusCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                              Add Question
                            </button>
                          </div>
                          
                          {section.questions.length === 0 ? (
                            <p className="text-sm text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
                          ) : (
                            <div>
                              {section.questions.map((question, questionIndex) => 
                                renderQuestionForm(question, sectionIndex, questionIndex)
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 