'use client';

import React from 'react';
import { JournalTemplate, JournalTemplateCategory } from '@/types/journal';
import { TemplateCard } from './template-card';
import styles from './template-collection.module.css';

interface CategorySectionProps {
  category: JournalTemplateCategory;
  templates: JournalTemplate[]; // Templates should already be filtered by category
  selectedTemplate: JournalTemplate | null;
  onTemplateSelect: (template: JournalTemplate) => void;
}

/**
 * CategorySection displays templates for a specific category in a grid layout
 */
export function CategorySection({ 
  category, 
  templates, 
  selectedTemplate, 
  onTemplateSelect 
}: CategorySectionProps) {
  // Get the corresponding emoji for the category
  const getCategoryEmoji = (): string => {
    const categoryEmojis: Record<JournalTemplateCategory, string> = {
      'Journaling': '�',
      'Productivity': '⏱️',
      'Wellness': '�',
      'Decision Making': '⚖️',
      'Problem Solving': '🧩',
      'Business': '💼'
    };
    
    return categoryEmojis[category] || '📝';
  };
  
  // If no templates, show empty state
  if (templates.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No templates found</h3>
          <p className="text-sm text-gray-500">
            There are no templates available in this category yet.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3" role="img" aria-hidden="true">
          {getCategoryEmoji()}
        </span>
        <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
      </div>
      
      <div className={styles.cardGrid}>
        {templates.map(template => (
          <TemplateCard 
            key={template.id}
            template={template}
            onClick={onTemplateSelect}
            isSelected={selectedTemplate?.id === template.id}
          />
        ))}
      </div>
    </div>
  );
}