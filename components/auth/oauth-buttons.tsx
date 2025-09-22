'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { signInWithProvider } from '@/services/api/auth-service';

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInWithProvider('google');
      
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('OAuth error:', err);
    } finally {
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
        className="w-full flex items-center justify-center gap-3 py-6 sm:py-3 mobile-btn tap-highlight-none"
        style={{ minHeight: '52px' }} // Larger touch target for mobile
        disabled={isLoading}
      >
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
    </div>
  );
}