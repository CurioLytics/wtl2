'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { sendPasswordResetEmail } from '@/services/auth/auth-service';
import { LogoImage } from '@/components/auth/logo-image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await sendPasswordResetEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <LogoImage />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold">Email đã được gửi</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>.
              Vui lòng kiểm tra email của bạn và làm theo hướng dẫn.
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="btn-black-outline w-full"
            >
              Quay lại đăng nhập
            </button>
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
          <h2 className="text-xl sm:text-2xl font-bold">Quên mật khẩu</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Nhập email của bạn để nhận link đặt lại mật khẩu
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
            disabled={loading}
            className="btn-black-primary w-full"
          >
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}