'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LiveMarkdownEditor, type LiveMarkdownEditorRef } from '@/components/features/journal/editor';
import { JournalActionsMenu } from '@/components/journal/journal-actions-menu';
import { FloatingVoiceButton } from '@/components/journal/floating-voice-button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { Loader2 } from 'lucide-react';

interface JournalEditorLayoutProps {
  title: string;
  content: string;
  journalDate: string;
  tags: string[];
  journalId?: string;
  isSaving: boolean;
  isGettingFeedback: boolean;
  error: string | null;
  hasContent?: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onDateChange: (date: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  onGetFeedback: () => void;
  onDelete: () => void;
  onNavigate?: (path: string) => void;
}

export function JournalEditorLayout({
  title,
  content,
  journalDate,
  tags,
  journalId,
  isSaving,
  isGettingFeedback,
  error,
  hasContent = true,
  onTitleChange,
  onContentChange,
  onDateChange,
  onTagsChange,
  onSave,
  onGetFeedback,
  onDelete,
  onNavigate,
}: JournalEditorLayoutProps) {
  const editorRef = useRef<LiveMarkdownEditorRef>(null);

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    if (isFinal && editorRef.current) {
      editorRef.current.insertTextAtCursor(text);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/journal');
    }
  };

  // Don't show loading screen - let editor stay visible with disabled buttons
  // The feedback page will show the loading screen after navigation

  return (
    <div className="bg-white px-6 py-8">
      <main className="max-w-3xl w-full mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/journal"
            className="text-blue-600 text-sm hover:underline"
            onClick={handleBackClick}
          >
            ⬅ Back to Journal
          </Link>
          <div className="flex items-center gap-3">
            <JournalActionsMenu
              journalId={journalId}
              currentDate={journalDate}
              currentTags={tags}
              onDateChange={onDateChange}
              onTagsChange={onTagsChange}
              onDelete={onDelete}
            />
            <button onClick={onSave} className="btn-black-outline" disabled={!hasContent || isSaving || isGettingFeedback}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </button>
            <button onClick={onGetFeedback} className="btn-black-primary" disabled={!hasContent || !content || !title || isSaving || isGettingFeedback}>
              Phân tích
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tiêu đề..."
            className="text-3xl font-semibold focus:outline-none placeholder-gray-400 bg-transparent w-full"
          />
        </div>

        <LiveMarkdownEditor
          ref={editorRef}
          value={content}
          onChange={onContentChange}
          placeholder="Bắt đầu viết ở đây..."
          minHeight={400}
        />

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </main>
      {!isSaving && !isGettingFeedback && <FloatingVoiceButton onTranscript={handleVoiceTranscript} />}
    </div>
  );
}
