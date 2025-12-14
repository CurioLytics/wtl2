'use client';
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { signInWithEmail, signUpWithEmail } from '@/services/auth/auth-service';
import { OAuthButtons } from './oauth-buttons';
import { VerificationStep } from './verification-step';
import type { User } from '@supabase/supabase-js';

type AuthMode = 'signin' | 'signup';

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);

  // Check for mode and onboarding query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);

      // Check for mode parameter (signup/signin)
      const modeParam = urlParams.get('mode');
      if (modeParam === 'signup' || modeParam === 'signin') {
        setMode(modeParam as AuthMode);
      }

      // Check for onboarding completion
      const onboardingComplete = urlParams.get('onboardingComplete');
      if (onboardingComplete === 'true') {
        setMode('signup');
        setOnboardingMessage('Tuyệt vời! Bạn đã hoàn thành các bước khởi đầu. Hãy tạo tài khoản để lưu lại thông tin của bạn.');
      }
    }
  }, []);

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
          setUser(data.user);
          // AuthProvider will handle onboarding check and redirect via middleware
          // Just redirect to home, middleware will handle the rest
          router.push('/home');
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
          {mode === 'signin' ? 'Chào bạn cũ' : 'Tạo tài khoản'}
        </h2>

        {onboardingMessage && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
            {onboardingMessage}
          </div>
        )}
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
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => router.push('/auth/forgot-password')}
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 sm:py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              style={{ minHeight: '44px' }} // Mobile-friendly touch target
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
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
          {loading ? 'Đang xử lý...' : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-gray-500 text-sm">Hoặc tiếp tục với</span>
        </div>
      </div>

      <OAuthButtons />

      <div className="text-center text-sm pt-4">
        {mode === 'signin' ? (
          <p>
            Chưa có tài khoản?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-blue-600 hover:underline mobile-btn tap-highlight-none font-medium py-2 px-3 inline-block"
              style={{ minHeight: '44px' }}
            >
              Đăng ký
            </button>
          </p>
        ) : (
          <p>
            Đã có tài khoản?{' '}
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:underline mobile-btn tap-highlight-none font-medium py-2 px-3 inline-block"
              style={{ minHeight: '44px' }}
            >
              Đăng nhập
            </button>
          </p>
        )}
      </div>
    </div>
  );
}