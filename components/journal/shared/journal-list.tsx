'use client';

import React from 'react';
import { Journal } from '@/types/journal';
import { formatDistanceToNow } from '@/utils/date-utils';
import { cn } from '@/utils/ui';
import { EmptyStateCard } from '@/components/ui/empty-state';

interface JournalListProps {
  journals: Journal[];
  onSelect: (journal: Journal) => void;
  selectedJournalId?: string;
  className?: string;
  emptyState?: {
    icon?: string;
    title?: string;
    description?: string;
  };
}

/**
 * Shared JournalList component that displays a list of journal entries
 * with consistent styling and selection state
 */
export function JournalList({
  journals,
  onSelect,
  selectedJournalId,
  className = '',
  emptyState = {
    icon: '📝',
    title: 'No Journal Entries Yet',
    description: 'Start your writing journey with a new journal entry.'
  }
}: JournalListProps) {

  if (journals.length === 0) {
    return (
      <EmptyStateCard
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        className={className}
        bordered
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {journals.map(journal => (
        <JournalListItem
          key={journal.id}
          journal={journal}
          onSelect={onSelect}
          isSelected={selectedJournalId === journal.id}
        />
      ))}
    </div>
  );
}

interface JournalListItemProps {
  journal: Journal;
  onSelect: (journal: Journal) => void;
  isSelected: boolean;
}

/**
 * Individual journal list item component
 */
function JournalListItem({ journal, onSelect, isSelected }: JournalListItemProps) {
  return (
    <div
      onClick={() => onSelect(journal)}
      className={cn(
        "p-4 rounded-lg border transition-all duration-200 cursor-pointer",
        isSelected
          ? "bg-blue-50 border-blue-300 shadow-sm"
          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 truncate max-w-xs">
          {journal.title || 'Untitled Entry'}
        </h4>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {formatDistanceToNow(new Date(journal.created_at))} ago
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">
        {journal.content?.substring(0, 150)}
        {journal.content && journal.content.length > 150 ? '...' : ''}
      </p>

      {/* TODO: Tags are in separate journal_tag table, need to join/fetch separately */}
    </div>
  );
}