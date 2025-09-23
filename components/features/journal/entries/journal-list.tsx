'use client';

import React from 'react';
import { Journal } from '@/types/journal';
import { formatDistanceToNow } from '@/utils/date-utils';

interface JournalListProps {
  journals: Journal[];
  onSelect: (journal: Journal) => void;
  selectedJournalId?: string;
}

export function JournalList({ journals, onSelect, selectedJournalId }: JournalListProps) {
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
          onClick={() => onSelect(journal)}
          className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
            selectedJournalId === journal.id
              ? 'bg-blue-50 border-blue-300 shadow-sm'
              : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
          }`}
          role="button"
          aria-pressed={selectedJournalId === journal.id}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-800 line-clamp-1">
              {journal.title || 'Untitled Entry'}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatDistanceToNow(new Date(journal.created_at))}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {journal.content}
          </p>
        </div>
      ))}
    </div>
  );
}