'use client';

import { useState, useEffect } from 'react';
import styles from './live-markdown-editor.module.css';

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
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.liveMarkdownEditor}>
      <div className="border rounded-md bg-white">
        {!isClient ? (
          // Display a loading state or placeholder during SSR
          <div 
            className="prose prose-sm sm:prose-base max-w-none p-4"
            style={{ minHeight: `${minHeight}px` }}
          >
            {value ? (
              <pre className="whitespace-pre-wrap font-sans">{value}</pre>
            ) : (
              <p className="text-gray-400">{placeholder}</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="w-full p-4 border-0 rounded-md resize-none focus:outline-none"
            style={{ minHeight: `${minHeight}px` }}
          />
        )}
      </div>
    </div>
  );
}