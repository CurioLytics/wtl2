'use client';

import React from 'react';
import { VocabCollection } from '@/types/vocab';

interface VocabCardProps {
  collection: VocabCollection;
  onAddClick?: () => void;
}

export const VocabCard: React.FC<VocabCardProps> = ({ collection, onAddClick }) => {
  // Calculate mastery percentage for the progress display
  const masteryPercentage = collection.wordsCount > 0 
    ? Math.round((collection.masteredCount / collection.wordsCount) * 100) 
    : 0;
  
  // Format the date to display
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    month: 'short',
    day: 'numeric' 
  }).format(collection.createdAt);
  
  // Get icon based on collection type
  const getTypeIcon = () => {
    switch (collection.type) {
      case 'role-play':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'journal':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'topic':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        );
      case 'chat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        );
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => console.log(`View collection ${collection.id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{collection.title}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddClick && onAddClick();
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Add word"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      {/* Collection type badge */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          {getTypeIcon()}
          {collection.type.charAt(0).toUpperCase() + collection.type.slice(1).replace('-', ' ')}
        </span>
        <span className="mx-1">•</span>
        <span>{formattedDate}</span>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">{collection.description}</p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div 
          className="bg-teal-500 h-1.5 rounded-full" 
          style={{ width: `${masteryPercentage}%` }}
        ></div>
      </div>
      
      {/* Stats display */}
      <div className="mt-auto flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-emerald-500 font-medium">{collection.masteredCount}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{collection.wordsCount}</span>
          <span className="text-gray-400 text-xs ml-1">words</span>
        </div>
        
        {/* Display the percentage with appropriate color */}
        <div className={`text-sm font-medium ${getPercentageColorClass(masteryPercentage)}`}>
          {masteryPercentage}%
        </div>
      </div>
    </div>
  );
};

// Helper function to determine text color based on percentage
function getPercentageColorClass(percentage: number): string {
  if (percentage >= 80) {
    return 'text-emerald-500'; // Green for high mastery
  } else if (percentage >= 50) {
    return 'text-blue-500';    // Blue for medium mastery
  } else if (percentage >= 20) {
    return 'text-amber-500';   // Amber for low mastery
  } else {
    return 'text-rose-500';    // Red for very low mastery
  }
}