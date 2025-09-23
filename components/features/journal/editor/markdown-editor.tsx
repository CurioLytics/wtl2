'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';
import { Button } from '@/components/ui/button';
import { FormatDropdown } from './format-dropdown';
import styles from './markdown-editor.module.css';

// Markdown parser instance
const md = new MarkdownIt({
  breaks: true,        // Convert '\n' to <br>
  linkify: true,       // Auto-convert URLs to links
  typographer: true,   // Enable smartquotes and other typographic replacements
})
// Add task lists support (- [ ] and - [x])
.use(markdownItTaskLists);

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Format handlers
  const formatText = (formatType: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = 1;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        cursorPosition = 3;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        cursorPosition = 2;
        break;
      case 'bullet-list':
        formattedText = selectedText
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : '- ';
        cursorPosition = 2;
        break;
      case 'numbered-list':
        formattedText = selectedText
          ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
          : '1. ';
        cursorPosition = 3;
        break;
      case 'task-list':
        formattedText = selectedText
          ? selectedText.split('\n').map(line => `- [ ] ${line}`).join('\n')
          : '- [ ] ';
        cursorPosition = 6;
        break;
      case 'highlight':
        formattedText = `==${selectedText}==`;
        cursorPosition = 2;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorPosition = 1;
        break;
      default:
        return;
    }
    
    // Apply the formatting
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Set cursor position appropriately
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + cursorPosition, start + formattedText.length - cursorPosition);
      } else {
        textarea.setSelectionRange(start + cursorPosition, start + cursorPosition);
      }
    }, 0);
  };

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
        
        {/* Format dropdown */}
        <FormatDropdown onFormatClick={formatText} />
      </div>

      {isPreviewMode ? (
        <div 
          className="prose max-w-none p-4 border rounded-md bg-white min-h-[300px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: md.render(value) }}
        />
      ) : (
        <div className="border rounded-md bg-white">
          <MDEditor
            value={value}
            onChange={(val) => onChange(val || '')}
            height={minHeight}
            textareaProps={{
              placeholder,
              ref: textareaRef as any, // Type issue with MDEditor
            }}
            preview="edit"
            hideToolbar={true}
          />
        </div>
      )}
    </div>
  );
}