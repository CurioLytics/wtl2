'use client';

import React, { useState } from 'react';

interface OnboardingHeaderProps {
  title: string;
  description?: string;
  tip?: string; // Thêm gợi ý
}

export function OnboardingHeader({ title, description, tip }: OnboardingHeaderProps) {
  const [tipVisible, setTipVisible] = useState(true);
  
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      {description && (
        <p className="text-gray-600 text-sm">{description}</p>
      )}
      
      {tip && tipVisible && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm relative">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>{tip}</div>
            <button 
              onClick={() => setTipVisible(false)}
              className="ml-auto text-blue-700 hover:bg-blue-100 rounded-lg p-1"
              aria-label="Đã hiểu"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}