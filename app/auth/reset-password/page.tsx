'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updatePassword } from '@/services/auth/auth-service';
import { LogoImage } from '@/components/auth/logo-image';
import { createClient } from '@/services/supabase/client';

// Force dynamic rendering to prevent build-time errors with window/searchParams
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if we have valid session from email link
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidToken(true);
      } else {
        // Try to get tokens from URL hash (for password reset)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session using the tokens
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            setIsValidToken(true);
          } catch (err) {
            setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
          }
        } else {
          setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
        }
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken && error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <LogoImage />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold">Link không hợp lệ</h2>
            <p className="text-red-600 text-sm sm:text-base">
              {error}
            </p>
            <button
              onClick={() => router.push('/auth/forgot-password')}
              className="btn-black-outline w-full"
            >
              Gửi lại link đặt lại mật khẩu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <LogoImage />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold">Thành công!</h2>
            <p className="text-green-600 text-sm sm:text-base">
              Mật khẩu của bạn đã được đổi thành công.
              Bạn có thể đăng nhập với mật khẩu mới.
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="btn-black-primary w-full"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <LogoImage />
          </div>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold">Đang xử lý...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <LogoImage />
        </div>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold">Đặt lại mật khẩu</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 sm:py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              style={{ minHeight: '44px' }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 sm:py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              style={{ minHeight: '44px' }}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-black-primary w-full mobile-btn tap-highlight-none py-6 sm:py-4 text-base"
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}