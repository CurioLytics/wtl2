'use client';

import React from 'react';

interface OnboardingHeaderProps {
  title: string;
  description?: string;
}

export function OnboardingHeader({ title, description }: OnboardingHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      {description && (
        <p className="text-gray-600 text-sm">{description}</p>
      )}
    </div>
  );
}