'use client';

import Image from 'next/image';

interface StepItemProps {
  number: number;
  title: string;
  description: string;
  iconSrc: string;
}

/**
 * StepItem component for displaying workflow steps on the landing page
 * Used in the "How It Works" section
 */
export function StepItem({ number, title, description, iconSrc }: StepItemProps) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center mb-4">
        <div className="relative w-6 h-6 mr-2">
          <Image 
            src={iconSrc}
            alt={`Step ${number}: ${title}`}
            fill
            className="object-contain"
          />
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">
        {description}
      </p>
    </div>
  );
}