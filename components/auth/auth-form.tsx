'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signInWithEmail, signUpWithEmail } from '@/services/api/auth-service';
import { OAuthButtons } from './oauth-buttons';
import { VerificationStep } from './verification-step';
import type { User } from '@supabase/supabase-js';

type AuthMode = 'signin' | 'signup';

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error, data } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else if (data?.user) {
          // Check if user has completed onboarding
          try {
            const response = await fetch('/api/check-onboarding', {
              headers: {
                'Accept': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error(`Error checking onboarding status: ${response.status}`);
            }
            
            // Check content type to avoid parsing non-JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Expected JSON response from API');
            }
            
            const { onboardingCompleted } = await response.json();
            
            setUser(data.user);
            // Redirect based on onboarding status
            router.push(onboardingCompleted ? '/dashboard' : '/onboarding');
          } catch (apiError) {
            console.error('API error:', apiError);
            setError('Unable to check onboarding status. Please try again.');
            setLoading(false);
          }
        }
      } else {
        const { error, data } = await signUpWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else if (data?.user) {
          setUser(data.user);
          setSignupComplete(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (signupComplete) {
    return <VerificationStep user={user} isNewUser={true} />;
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold">
          {mode === 'signin' ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {mode === 'signin'
            ? 'Sign in to continue to your account'
            : 'Sign up to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 sm:py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
            style={{ minHeight: '44px' }} // Mobile-friendly touch target
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 sm:py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
            style={{ minHeight: '44px' }} // Mobile-friendly touch target
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full mobile-btn tap-highlight-none py-6 sm:py-4 text-base"
          disabled={loading}
        >
          {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-gray-500 text-sm">Or continue with</span>
        </div>
      </div>

      <OAuthButtons />

      <div className="text-center text-sm pt-4">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-blue-600 hover:underline mobile-btn tap-highlight-none font-medium py-2 px-3 inline-block"
              style={{ minHeight: '44px' }} // Mobile-friendly touch target
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:underline mobile-btn tap-highlight-none font-medium py-2 px-3 inline-block"
              style={{ minHeight: '44px' }} // Mobile-friendly touch target
            >
              Sign in
            </button>
          </p>
        )}
      </div>
      </div>
    );
  }