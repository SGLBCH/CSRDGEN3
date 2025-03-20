'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';

// Define a type for the nested user structure
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any; // Allow other properties
}

interface NestedUser {
  user: UserData;
  [key: string]: any;
}

export default function AuthDebugPage() {
  const { user, error, isLoading } = useUser();
  const [meEndpointData, setMeEndpointData] = useState(null);
  const [meEndpointError, setMeEndpointError] = useState(null);
  
  // Handle the nested user structure
  const userData = (user?.user || user) as UserData;
  const email = userData?.email;
  const name = userData?.name;
  const sub = userData?.sub;
  const emailVerified = userData?.email_verified;
  
  // Determine if we're dealing with a nested user structure
  const isNestedStructure = user && 'user' in user;

  // Get user properties safely
  const getUserProperties = () => {
    if (!user) return '';
    
    if (isNestedStructure) {
      const typedUser = user as NestedUser;
      return `Top level: ${Object.keys(typedUser).join(', ')}, User object: ${Object.keys(typedUser.user).join(', ')}`;
    }
    
    return Object.keys(user as object).join(', ');
  };

  useEffect(() => {
    // Check the /api/auth/me endpoint directly
    const checkMeEndpoint = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        console.log('ME endpoint response:', data);
        setMeEndpointData(data);
      } catch (err: any) {
        console.error('Error fetching /api/auth/me:', err);
        setMeEndpointError(err.message);
      }
    };

    checkMeEndpoint();
  }, []);

  const handleLoginClick = () => {
    window.location.href = '/api/auth/login?returnTo=/auth-debug';
  };

  const handleLogoutClick = () => {
    window.location.href = '/api/auth/logout?returnTo=/auth-debug';
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Auth0 Debug Page</h1>
          
          <div className="space-y-8">
            {/* Auth Buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={handleLoginClick}
                className="bg-primary-600 text-white px-4 py-2 rounded-md"
              >
                Log In
              </button>
              <button 
                onClick={handleLogoutClick}
                className="bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Log Out
              </button>
            </div>
            
            {/* Client-side Auth Status */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Client-side Auth Status</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Status from useUser() hook
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Is Loading</dt>
                    <dd className="mt-1 text-sm text-gray-900">{isLoading ? 'Yes' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Is Authenticated</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user ? 'Yes' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User Structure</dt>
                    <dd className="mt-1 text-sm text-gray-900">{isNestedStructure ? 'Nested (user.user)' : 'Normal'}</dd>
                  </div>
                  {error && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-red-500">Error</dt>
                      <dd className="mt-1 text-sm text-red-700">{error.message}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* User Object */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">User Object</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Data from Auth0
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {user ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{email || 'Not available'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{name || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Auth0 ID</h3>
                      <p className="mt-1 text-sm text-gray-900">{sub || 'Not available'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Verified</h3>
                      <p className="mt-1 text-sm text-gray-900">{emailVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Available User Properties</h3>
                      <p className="mt-1 text-sm text-gray-900">{getUserProperties()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Raw User Object</h3>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not authenticated</p>
                )}
              </div>
            </div>

            {/* ME Endpoint Data */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">/api/auth/me Endpoint</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Data from direct API call
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {meEndpointData ? (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(meEndpointData, null, 2)}
                  </pre>
                ) : meEndpointError ? (
                  <p className="text-sm text-red-500">{meEndpointError}</p>
                ) : (
                  <p className="text-sm text-gray-500">Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 