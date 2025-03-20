'use client'

import Navigation from '../components/Navigation'
import { DocumentTextIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpenIcon className="h-8 w-8 mr-2 text-primary-600" />
              CSRD Guidelines
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              A comprehensive guide to understanding and implementing CSRD reporting requirements for your organization.
            </p>
          </div>

          {/* Introduction Section */}
          <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Introduction to CSRD</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-700">
                The <strong>Corporate Sustainability Reporting Directive (CSRD)</strong> is an EU regulation designed to ensure that companies disclose <strong>clear, comparable, and reliable information</strong> about their sustainability performance. It requires organizations to report on <strong>environmental, social, and governance (ESG) factors</strong>, promoting transparency and accountability. By adhering to CSRD, companies can enhance <strong>stakeholder trust</strong>, improve <strong>access to green financing</strong>, and position themselves for <strong>long-term success</strong>.
              </p>
            </div>
          </div>

          {/* Key Requirements Section */}
          <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Key Requirements</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-700 mb-4">CSRD reporting involves several <strong>essential elements</strong>:</p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Comprehensive data collection</strong> across environmental, social, and governance areas.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">
                    Alignment with <strong>European Sustainability Reporting Standards (ESRS)</strong> for consistency and comparability.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">
                    Application of a <strong>double materiality approach</strong>, assessing both the impact of sustainability issues on the business and the company's impact on society and the environment.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">
                    Integration of <strong>digital reporting techniques</strong>, including standardized digital tagging and <strong>external assurance</strong> of the data.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Ongoing monitoring</strong> and <strong>continuous improvement</strong> of sustainability performance through regular updates and strategic initiatives.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Implementation Steps Section */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Implementation Steps</h2>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-6">
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <h3 className="text-lg font-medium text-gray-900">Step 1: Data Collection</h3>
                  <p className="mt-2 text-gray-700">
                    <strong>Identify and gather</strong> all relevant data from internal and external sources. This includes financial records, operational metrics, <strong>environmental data</strong> (such as energy consumption, emissions, and waste generation), and information on <strong>social and governance practices</strong>. Understanding where to find this data is the <strong>foundation for an accurate CSRD report</strong>.
                  </p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <h3 className="text-lg font-medium text-gray-900">Step 2: Data Entry</h3>
                  <p className="mt-2 text-gray-700">
                    Input the collected data into the designated text fields within your reporting application. Ensure that the information is <strong>accurate and consistent</strong>. Use the provided <strong>templates and guidelines</strong> as a reference to maintain <strong>standardization</strong> across your report.
                  </p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <h3 className="text-lg font-medium text-gray-900">Step 3: Report Generation</h3>
                  <p className="mt-2 text-gray-700">
                    <strong>Review the entered data</strong> for completeness and accuracy. Once verified, automatically generate your CSRD report in PDF format. The system will compile the data using <strong>digital tagging and standardized formatting</strong>, ensuring your final report <strong>meets all CSRD requirements</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="mt-8 bg-primary-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-primary-800 mb-4">Additional Resources</h2>
            <p className="text-primary-700 mb-4">
              For further guidance, consult the official publications and guidelines from the <strong>European Commission</strong> and <strong>EFRAG</strong>. Additional support is available through <strong>industry associations</strong>, sustainability webinars, and <strong>expert advisory services</strong>, all of which offer detailed explanations, best practices, and practical examples to help your organization succeed in CSRD reporting.
            </p>
            <a 
              href="#" 
              className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
            >
              <DocumentTextIcon className="h-5 w-5 mr-1" />
              Download Complete Guidelines PDF
            </a>
          </div>
        </div>
      </main>
    </div>
  )
} 