'use client'

import Navigation from '../components/Navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect, Suspense } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter, useSearchParams } from 'next/navigation'

// Create a client component that uses useSearchParams
function PricingContent() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for success parameter in URL (from Stripe redirect)
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      setSuccess(true)
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }, [searchParams, router])

  const handleGetAccess = async () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = '/api/auth/login?returnTo=/pricing'
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Extract user data, handling potential nesting
      const userData = (user.user || user) as any
      const email = userData?.email
      const sub = userData?.sub

      if (!email || !sub) {
        setError('Unable to retrieve user information. Please try logging in again.')
        return
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: sub,
          userEmail: email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { sessionId } = data

      // Redirect to Stripe Checkout
      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!stripePublishableKey) {
        throw new Error('Stripe publishable key is missing')
      }

      const stripe = await loadStripe(stripePublishableKey)
      if (!stripe) {
        throw new Error('Failed to initialize Stripe')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })
      if (stripeError) {
        throw new Error(stripeError.message || 'Stripe checkout failed')
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    'CSRD Report Generator made for SME\'s in EU.',
    'Lifetime Access',
    'Lifetime access to the tool.',
    'No subscription, one time payment.',
    'Unlimited Generated Reports. With secure AI',
    'Update your report 24/7. Never extra fees.',
    'Become CSRD compliant.',
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      {/* Success Message */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Payment successful!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Thank you for your purchase. You now have full access to all CSRD reporting features.
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <h1 className="max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simplify Your CSRD Reporting
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get lifetime access to our powerful CSRD reporting tools and stay compliant with EU regulations.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Perfect for small and medium-sized enterprises looking to meet CSRD requirements efficiently and affordably.
            </p>
            <div className="mt-10">
              <a
                href="#pricing"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Lifetime Access
            </p>
          </div>

          {/* Apple-style Pricing Card */}
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <div className="flex items-center gap-x-4">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">One-time Payment</h3>
                <div className="text-lg leading-6 text-gray-600">
                  No subscriptions, no hidden fees
                </div>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Get complete access to all features with a single payment. Perfect for businesses looking to maintain CSRD compliance.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-primary-600">What's included</h4>
                <div className="h-px flex-auto bg-gray-100" />
              </div>
              <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                {benefits.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-primary-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">One-time payment</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">€199</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">EUR</span>
                  </p>
                  <button
                    onClick={handleGetAccess}
                    disabled={isLoading}
                    className="mt-10 block w-full rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Get Access'
                    )}
                  </button>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Secure payment processed by Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Wrap the client component in Suspense 
export default function Pricing() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <PricingContent />
    </Suspense>
  )
} 