'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { FormatToolbar } from './format-toolbar';
import { htmlToMarkdown, markdownToHtml } from '@/utils/editor-utils';
import styles from './live-markdown-editor.module.css';

const lowlight = createLowlight();

interface LiveMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function LiveMarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
}: LiveMarkdownEditorProps) {
  // Track if content is being set from external source
  const [isExternalUpdate, setIsExternalUpdate] = useState(false);
  // Track view mode (edit or preview)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  // Initialize TipTap editor with extensions
  const editor = useEditor({
    // Set immediatelyRender to false for SSR compatibility
    immediatelyRender: false,
    extensions: [
      // Basic functionality and markdown shortcuts
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
        code: {},
        codeBlock: {},
        blockquote: {},
      }),
      // Add placeholder text
      Placeholder.configure({
        placeholder,
        showOnlyCurrent: false,
        includeChildren: true,
      }),
      // Task list functionality for checkboxes
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        }
      }),
      TaskItem.configure({
        nested: true,
      }),
      // Highlight text with ==text== syntax
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: 'highlighted-text',
        }
      }),
      // Smart typography (quotes, dashes, etc.)
      Typography,
      // Code blocks with syntax highlighting
      CodeBlockLowlight.configure({
        lowlight: lowlight,
      }),
    ],
    content: value,
    autofocus: false,
    onUpdate: ({ editor }) => {
      // Only trigger onChange if it's not an external update
      if (!isExternalUpdate) {
        const markdown = htmlToMarkdown(editor.getHTML());
        onChange(markdown);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4',
        style: `min-height: ${minHeight}px`,
      },
    },
  });
  
  // Sync external value changes with editor
  useEffect(() => {
    if (editor) {
      // Convert incoming markdown to HTML for the editor
      const html = markdownToHtml(value);
      
      // Only update if content is actually different
      if (editor.getHTML() !== html) {
        setIsExternalUpdate(true);
        editor.commands.setContent(html);
        
        // Reset the flag after a short delay
        setTimeout(() => {
          setIsExternalUpdate(false);
        }, 10);
      }
    }
  }, [value, editor]);
  
  // Utility function to convert editor HTML content to markdown
  const getMarkdownContent = useCallback(() => {
    if (!editor) return '';
    
    // Convert HTML to Markdown using our utility function
    const html = editor.getHTML();
    return htmlToMarkdown(html);
  }, [editor]);

  // Check for client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={styles.liveMarkdownEditor}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="flex bg-gray-100 rounded-md p-1">
            <Button
              type="button"
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="text-sm"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="text-sm"
            >
              Preview
            </Button>
          </div>
        </div>
        
        {/* Format toolbar - only show in edit mode and on client */}
        {isClient && viewMode === 'edit' && <FormatToolbar editor={editor} />}
      </div>
      
      <div className="border rounded-md bg-white">
        {!isClient ? (
          // Display a loading state or placeholder during SSR
          <div 
            className="prose prose-sm sm:prose-base max-w-none p-4"
            style={{ minHeight: `${minHeight}px` }}
          >
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
            ) : (
              <p className="text-gray-400">{placeholder}</p>
            )}
          </div>
        ) : viewMode === 'edit' ? (
          <EditorContent editor={editor} className={styles.editorContent} />
        ) : (
          <div 
            className="prose prose-sm sm:prose-base max-w-none p-4"
            style={{ minHeight: `${minHeight}px` }}
            dangerouslySetInnerHTML={{ __html: editor ? editor.getHTML() : markdownToHtml(value) }}
          />
        )}
      </div>
    </div>
  );
}