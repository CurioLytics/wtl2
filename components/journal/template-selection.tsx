'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JournalTemplate, JournalTemplateCategory, TEMPLATE_CATEGORIES } from '@/types/journal';
import { journalTemplateService } from '@/services/api/journal-template-service';
import { PinnedTemplates } from './pinned-templates';
import { CategorySection } from './category-section';
import { LoadingState, ErrorState } from './state-components';

interface TemplateSelectionProps {
  onClose?: () => void;
  showAllTemplatesLink?: boolean;
}

export function TemplateSelection({ onClose, showAllTemplatesLink = true }: TemplateSelectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<JournalTemplateCategory, JournalTemplate[]>>(
    {} as Record<JournalTemplateCategory, JournalTemplate[]>
  );
  const [pinnedTemplates, setPinnedTemplates] = useState<JournalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        // Get all templates grouped by category
        const templatesData = await journalTemplateService.getTemplatesByCategory();
        setTemplates(templatesData);
        
        // Get pinned/featured templates
        const pinnedData = await journalTemplateService.getPinnedTemplates();
        setPinnedTemplates(pinnedData);
        
        setError(null);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load journal templates. Please try again.');
        
        // Set empty templates as fallback
        const fallbackTemplates = {} as Record<JournalTemplateCategory, JournalTemplate[]>;
        TEMPLATE_CATEGORIES.forEach(category => {
          fallbackTemplates[category] = [];
        });
        setTemplates(fallbackTemplates);
        setPinnedTemplates([]);
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
    } else {
      router.push('/journal/new');
    }
  };

  const handleBlankPageSelect = () => {
    router.push('/journal/new');
  };

  const handleViewAllTemplates = () => {
    router.push('/journal/templates');
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

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Start Writing</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Quick start buttons */}
        <div className="flex gap-3 mb-6">
          <button 
            onClick={handleBlankPageSelect}
            className="flex-1 py-2 px-4 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-sm"
          >
            <span className="block text-lg mb-1">📝</span>
            Blank Page
          </button>
          
          <button 
            onClick={() => {
              // Get today's template if exists, otherwise go with blank page
              const todayTemplate = pinnedTemplates.find(t => t.tag.includes('daily'));
              if (todayTemplate) {
                router.push(`/journal/new?templateId=${todayTemplate.id}`);
              } else {
                handleBlankPageSelect();
              }
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-sm"
          >
            <span className="block text-lg mb-1">📅</span>
            Today's Entry
          </button>
        </div>

        {/* Pinned Templates */}
        {pinnedTemplates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Templates</h3>
            <PinnedTemplates 
              templates={pinnedTemplates} 
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
            />
          </div>
        )}

        {/* Selected main category (e.g. "Journaling") */}
        <div className="mb-4">
          <CategorySection
            category="Journaling"
            templates={(templates.Journaling || []).slice(0, 2)}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>

        {/* View all templates link */}
        {showAllTemplatesLink && (
          <div className="text-center mt-6">
            <button
              onClick={handleViewAllTemplates}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Browse All Templates
            </button>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="bg-gray-50 border-t px-4 py-3 flex justify-end">
        <button
          onClick={handleStartWriting}
          disabled={!selectedTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {selectedTemplate ? 'Use This Template' : 'Select a Template'}
        </button>
      </div>
    </div>
  );
}