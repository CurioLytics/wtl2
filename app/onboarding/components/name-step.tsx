'use client';

import React from 'react';
import { OnboardingHeader } from './onboarding-header';

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

export function NameStep({ name, onNameChange }: NameStepProps) {
  return (
    <div>
      <OnboardingHeader 
        title="Welcome to Write to Learn"
        description="Set up your learning plan in under a minute. Your choices tailor content, feedback, and vocab reviews to your goals."
      />
      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Your name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
}