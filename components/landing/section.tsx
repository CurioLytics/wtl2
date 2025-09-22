'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/ui';

interface SectionProps {
  title: string;
  children: ReactNode;
  bgColor?: string;
  className?: string;
}

/**
 * Section component for the landing page
 * Used to create consistent section layouts with titles
 */
export function Section({ title, children, bgColor = 'bg-white', className }: SectionProps) {
  return (
    <section className={cn(bgColor, 'py-16 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        {children}
      </div>
    </section>
  );
}