'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import { EnvelopeIcon, PhoneIcon, UserIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ContactPage() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    verification: ''
  })
  
  // Simple verification code - current year + 10
  const verificationAnswer = new Date().getFullYear() + 10
  
  // Form state for submission and errors
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Invalid email address'
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    }
    
    if (!formData.verification.trim()) {
      errors.verification = 'Please answer the verification question'
    } else if (parseInt(formData.verification) !== verificationAnswer) {
      errors.verification = 'Incorrect answer, please try again'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // In a real implementation, you would send the form data to your backend
      // Here we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demonstration, we'll simulate opening an email client
      const subject = `Contact from ${formData.name} - CSRD Reporting Tool`
      const body = `Name: ${formData.name}
Company: ${formData.company || 'Not specified'}
Email: ${formData.email}
Message: ${formData.message}`
      
      window.location.href = `mailto:scott.golbach@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        verification: ''
      })
      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError('There was an error sending your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg max-w-2xl mx-auto">
              Have questions about CSRD reporting? Reach out to us and we'll help you navigate the process.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white shadow-lg overflow-hidden">
            <div className="md:grid md:grid-cols-2">
              {/* Contact Information */}
              <div className="bg-primary-700 p-10 text-white">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <p className="mb-8">
                  We're here to help you streamline your CSRD reporting process. Contact us for any questions, support needs, or to learn more about our solutions.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <EnvelopeIcon className="h-6 w-6 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:scott.golbach@gmail.com" className="text-primary-100 hover:text-white">
                        scott.golbach@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="border-t border-primary-600 pt-6">
                    <h3 className="text-lg font-medium mb-4">About Us</h3>
                    <p className="mb-4">
                      Learn more about our mission and how our CSRD reporting tool can help your business meet compliance requirements efficiently.
                    </p>
                    <Link 
                      href="/about" 
                      className="inline-flex items-center px-4 py-2 border border-white rounded-md text-sm font-medium hover:bg-primary-800 transition-colors"
                    >
                      Visit About Page
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="p-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                {submitSuccess ? (
                  <div className="rounded-md bg-green-50 p-4 mb-6">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Message sent!</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setSubmitSuccess(false)}
                            className="text-sm font-medium text-green-700 hover:text-green-600"
                          >
                            Send another message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{submitError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`pl-10 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md ${formErrors.name ? 'border-red-300' : ''}`}
                          placeholder="Your Name"
                        />
                      </div>
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-10 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md ${formErrors.email ? 'border-red-300' : ''}`}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Your Company (Optional)"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md ${formErrors.message ? 'border-red-300' : ''}`}
                          placeholder="How can we help you with CSRD reporting?"
                        />
                      </div>
                      {formErrors.message && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
                      )}
                    </div>
                    
                    {/* Spam Prevention */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <label htmlFor="verification" className="block text-sm font-medium text-gray-700">
                        Verification <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 mb-2">
                        To prevent spam, please solve this simple math problem: What is {new Date().getFullYear()} + 10?
                      </p>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="verification"
                          name="verification"
                          value={formData.verification}
                          onChange={handleChange}
                          className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md ${formErrors.verification ? 'border-red-300' : ''}`}
                          placeholder="Your answer"
                        />
                      </div>
                      {formErrors.verification && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.verification}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 