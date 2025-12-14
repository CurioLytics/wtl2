'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { signInWithProvider } from '@/services/auth/auth-service';
import { useSearchParams } from 'next/navigation';

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Handle redirect state
  useEffect(() => {
    // Always clear stale loading flag on mount
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_in_progress');
    }

    const errorMsg = searchParams?.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      setIsLoading(false);
    }

    const oauthProvider = searchParams?.get('provider');
    if (oauthProvider) {
      setProvider(oauthProvider);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProvider('google');

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_in_progress', 'google');
      }

      await signInWithProvider('google'); // Redirects away

    } catch (err) {
      setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
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
        className="w-full flex items-center justify-center gap-3 py-6 sm:py-3 mobile-btn transition-all duration-200"
        style={{ 
          minHeight: '52px',
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
          {isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
        </span>
      </Button>
      
      <div className="text-xs text-gray-500 text-center mt-2">
        Bằng cách tiếp tục, bạn đồng ý với <a href="/terms" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a> và <a href="/privacy" className="text-blue-600 hover:underline">Chính sách riêng tư</a> của chúng tôi
      </div>
    </div>
  );
}
