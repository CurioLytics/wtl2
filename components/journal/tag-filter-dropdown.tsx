'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { journalService } from '@/services/journal/journal-service';
import { ChevronDown } from 'lucide-react';

interface TagFilterDropdownProps {
    onFilterChange: (tag: string | null) => void;
    currentTag: string | null;
}

export function TagFilterDropdown({ onFilterChange, currentTag }: TagFilterDropdownProps) {
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
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
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
            >
                <span className="text-sm font-medium text-gray-700 capitalize">
                    {currentTag || 'All Tags'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown menu */}
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                        <button
                            onClick={() => {
                                onFilterChange(null);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${!currentTag ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                }`}
                        >
                            All Tags
                        </button>

                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    onFilterChange(tag);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors capitalize ${currentTag === tag ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}

                        {currentTag && (
                            <div className="border-t border-gray-200 p-2">
                                <button
                                    onClick={() => {
                                        router.push(`/journal/new?tag=${currentTag}`);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-xs px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    + Create with this tag
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
