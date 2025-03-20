'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import { ArrowLeftIcon, DocumentArrowDownIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
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

// Extended question interface to handle both formats
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

// Extended section interface to handle both formats
interface ExtendedSection {
  id?: string;
  title?: string;
  section?: string;
  description?: string;
  questions?: ExtendedQuestion[];
}

// Updated Questionnaire interface to handle both formats
interface Questionnaire {
  id: string
  title: string
  description?: string
  sections?: ExtendedSection[]
  questions?: {
    sections?: ExtendedSection[]
  }
  created_at?: string
  updated_at?: string
}

interface Responses {
  [key: string]: string
}

export default function ReportGeneratePage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [responses, setResponses] = useState<Responses | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState<boolean>(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [selectedFormat, setSelectedFormat] = useState<string>('ai')

  // Fetch report data
  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return
      
      try {
        setIsLoading(true)
        
        // Fetch the report
        const reportResponse = await fetch(`/api/reports/${params.id}`)
        if (!reportResponse.ok) {
          throw new Error(`Error fetching report: ${reportResponse.statusText}`)
        }
        const reportData = await reportResponse.json()
        setReport(reportData)
        
        // Fetch the questionnaire (assume we're using the most recent one)
        const questionnaireResponse = await fetch('/api/questionnaires')
        if (!questionnaireResponse.ok) {
          throw new Error(`Error fetching questionnaire: ${questionnaireResponse.statusText}`)
        }
        const questionnairesData = await questionnaireResponse.json()
        if (questionnairesData.length > 0) {
          setQuestionnaire(questionnairesData[0])
        }
        
        // Fetch responses for this report
        const responsesResponse = await fetch(`/api/responses?reportId=${params.id}`)
        if (responsesResponse.ok) {
          const responsesData = await responsesResponse.json()
          setResponses(responsesData)
        }
        
      } catch (err: any) {
        console.error('Error loading data:', err)
        setError(err.message || 'An error occurred while loading data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [params.id])

  const handleBackToReports = () => {
    router.push('/reports')
  }

  const handleEditReport = () => {
    router.push(`/reports/${params.id}/edit`)
  }

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true)
      setGenerationProgress(0)
      setGeneratedContent(null)
      setError(null)
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 500)
      
      // Determine questionnaire structure - handle both old and new formats
      let sections = [];
      
      if (!questionnaire) {
        setError('No questionnaire data available')
        setGeneratingReport(false)
        clearInterval(progressInterval)
        return
      }
      
      // Check which format the data is in
      if (questionnaire.sections && Array.isArray(questionnaire.sections)) {
        // New format with sections array directly on questionnaire
        sections = questionnaire.sections;
      } else if (questionnaire.questions && questionnaire.questions.sections && 
                Array.isArray(questionnaire.questions.sections)) {
        // Old format with sections inside questions object
        sections = questionnaire.questions.sections;
      } else {
        console.error('Unknown questionnaire format:', questionnaire);
        setError('Unable to process questionnaire data (invalid format)')
        setGeneratingReport(false)
        clearInterval(progressInterval)
        return
      }
      
      // Log the sections for debugging
      console.log('Using sections:', sections);
      
      // Format content with each question followed by its answer
      let formattedContent = `# ${report?.title || 'Report'}\n\n`;
      
      // Iterate through each section and question
      sections.forEach((section: ExtendedSection) => {
        const sectionTitle = section.title || section.section || 'Untitled Section';
        formattedContent += `## ${sectionTitle}\n\n`;
        
        // Handle both question formats
        const questions = section.questions || [];
        
        questions.forEach((question: ExtendedQuestion) => {
          const questionId = question.id || question.question_id;
          const questionText = question.text || question.question_text;
          
          if (questionId && questionText) {
            // Add the question text prefixed with "Q:"
            formattedContent += `Q: ${questionText}\n`;
            
            // Add the answer or N/A if not answered, prefixed with "A:"
            const answer = responses && responses[questionId] ? responses[questionId] : 'N/A';
            formattedContent += `A: ${answer}\n\n`;
          }
        });
      });
      
      // Add generation timestamp
      formattedContent += `\nGenerated on ${new Date().toLocaleString()}\n`;
      
      // If AI generation is selected, send to OpenAI API
      if (selectedFormat === 'ai') {
        try {
          const prompt = `You are provided with structured data extracted from a CSRD survey for SMEs. The data is organized by sections with individual questions (prefixed with "Q:") and corresponding answers (prefixed with "A:"). Your task is to generate a comprehensive and formal Corporate Sustainability Reporting Directive (CSRD) report based solely on the provided information.

Instructions:

Use only the provided data. Include only information from question-answer pairs where the answer is not "N/A". Ignore any pair where the answer is "N/A".
Divide the report into clear sections that follow the input data structure (e.g., "Company Profile & General Sustainability Context", "Environmental Impact – Emissions and Resource Use", "Social Impact & Human Rights", etc.). Use simple headers.
Integrate the available information into a narrative format that highlights the company's sustainability performance, key metrics, and strategic initiatives.
Include additional important points such as:
The importance of sustainability reporting for improving stakeholder transparency.
How robust reporting can help in accessing green financing.
The role of continuous improvement and monitoring of sustainability performance.
Relevant trends or best practices in sustainability reporting for SMEs.
Conclude with a summary of the overall sustainability performance and recommendations for future improvements.

Input Data:
${formattedContent}

Generate the CSRD report using only the provided information, omitting any data with "N/A" as the answer.`;

          // Make API call to OpenAI
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();
          setGeneratedContent(data.content);
        } catch (apiError: any) {
          console.error('Error calling OpenAI API:', apiError);
          setError(`Error generating AI content: ${apiError.message}`);
          clearInterval(progressInterval);
          setGeneratingReport(false);
          return;
        }
      } else {
        // For non-AI formats, just display the formatted content
        setGeneratedContent(formattedContent);
      }
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
    } catch (err: any) {
      console.error('Error generating report:', err)
      setError(err.message || 'An error occurred while generating the report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleDownloadReport = () => {
    if (!generatedContent) return
    
    const element = document.createElement('a')
    const file = new Blob([generatedContent], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `${report?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'report'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadPDF = async () => {
    if (!generatedContent || !report?.id) return
    
    try {
      // First, verify permissions through the API
      const response = await fetch(`/api/reports/${report.id}/download-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: generatedContent })
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify permissions');
      }
      
      // Import jsPDF dynamically only when needed
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Generate PDF client-side using jsPDF
      const doc = new jsPDF();
      
      // Split content into lines
      const lines = generatedContent.split('\n');
      
      let y = 20; // starting y position
      let pageHeight = doc.internal.pageSize.height;
      
      lines.forEach(line => {
        // Check if it's a heading
        if (line.startsWith('# ')) {
          // Main heading
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          
          // Check if we need a new page
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(line.substring(2), 20, y);
          y += 10;
        } else if (line.startsWith('## ')) {
          // Subheading
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          
          // Check if we need a new page
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(line.substring(3), 20, y);
          y += 8;
        } else if (line.trim()) {
          // Regular text
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          
          // Check if we need a new page
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          
          // Split long lines
          const textLines = doc.splitTextToSize(line, 170);
          textLines.forEach((textLine: string) => {
            doc.text(textLine, 20, y);
            y += 7;
            
            // Check if we need a new page after each line
            if (y > pageHeight - 20) {
              doc.addPage();
              y = 20;
            }
          });
        } else {
          // Empty line
          y += 5;
        }
      });
      
      // Save the PDF
      doc.save(`${report?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'report'}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBackToReports}
                  className="mr-4 rounded-md bg-white p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Generate Report: {report?.title}
                </h1>
              </div>
              <button
                onClick={handleEditReport}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center">
                  <DocumentTextIcon className="mr-1 h-5 w-5" />
                  Edit Report
                </span>
              </button>
            </div>
            
            {report && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Created: {report.created_at ? formatDate(report.created_at) : 'Unknown'}</p>
                <p>Status: {report.status}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400" />
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
            <div className="flex h-64 items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
              <span className="ml-2 text-gray-600">Loading report data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-medium text-gray-900">Report Generation</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Generate a fully formatted report based on your questionnaire responses.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                      Output Format
                    </label>
                    <select
                      id="format"
                      name="format"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="ai">Generate text with AI</option>
                      <option value="pdf">PDF Document</option>
                      <option value="docx">Word Document (DOCX)</option>
                      <option value="txt">Text File (TXT)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateReport}
                      disabled={generatingReport}
                      className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      {generatingReport ? (
                        <span className="flex items-center">
                          <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        'Generate Report'
                      )}
                    </button>
                  </div>
                </div>
                
                {generatingReport && (
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="text-right text-xs font-semibold text-primary-600">
                        {Math.round(generationProgress)}%
                      </div>
                      <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className="h-2 rounded-full bg-primary-600" 
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Processing report data and generating formatted output...
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {generatedContent && (
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Generated Report</h2>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="rounded-md bg-gray-100 px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      >
                        <span className="flex items-center">
                          <DocumentArrowDownIcon className="mr-1 h-5 w-5" />
                          Download .txt
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="rounded-md bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        <span className="flex items-center">
                          <DocumentArrowDownIcon className="mr-1 h-5 w-5" />
                          Download PDF
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 rounded-md bg-gray-50 p-4">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{generatedContent}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 