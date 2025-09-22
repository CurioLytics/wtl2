'use client';

import Image from 'next/image';
import { cn } from '@/utils/ui';

interface FeatureCardProps {
  title: string;
  description: string;
  iconSrc: string;
  className?: string;
}

/**
 * FeatureCard component for displaying feature highlights on the landing page
 * Used in the "What Can You do?" section
 */
export function FeatureCard({ title, description, iconSrc, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center",
      className
    )}>
      <div className="mb-4">
        <div className="relative w-12 h-12">
          <Image 
            src={iconSrc}
            alt={title}
            fill
            className="object-contain"
          />
        </div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}