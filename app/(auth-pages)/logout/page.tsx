'use client';

import { useEffect, useState } from 'react';
import { signOut } from './actions';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Call the signOut function and await its result
        const result = await signOut();
        
        // If we get here and there's no redirect, manually redirect
        // This is a fallback in case the server action's redirect doesn't work
        if (result && result.error) {
          setError(result.error);
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error during sign out:', err);
        setError('Failed to sign out. Please try again.');
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-red-500">Sign out failed</h1>
            <p className="mt-2 text-gray-500">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Home
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Signing out...</h1>
            <p className="mt-2 text-gray-500">Please wait while we sign you out.</p>
          </>
        )}
      </div>
    </div>
  );
}