'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { resendVerificationEmail } from '@/services/api/auth-service';

// ResendButton component for email verification
function ResendButton({ email }: { email: string | undefined }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleResend = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setStatus('idle');
    
    try {
      const { error } = await resendVerificationEmail(email);
      if (!error) {
        setStatus('success');
      } else {
        console.error('Resend verification error:', error);
        setStatus('error');
      }
    } catch (err) {
      console.error('Unexpected error during resend:', err);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-3">
      <button
        className="text-blue-600 hover:text-blue-800 font-medium py-3 px-4 mobile-btn tap-highlight-none"
        onClick={handleResend}
        disabled={isLoading}
        style={{ minHeight: '44px', minWidth: '44px' }} // Mobile-friendly touch target
      >
        {isLoading ? 'Sending...' : 'Click here to resend'}
      </button>
      
      {status === 'success' && (
        <p className="text-green-600 text-sm mt-2 p-2 bg-green-50 rounded-md">
          Verification email sent successfully!
        </p>
      )}
      
      {status === 'error' && (
        <p className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md">
          Failed to resend email. Please try again.
        </p>
      )}
    </div>
  );
}

interface VerificationStepProps {
  user: User | null;
  isNewUser: boolean;
}

export function VerificationStep({ user, isNewUser }: VerificationStepProps) {
  if (!user) return null;

  const email = user.email;
  const isEmailVerified = user.email_confirmed_at;

  return (
    <div className="text-center p-5 sm:p-6 bg-gray-50 rounded-lg">
      <div className="mb-6">
        {isEmailVerified ? (
          <div className="text-green-600">
            <svg
              className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl sm:text-lg font-medium">Email Verified</h3>
            <p className="text-base sm:text-sm text-gray-600 mt-2">Your email has been verified successfully.</p>
          </div>
        ) : (
          <div className="text-blue-600">
            <svg
              className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl sm:text-lg font-medium">Verify Your Email</h3>
            {isNewUser ? (
              <div className="mt-3">
                <p className="text-base sm:text-sm text-gray-600">
                  We've sent a verification link to 
                </p>
                <p className="text-base sm:text-sm font-medium text-gray-700 my-2">
                  {email}
                </p>
                <p className="text-base sm:text-sm text-gray-600">
                  Please check your inbox and click the link to verify your email address.
                </p>
              </div>
            ) : (
              <p className="text-base sm:text-sm text-gray-600 mt-3">
                Please verify your email address to access all features.
              </p>
            )}
          </div>
        )}
      </div>

      {!isEmailVerified && (
        <div className="mt-6 text-base sm:text-sm text-gray-600 pt-4 border-t border-gray-200">
          <p>Didn't receive the email?</p>
          <ResendButton email={email} />
        </div>
      )}
    </div>
  );
}