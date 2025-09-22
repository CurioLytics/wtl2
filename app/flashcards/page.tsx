'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BreathingLoader } from '@/components/ui/breathing-loader';

export default function FlashcardsIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the vocab hub page
    router.replace('/vocab');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BreathingLoader />
    </div>
  );
}