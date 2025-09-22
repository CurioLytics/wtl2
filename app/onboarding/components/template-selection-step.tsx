'use client';

import React from 'react';
import type { JournalTemplate, JournalTemplateCategory } from '@/types/journal';

interface TemplateCardProps {
  template: JournalTemplate;
  selected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <img src={template.icon} alt="" className="w-5 h-5 mt-1" />
        <div>
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        </div>
      </div>
    </button>
  );
}

interface TemplateGroupProps {
  category: JournalTemplateCategory;
  templates: JournalTemplate[];
  selectedTemplates: string[];
  onToggleTemplate: (templateId: string) => void;
}

function TemplateGroup({ category, templates, selectedTemplates, onToggleTemplate }: TemplateGroupProps) {
  const categoryTemplates = templates.filter(t => t.category === category);

  if (categoryTemplates.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">{category}</h2>
      <div className="grid gap-4">
        {categoryTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selectedTemplates.includes(template.id)}
            onSelect={() => onToggleTemplate(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TemplateSelectionStepProps {
  selectedTemplates: string[];
  onToggleTemplate: (templateId: string) => void;
}

export function TemplateSelectionStep({ selectedTemplates, onToggleTemplate }: TemplateSelectionStepProps) {
  const [templates, setTemplates] = React.useState<JournalTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/journal-templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data.templates);
      } catch (err) {
        setError('Failed to load templates. Please try again.');
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-emerald-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Choose a Template</h2>
        <p className="text-gray-600 mt-2">Choose how you'd like to start writing today</p>
      </div>

      <div className="space-y-8">
        {['Daily Journals', 'Wellness & Growth', 'Decision & Problem-Solving'].map((category) => (
          <TemplateGroup
            key={category}
            category={category as JournalTemplateCategory}
            templates={templates}
            selectedTemplates={selectedTemplates}
            onToggleTemplate={onToggleTemplate}
          />
        ))}
      </div>
    </div>
  );
}