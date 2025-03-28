'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation'
import { 
  ChartBarIcon, 
  DocumentCheckIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Define a type for the nested user structure
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any; // Allow other properties
}

// Add TypeScript declaration for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const metrics = [
  {
    name: 'Reports in Progress',
    value: '3',
    change: '+2.1%',
    changeType: 'positive',
    icon: DocumentCheckIcon,
  },
  {
    name: 'Compliance Score',
    value: '92%',
    change: '+3.2%',
    changeType: 'positive',
    icon: ChartBarIcon,
  },
  {
    name: 'Days Until Deadline',
    value: '45',
    change: '-1 day',
    changeType: 'neutral',
    icon: ClockIcon,
  },
  {
    name: 'Open Issues',
    value: '5',
    change: '-2',
    changeType: 'positive',
    icon: ExclamationTriangleIcon,
  },
]

const recentReports = [
  { name: 'Environmental Impact 2023', status: 'In Progress', date: '2024-02-15' },
  { name: 'Social Responsibility Q4', status: 'Completed', date: '2024-01-30' },
  { name: 'Governance Review', status: 'Draft', date: '2024-02-10' },
]

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [paymentVerified, setPaymentVerified] = useState<boolean | null>(null);
  
  // Handle the nested user structure
  const userData = (user?.user || user) as UserData;
  const email = userData?.email;
  const name = userData?.name;
  const sub = userData?.sub;
  const emailVerified = userData?.email_verified;

  // Add client-side payment verification
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) return;
      
      try {
        console.log('[Dashboard] Checking payment status for:', email);
        const response = await fetch('/api/check-payment');
        
        // If the API returns a 402 Payment Required status, redirect to pricing
        if (response.status === 402) {
          console.log('[Dashboard] Payment required, redirecting to pricing page');
          router.push('/pricing');
          return;
        }
        
        if (!response.ok) {
          const data = await response.json();
          console.error('[Dashboard] API error:', data.error);
          return;
        }
        
        const paymentData = await response.json();
        console.log('[Dashboard] Payment verification result:', paymentData);
        
        setPaymentVerified(paymentData.isPaid);
        
        if (!paymentData.isPaid) {
          console.log('[Dashboard] Payment not verified, redirecting to pricing');
          router.push('/pricing');
        } else {
          console.log('[Dashboard] Payment verified successfully');
        }
      } catch (error) {
        console.error('[Dashboard] Error checking payment status:', error);
      }
    };
    
    if (user && !isLoading) {
      checkPaymentStatus();
    }
  }, [user, isLoading, email, router]);

  // Inside your component, add this useEffect
  useEffect(() => {
    // Check for newSignup cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    }
    
    const newSignupCookie = getCookie('newSignup');
    
    if (newSignupCookie === 'true') {
      // Push signup conversion to dataLayer for Google Ads tracking
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'signup_complete'
        });
        console.log('Signup conversion tracked');
      }
      
      // Clear the cookie so we don't track again
      document.cookie = 'newSignup=; Max-Age=-99999999; path=/';
    }
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-col items-center justify-center h-full p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )

  // Show loading indicator while verifying payment
  if (user && paymentVerified === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center h-full p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Verifying account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {name || email || 'User'}</h1>
          
          {/* User Info Debug Card - Commented out as it's no longer needed */}
          {/* 
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium text-gray-500">Email: </span>
                <span className="text-gray-900">{email || 'Not available'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-500">Email Verified: </span>
                <span className="text-gray-900">{emailVerified ? 'Yes' : 'No'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-500">Account Status: </span>
                <span className="text-green-600 font-semibold">
                  {paymentVerified ? 'Active' : 'Checking...'}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-500">Auth0 ID: </span>
                <span className="text-gray-900">{sub || 'Not available'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-500">Name: </span>
                <span className="text-gray-900">{name || 'Not set'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-500">Raw User Data: </span>
                <span className="text-gray-900 break-all">{JSON.stringify(user)}</span>
              </p>
            </div>
          </div>
          */}

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-4 space-y-2">
                  <Link 
                    href="/reports" 
                    className="flex items-center w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    View All Reports
                  </Link>
                  <Link 
                    href="/reports" 
                    className="flex items-center w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create New Report
                  </Link>
                  <Link 
                    href="/guidelines" 
                    className="flex items-center w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                  >
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    View Guidelines
                  </Link>
                </div>
              </div>
            </div>

            {/* Getting Started Card (Replacing Recent Activity) */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Getting Started</h3>
                <ol className="mt-4 space-y-3 list-decimal list-inside">
                  <li className="text-sm text-gray-600">Create a new report</li>
                  <li className="text-sm text-gray-600">Complete the questionnaire</li>
                  <li className="text-sm text-gray-600">Generate your CSRD-compliant report</li>
                  <li className="text-sm text-gray-600">Download or share with stakeholders</li>
                </ol>
                <div className="mt-4">
                  <Link href="/reports">
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Start New Report
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Helpful Resources Card (Replacing Overview) */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Helpful Resources</h3>
                <ul className="mt-4 space-y-3">
                  <Link href="/guidelines">
                    <li className="flex items-center text-sm text-gray-600 hover:text-primary-700 cursor-pointer">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
                      <span>CSRD Reporting Guidelines</span>
                    </li>
                  </Link>
                  <Link href="/about">
                    <li className="flex items-center text-sm text-gray-600 hover:text-primary-700 cursor-pointer">
                      <BookOpenIcon className="h-5 w-5 mr-2 text-primary-500" />
                      <span>Sustainability Reporting Best Practices</span>
                    </li>
                  </Link>
                  <a 
                    href="https://www.youtube.com/watch?v=mAQ0YtW8BAI&list=PLl3-0Xe_motQCLGeJmpLEu5Z53xN3ip-H" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <li className="flex items-center text-sm text-gray-600 hover:text-primary-700 cursor-pointer">
                      <AcademicCapIcon className="h-5 w-5 mr-2 text-primary-500" />
                      <span>ESG Reporting Tutorial</span>
                    </li>
                  </a>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 