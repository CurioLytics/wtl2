'use client';

import { useState } from 'react';
import { PinnedTemplate } from '@/services/api/template-service';

interface MinimalTemplateCardProps {
  template: PinnedTemplate;
  onClick: (template: PinnedTemplate) => void;
  isSelected?: boolean;
}

/**
 * A minimalist template card showing only title and category
 */
export function MinimalTemplateCard({ template, onClick, isSelected = false }: MinimalTemplateCardProps) {
  const getCategoryColor = (category: string): string => {
    // Map categories to colors
    const categoryColors: Record<string, string> = {
      'Journaling': 'bg-blue-100 text-blue-800',
      'Productivity': 'bg-green-100 text-green-800',
      'Wellness': 'bg-purple-100 text-purple-800',
      'Decision Making': 'bg-amber-100 text-amber-800',
      'Problem Solving': 'bg-red-100 text-red-800',
      'Business': 'bg-gray-100 text-gray-800',
      'Personal': 'bg-pink-100 text-pink-800',
      'Learning': 'bg-indigo-100 text-indigo-800'
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div 
      className={`
        w-full p-4 rounded-md transition-all duration-200
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-400' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
        }
        cursor-pointer
      `}
      onClick={() => onClick(template)}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{template.title}</h3>
        {isSelected && (
          <span className="text-blue-600 text-xs bg-blue-100 px-2 py-0.5 rounded-full">Selected</span>
        )}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
          {template.category}
        </span>
        <span className="text-xs text-gray-500">
          {isSelected ? 'Click to unselect' : 'Click to select'}
        </span>
      </div>
    </div>
  );
}