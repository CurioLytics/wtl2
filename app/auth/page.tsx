import { AuthForm } from '@/components/auth/auth-form';
import { LogoImage } from '@/components/auth/logo-image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Write2Learn',
  description: 'Sign in to your Write2Learn account or create a new one to improve your English writing skills.',
};

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <LogoImage />
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
}