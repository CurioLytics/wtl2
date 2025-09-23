'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HighlightListProps {
  highlights: string[];
  onRemove: (index: number) => void;
}

export const HighlightList: React.FC<HighlightListProps> = ({
  highlights,
  onRemove,
}) => {
  console.log('HighlightList rendering with highlights:', highlights);

  return (
    <div className="space-y-3">
      {!highlights || highlights.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No highlights saved yet. Highlight text in the content above to save.
        </div>
      ) : (
        highlights.map((highlight, index) => (
          <div 
            key={index}
            className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <div className="flex-1 text-sm">
              <p className="text-gray-800">"{highlight}"</p>
            </div>
            <button 
              onClick={() => onRemove(index)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Remove</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))
      )}
    </div>
  );
};