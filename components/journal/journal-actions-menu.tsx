'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Calendar, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateInput, parseDateInput } from '@/utils/date-utils';
import { journalService } from '@/services/journal/journal-service';

interface JournalActionsMenuProps {
  journalId?: string;
  currentDate: string;
  currentTags: string[];
  onDateChange: (date: string) => void;
  onTagsChange: (tags: string[]) => void;
  onDelete: () => void;
}

export function JournalActionsMenu({
  journalId,
  currentDate,
  currentTags,
  onDateChange,
  onTagsChange,
  onDelete
}: JournalActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const tags = await journalService.getJournalTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setAvailableTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    if (showTagSelector) {
      fetchTags();
    }
  }, [showTagSelector]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDatePicker(false);
        setShowTagSelector(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    onDateChange(newDate);
    setShowDatePicker(false);
  };

  const handleTagToggle = (tag: string) => {
    const isSelected = currentTags.includes(tag);
    if (isSelected) {
      onTagsChange(currentTags.filter(t => t !== tag));
    } else {
      onTagsChange([...currentTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      onTagsChange([...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(currentTags.filter(t => t !== tagToRemove));
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài nhật ký này?')) {
      onDelete();
    }
    setIsOpen(false);
  };

  // Format date for display
  const dateValue = parseDateInput(currentDate) ? formatDateInput(parseDateInput(currentDate)!) : currentDate;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* Date Picker Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Date</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {showDatePicker ? 'Close' : 'Edit'}
                </Button>
              </div>
              {showDatePicker ? (
                <Input
                  type="date"
                  value={dateValue}
                  onChange={handleDateChange}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {parseDateInput(currentDate)?.toLocaleDateString('vi-VN') || 'No date set'}
                </p>
              )}
            </div>

            {/* Tags Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Tags</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {showTagSelector ? 'Close' : 'Edit'}
                </Button>
              </div>

              {/* Current Tags */}
              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {currentTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {showTagSelector && (
                <div className="space-y-2">
                  {/* Add new tag */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add new tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddNewTag}
                      disabled={!newTag.trim()}
                      className="text-xs px-2 py-1"
                    >
                      +
                    </Button>
                  </div>

                  {/* Available Tags */}
                  {isLoadingTags ? (
                    <p className="text-xs text-gray-500">Đang tải tags...</p>
                  ) : availableTags.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto">
                      <p className="text-xs text-gray-500 mb-1">Available tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`text-xs px-2 py-1 rounded-full transition-colors ${currentTags.includes(tag)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No tags available</p>
                  )}
                </div>
              )}
            </div>

            {/* Delete Section */}
            {journalId && (
              <div className="px-4 py-3">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md px-2 py-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}