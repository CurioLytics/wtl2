'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { Journal } from '@/types/journal';
import { formatDate } from '@/utils/date-utils';
import { journalService } from '@/services/journal/journal-service';

interface JournalListProps {
  journals: Journal[];
  onSelect: (journal: Journal) => void;
  selectedJournalId?: string;
  onDelete?: (journalId: string) => void;
}

export function JournalList({ journals, onSelect, selectedJournalId, onDelete }: JournalListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (journalId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('Bạn có chắc chắn muốn xóa bài nhật ký này?')) {
      return;
    }

    setDeletingId(journalId);
    try {
      await journalService.deleteJournal(journalId);
      setMenuOpenId(null);
      if (onDelete) {
        onDelete(journalId);
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      alert('Không thể xóa nhật ký. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  if (journals.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Journal Entries Yet</h3>
        <p className="text-sm text-gray-600">Start your writing journey with a new journal entry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {journals.map(journal => (
        <div
          key={journal.id}
          className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${selectedJournalId === journal.id
              ? 'bg-blue-50 border-[var(--accent-blue)] shadow-sm'
              : 'bg-white border-gray-200 hover:border-[var(--accent-blue)] hover:bg-blue-50/30'
            } ${deletingId === journal.id ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div
            onClick={() => onSelect(journal)}
            className="cursor-pointer"
            role="button"
            aria-pressed={selectedJournalId === journal.id}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800 line-clamp-1 pr-8">
                {journal.title || 'Untitled Entry'}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatDate(new Date(journal.journal_date))}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {journal.content}
            </p>
          </div>

          {/* Three-dot menu */}
          <div className="absolute top-3 right-3" ref={menuOpenId === journal.id ? menuRef : null}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === journal.id ? null : journal.id);
              }}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>

            {menuOpenId === journal.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <button
                  onClick={(e) => handleDelete(journal.id, e)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}