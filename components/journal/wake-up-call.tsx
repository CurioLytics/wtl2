'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface WakeUpCallProps {
  onShowTemplates: () => void;
}

export function WakeUpCall({ onShowTemplates }: WakeUpCallProps) {
  return (
    <div className="py-8 text-center">
      <h3 className="font-medium text-lg text-gray-700 mb-2">
        Don't know what to write?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Try one of our templates to get started
      </p>
      <button 
        onClick={onShowTemplates}
        className="flex items-center justify-center mx-auto bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-colors duration-200"
        aria-label="Show templates"
      >
        <span className="mr-2">Show Templates</span>
        <ChevronDown size={16} />
      </button>
    </div>
  );
}