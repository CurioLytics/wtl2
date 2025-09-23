'use client';

import { useState } from 'react';
import { JournalTemplate } from '@/types/journal';
import { LiveMarkdownEditor } from '../editor/live-markdown-editor';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TemplatePreviewProps {
  template: JournalTemplate;
  onClose: () => void;
}

export function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const router = useRouter();
  const [content, setContent] = useState<string>(template.content);
  
  const handleStartWriting = () => {
    router.push(`/journal/new?templateId=${template.id}`);
  };

  const handlePreviewEdit = () => {
    // Create a new template with the edited content
    router.push(`/journal/new?templateId=${template.id}&customContent=${encodeURIComponent(content)}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{template.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <LiveMarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Template content..."
            minHeight={400}
          />
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleStartWriting}>
            Use Template
          </Button>
          {content !== template.content && (
            <Button variant="default" onClick={handlePreviewEdit}>
              Use Edited Version
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}