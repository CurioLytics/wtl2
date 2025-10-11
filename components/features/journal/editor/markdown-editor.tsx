'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './markdown-editor.module.css';

// Types
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...', 
  minHeight = 300 
}: MarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className={`${styles['markdown-editor']} w-full`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {/* Preview toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="text-gray-700"
          >
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        <div 
          className="prose max-w-none p-4 border rounded-md bg-white min-h-[300px] overflow-y-auto"
        >
          <pre className="whitespace-pre-wrap font-sans">{value}</pre>
        </div>
      ) : (
        <div className="border rounded-md bg-white">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 border-0 rounded-md resize-none focus:outline-none"
            style={{ minHeight: `${minHeight}px` }}
          />
        </div>
      )}
    </div>
  );
}