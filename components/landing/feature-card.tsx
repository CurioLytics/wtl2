'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/ui';

interface FeatureCardProps {
  title: string;
  description: ReactNode;
  emoji: string;
  details: string[];
  className?: string;
}

/**
 * FeatureCard component for displaying feature highlights on the landing page
 * Uses emoji icons for a cleaner, more minimalist look
 */
export function FeatureCard({ title, description, emoji, details, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300",
      className
    )}>
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 italic">{description}</p>
      <ul className="space-y-2">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1">•</span>
            <span className="text-foreground">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
