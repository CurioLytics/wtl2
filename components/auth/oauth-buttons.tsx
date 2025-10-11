'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { signInWithProvider } from '@/services/api/auth-service';
import { useSearchParams } from 'next/navigation';

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Check for error from redirect
  useEffect(() => {
    const errorMsg = searchParams?.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
    
    // Check if we're returning from an OAuth attempt
    const oauthProvider = searchParams?.get('provider');
    if (oauthProvider) {
      setProvider(oauthProvider);
    }
    
    // Check if we have an in-progress auth from localStorage
    // This helps with maintaining state during redirects
    if (typeof window !== 'undefined') {
      const inProgressAuth = localStorage.getItem('auth_in_progress');
      if (inProgressAuth) {
        setProvider(inProgressAuth);
        // Only set loading if we don't have an error
        if (!errorMsg) {
          setIsLoading(true);
        } else {
          // Clear the in-progress flag if we have an error
          localStorage.removeItem('auth_in_progress');
        }
      }
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProvider('google');
      
      const result = await signInWithProvider('google');
      
      if (result.error) {
        setError(result.error.message);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_in_progress');
        }
        setIsLoading(false);
      }
      
      // The successful OAuth flow will redirect away from this page
      // so we don't need to handle success here
      
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('OAuth error:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_in_progress');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md mb-3">
          {error}
        </div>
      )}
      
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-6 sm:py-3 mobile-btn tap-highlight-none transition-all duration-200"
        style={{ 
          minHeight: '52px', // Larger touch target for mobile
          position: 'relative',
          overflow: 'hidden',
        }} 
        disabled={isLoading}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="relative w-5 h-5 sm:w-5 sm:h-5">
          <Image 
            src="/icons/google.svg" 
            alt="Google" 
            fill 
            className="object-contain" 
          />
        </div>
        <span className="text-base sm:text-sm">
          {isLoading ? 'Connecting...' : 'Continue with Google'}
        </span>
      </Button>
      
      <div className="text-xs text-gray-500 text-center mt-2">
        By continuing, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
}