'use client';

import { useState } from 'react';

export default function DiscountForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isWorkEmail = (email: string) => {
    // A simple check to filter out common personal email domains
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !personalDomains.includes(domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Optional: Validate if it's a work email
    if (!isWorkEmail(email)) {
      setError('Please use your work email address for the discount');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the API endpoint instead of direct email utility
      const response = await fetch('/api/discount-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      // Success!
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Error submitting discount request:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
      {!submitted ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Enter your work e-mail for a 50% discount voucher
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Promotion is valid until 31st of July
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmitting}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              className="bg-tertiary-500 text-black px-4 py-2 rounded-md font-medium hover:bg-tertiary-400 transition duration-200 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </>
      ) : (
        <div className="bg-green-100 p-4 rounded-md border border-green-200 text-center">
          <p className="text-green-800 font-medium">
            Congrats, you will receive your voucher very soon in your inbox.
          </p>
        </div>
      )}
    </div>
  );
} 