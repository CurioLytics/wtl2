'use client';

import { TemplateCollection } from '@/components/features/journal/templates';
import { useAuth } from '@/hooks/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TemplateSelectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TemplateCollection />
      </div>
    </div>
  );
}