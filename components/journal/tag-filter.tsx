'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { journalService } from '@/services/journal/journal-service';

interface TagFilterProps {
  onFilterChange: (tag: string | null) => void;
  currentTag: string | null;
}

export function TagFilter({ onFilterChange, currentTag }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await journalService.getJournalTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error fetching journal tags:', error);
      }
    }

    fetchTags();
  }, []);

  if (availableTags.length === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-2xl p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium text-gray-700">Lọc theo Tag</h3>
        {currentTag && (
          <button
            onClick={() => router.push(`/journal/new?tag=${currentTag}`)}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            + Tạo mới với tag này
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => onFilterChange(currentTag === tag ? null : tag)}
            className={`
              px-3 py-1.5 text-sm rounded-full transition-colors capitalize
              border-2 border-[var(--accent-blue)]
              ${currentTag === tag
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}