'use client';

import React, { useState } from 'react';
import { JournalTemplate } from '@/types/journal';
import { cn } from '@/utils/ui';
import { TemplatePreview } from './template-preview';
import styles from './template-collection.module.css';

interface TemplateCardProps {
  template: JournalTemplate;
  onClick: (template: JournalTemplate) => void;
  isSelected?: boolean;
}

/**
 * TemplateCard displays an individual journal template as a card
 * with consistent styling and interactive elements
 */
export function TemplateCard({ template, onClick, isSelected = false }: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  // Helper function to get an appropriate emoji based on template tags
  const getTemplateEmoji = (): string => {
    if (!template.tag || template.tag.length === 0) return '📝';
    
    // Map common tags to emojis
    const tagToEmoji: Record<string, string> = {
      'Journaling': '📓',
      'Productivity': '⏱️',
      'Wellness': '🧠',
      'Decision Making': '⚖️',
      'Problem Solving': '🧩',
      'Business': '💼',
      'gratitude': '🙏',
      'mindfulness': '🧘‍♀️',
      'reflection': '💭',
      'goals': '🎯',
      'habits': '📊',
      'mood': '😊',
      'decisions': '🔍',
      'planning': '📝',
      'strategy': '🎯',
      'meeting': '👥',
      'finance': '💰',
      'health': '❤️'
    };
    
    // Find the first tag that matches our emoji map
    for (const tag of template.tag) {
      if (tagToEmoji[tag]) return tagToEmoji[tag];
    }
    
    return '📝'; // Default emoji
  };

  // Get a short description from the content or other field
  const getTemplateDescription = (): string => {
    if (template.other) return template.other;
    
    // Extract first sentence or first 80 characters from content as description
    const firstSentence = template.content.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length < 100) {
      return firstSentence + '...';
    }
    
    return template.content.substring(0, 80) + '...';
  };

  // Get relevant tags (excluding category tags which are displayed separately)
  const getRelevantTags = (): string[] => {
    const categoryTags = ['Journaling', 'Productivity', 'Wellness', 'Decision Making', 'Problem Solving', 'Business'];
    return template.tag.filter(tag => !categoryTags.includes(tag)).slice(0, 3);
  };
  
  return (
    <>
      <div 
        className={cn(
          "flex flex-col h-64 w-full max-w-xs rounded-lg overflow-hidden shadow-sm border transition-all duration-200",
          isSelected 
            ? "border-primary ring-2 ring-primary/20" 
            : "border-gray-200 hover:border-primary/60 hover:shadow-md",
          "cursor-pointer",
          styles.templateCard
        )}
        onClick={() => {
          onClick(template);
          setShowPreview(true);
        }}
        role="button"
        aria-pressed={isSelected}
        tabIndex={0}
      >
        {/* Card header with emoji and title */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <span className="text-2xl mr-3" role="img" aria-hidden="true">
            {getTemplateEmoji()}
          </span>
          <h3 className="font-medium text-gray-800 line-clamp-1 text-lg">
            {template.name}
          </h3>
        </div>
        
        {/* Card body with description */}
        <div className="flex-grow p-4 bg-white">
          <p className="text-sm text-gray-600 line-clamp-4">
            {getTemplateDescription()}
          </p>
        </div>
        
        {/* Card footer with tags */}
        <div className="p-3 bg-gray-50/50">
          <div className="flex flex-wrap gap-1">
            {getRelevantTags().map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full 
                          bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Preview modal */}
      {showPreview && (
        <TemplatePreview 
          template={template} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
}