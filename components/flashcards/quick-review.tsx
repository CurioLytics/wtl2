'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface QuickReviewProps {
  count?: number;
}

export function QuickReview({ count }: QuickReviewProps) {
  const router = useRouter();
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <p className="text-gray-600">
        {count ? `Review ${count} recent vocabulary from your hub` : 'Review your recent vocabulary from your hub'}
      </p>
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
          onClick={() => router.push('/vocab')}
        >
          Quick Review
        </Button>
      </div>
    </div>
  );
}