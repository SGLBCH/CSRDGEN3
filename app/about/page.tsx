'use client'

import Navigation from '../components/Navigation'
import { InformationCircleIcon, BuildingOfficeIcon, CheckBadgeIcon, DocumentChartBarIcon, UserGroupIcon, LightBulbIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              About CSRD Reporting
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Supporting businesses in meeting their Corporate Sustainability Reporting Directive obligations with powerful, user-friendly tools.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Overview Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <InformationCircleIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <div className="bg-white shadow rounded-lg p-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                As a team deeply involved in managing small-to-medium enterprises in the Netherlands, we understand the challenges businesses face with sustainability reporting. Many companies struggle to know where to begin, often resulting in time-consuming and complex processes. That's why this CSRD reporting tool was developed—to simplify data collection and streamline the entire reporting journey.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                By minimizing the time and effort required, our platform helps businesses efficiently meet their CSRD obligations, allowing them to stay focused on what they do best. The solution is based on the latest guidance from the EU and its CSRD department, and has received positive feedback from accountants who assess CSRD reports, confirming its effectiveness and value.
              </p>
            </div>
          </div>
          
          {/* What is CSRD Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">What is CSRD?</h2>
            </div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="md:grid md:grid-cols-2">
                <div className="p-8">
                  <p className="text-gray-700 mb-6">
                    The Corporate Sustainability Reporting Directive (CSRD) is an EU regulation designed to promote transparency and accountability in corporate sustainability performance. It requires companies to provide detailed disclosures on environmental, social, and governance (ESG) issues.
                  </p>
                  <p className="text-gray-700">
                    By standardizing sustainability reporting, CSRD helps businesses communicate their impact on society and the environment while ensuring that investors, regulators, and stakeholders have access to reliable and comparable information.
                  </p>
                </div>
                <div className="bg-gray-200 flex items-center justify-center p-8">
                  <div className="text-center">
                    <DocumentChartBarIcon className="h-24 w-24 text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Corporate Sustainability Reporting Directive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Our Solution Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <LightBulbIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Our Solution</h2>
            </div>
            <div className="bg-white shadow rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                    <CheckBadgeIcon className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Simplified Reporting</h3>
                  <p className="text-gray-700">
                    Our tool is designed to make sustainability reporting accessible to SMEs. By guiding you through the data collection process and automatically formatting your information, the platform removes the complexity typically associated with CSRD compliance.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                    <DocumentChartBarIcon className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Compliance Assurance</h3>
                  <p className="text-gray-700">
                    We ensure that your report meets the latest EU standards and guidelines. Our solution incorporates up-to-date information from the EU's CSRD department, helping you produce a compliant and accurate sustainability report with ease.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Support</h3>
                  <p className="text-gray-700">
                    In developing this platform, we consulted with experienced accountants and sustainability experts. Their enthusiastic feedback and support have been integral to our tool's success. Our system not only simplifies reporting but also provides ongoing guidance so you can maintain high standards in your sustainability disclosures.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <CheckBadgeIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Benefits</h2>
            </div>
            <div className="bg-white shadow rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <CheckBadgeIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Time Efficiency</h3>
                    <p className="mt-2 text-gray-600">
                      Automate data collection and report generation, reducing manual effort and enabling you to focus on core business activities.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <CheckBadgeIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Accuracy and Reliability</h3>
                    <p className="mt-2 text-gray-600">
                      Benefit from a tool that is aligned with the latest EU CSRD guidelines, ensuring your report is both accurate and trustworthy.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <CheckBadgeIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">User-Friendly Interface</h3>
                    <p className="mt-2 text-gray-600">
                      Specifically designed for SMEs, our platform offers a straightforward experience, making sustainability reporting accessible even if you lack prior experience.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <CheckBadgeIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Cost Savings</h3>
                    <p className="mt-2 text-gray-600">
                      Streamline your reporting process to save on external consultancy fees, allowing you to reinvest those resources into growing your business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-primary-700 rounded-lg shadow-xl overflow-hidden">
            <div className="md:grid md:grid-cols-2">
              <div className="px-8 py-12 md:px-12 md:py-16">
                <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to simplify your CSRD reporting?</h2>
                <p className="mt-4 text-lg text-primary-100">
                  Get started with our platform today and ensure your business meets its sustainability reporting obligations efficiently and accurately.
                </p>
                <div className="mt-8 flex space-x-4">
                  <a
                    href="/reports"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
                  >
                    Get Started
                  </a>
                  <a
                    href="mailto:scott.golbach@gmail.com"
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-600"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Contact Us
                  </a>
                </div>
              </div>
              <div className="bg-primary-800 flex items-center justify-center p-8">
                <DocumentChartBarIcon className="h-32 w-32 text-primary-300" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 