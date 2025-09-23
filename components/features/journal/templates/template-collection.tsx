'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JournalTemplate, JournalTemplateCategory, TEMPLATE_CATEGORIES } from '@/types/journal';
import { journalTemplateService } from '@/services/api/journal-template-service';
import { cn } from '@/utils/ui';
import { CategorySection } from './category-section';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/common/state-components';
import styles from './template-collection.module.css';

/**
 * TemplateCollection provides a tab-based interface for browsing and selecting
 * journal templates organized by category
 */
export function TemplateCollection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<JournalTemplateCategory>(TEMPLATE_CATEGORIES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null);
  // State to store templates grouped by category
const [templates, setTemplates] = useState<Record<JournalTemplateCategory, JournalTemplate[]>>({} as Record<JournalTemplateCategory, JournalTemplate[]>);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        const templatesData = await journalTemplateService.getTemplatesByCategory();
        setTemplates(templatesData);
        setError(null);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load journal templates. Please try again.');
        
        // Set empty template categories as fallback
        const fallbackTemplates = {} as Record<JournalTemplateCategory, JournalTemplate[]>;
        TEMPLATE_CATEGORIES.forEach(category => {
          fallbackTemplates[category] = [];
        });
        setTemplates(fallbackTemplates);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplates();
  }, []);

  const handleTemplateSelect = (template: JournalTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStartWriting = () => {
    if (selectedTemplate) {
      router.push(`/journal/new?templateId=${selectedTemplate.id}`);
    }
  };

  const handleBlankPageSelect = () => {
    router.push('/journal/new');
  };

  const handleCategorySelect = (category: JournalTemplateCategory) => {
    setSelectedCategory(category);
  };

  // Total count of all templates
  const getTotalTemplatesCount = (): number => {
    return Object.values(templates).reduce((acc, categoryTemplates) => {
      return acc + categoryTemplates.length;
    }, 0);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // If no templates across all categories
  if (getTotalTemplatesCount() === 0) {
    return (
      <EmptyState
        icon="📝"
        title="No Templates Found"
        message="We couldn't find any journal templates. You can still create a blank journal entry."
        actionLabel="Start with Blank Page"
        onAction={handleBlankPageSelect}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          <span className="inline-block mr-2">📝</span> Choose a Template
        </h1>
        
        <button
          onClick={handleBlankPageSelect}
          className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <span className="mr-2">�</span>
          Blank Page
        </button>
      </div>
      
      {/* Category tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className={cn("-mb-px flex space-x-6 overflow-x-auto", styles.categoryTabs)} aria-label="Template Categories">
          {TEMPLATE_CATEGORIES.map((category) => {
            const count = templates[category]?.length || 0;
            const isActive = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={cn(
                  "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm",
                  isActive
                    ? "border-primary text-primary " + styles.activeTab
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {category}
                {count > 0 && (
                  <span className={cn(
                    "ml-2 py-0.5 px-2 rounded-full text-xs",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Visible only on mobile */}
      <div className="sm:hidden mb-6">
        <button
          onClick={handleBlankPageSelect}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <span className="mr-2">📄</span>
          Start with Blank Page
        </button>
      </div>
      
      {/* Templates for selected category */}
      <div
        key={selectedCategory}
        className="transition-opacity duration-300"
      >
        <CategorySection 
          category={selectedCategory}
          templates={templates[selectedCategory] || []}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
      
      {/* Action footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 mt-8 py-4 px-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedTemplate ? `Selected: ${selectedTemplate.name}` : 'Select a template to continue'}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBlankPageSelect}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Skip to Free Writing
          </button>
          <button
            onClick={handleStartWriting}
            className="px-4 py-2 bg-primary text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedTemplate}
          >
            Start Writing
          </button>
        </div>
      </div>
    </div>
  );
}