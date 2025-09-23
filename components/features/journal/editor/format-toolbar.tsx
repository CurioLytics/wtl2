'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Bold, 
  Italic, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  Check,
  Highlighter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormatToolbarProps {
  editor: Editor | null;
}

export function FormatToolbar({ editor }: FormatToolbarProps) {
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Toggle format options dropdown
  const toggleFormatOptions = () => {
    setShowFormatOptions(!showFormatOptions);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowFormatOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative" ref={toolbarRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleFormatOptions}
        className="flex items-center gap-1 text-gray-700"
      >
        <span>Format</span>
        {showFormatOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      
      {showFormatOptions && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 divide-y divide-gray-100">
            {/* Text formatting group */}
            <div className="px-1 py-1">
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('bold') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold size={16} />
                <span>Bold</span>
                <span className="ml-auto text-xs text-gray-500">**text**</span>
              </button>
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('italic') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic size={16} />
                <span>Italic</span>
                <span className="ml-auto text-xs text-gray-500">*text*</span>
              </button>
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('highlight') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
              >
                <Highlighter size={16} />
                <span>Highlight</span>
                <span className="ml-auto text-xs text-gray-500">==text==</span>
              </button>
            </div>
            
            {/* Block formatting group */}
            <div className="px-1 py-1">
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 size={16} />
                <span>Heading</span>
                <span className="ml-auto text-xs text-gray-500">## text</span>
              </button>
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('blockquote') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <Quote size={16} />
                <span>Quote</span>
                <span className="ml-auto text-xs text-gray-500">&gt; text</span>
              </button>
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('code') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleCode().run()}
              >
                <Code size={16} />
                <span>Inline Code</span>
                <span className="ml-auto text-xs text-gray-500">`code`</span>
              </button>
            </div>
            
            {/* Lists group */}
            <div className="px-1 py-1">
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List size={16} />
                <span>Bullet List</span>
                <span className="ml-auto text-xs text-gray-500">- item</span>
              </button>
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered size={16} />
                <span>Numbered List</span>
                <span className="ml-auto text-xs text-gray-500">1. item</span>
              </button>
              <button 
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm ${editor.isActive('taskList') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              >
                <Check size={16} className="rounded border border-gray-400" />
                <span>Task List</span>
                <span className="ml-auto text-xs text-gray-500">[ ] task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}