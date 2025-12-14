'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, MoreVertical, Trash2 } from 'lucide-react';
import { FlashcardSetStats } from '@/types/flashcardSetStats';
import { toast } from 'sonner';
import { toggleVocabularySetStar } from '@/utils/star-helpers';
import { vocabularyService } from '@/services/vocabulary/vocabulary-service';
import { useAuth } from '@/hooks/auth/use-auth';

interface VocabularySetCardProps {
  vocabularySet: FlashcardSetStats & { is_starred?: boolean };
  onClick?: () => void;
  onStarToggle?: (setId: string, isStarred: boolean) => void;
  onDelete?: (setId: string) => void;
}

// Legacy alias for backward compatibility
export interface FlashcardSetCardProps extends VocabularySetCardProps {
  flashcardSet: FlashcardSetStats;
}

export const VocabularySetCard: React.FC<VocabularySetCardProps> = ({
  vocabularySet,
  onClick,
  onStarToggle,
  onDelete
}) => {
  const { user } = useAuth();
  const [isStarred, setIsStarred] = useState(vocabularySet.is_starred || false);
  const [isStarLoading, setIsStarLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStarToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isStarLoading || !user) return;

    setIsStarLoading(true);

    try {
      const newStarredStatus = await toggleVocabularySetStar(vocabularySet.set_id);

      setIsStarred(newStarredStatus);
      onStarToggle?.(vocabularySet.set_id, newStarredStatus);

      toast.success(
        newStarredStatus ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsStarLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ từ vựng "${vocabularySet.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await vocabularyService.deleteVocabularySet(vocabularySet.set_id);
      setMenuOpen(false);

      if (onDelete) {
        onDelete(vocabularySet.set_id);
      }
    } catch (error) {
      console.error('[VocabularySetCard] Error deleting vocabulary set:', error);
      toast.error('Không thể xóa bộ từ vựng. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const duePercentage =
    vocabularySet.total_flashcards > 0
      ? Math.round((vocabularySet.flashcards_due / vocabularySet.total_flashcards) * 100)
      : 0;

  // Invert the progress: higher due percentage = less full progress bar
  const progressPercentage = 100 - duePercentage;

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer ${deleting ? 'opacity-50 pointer-events-none' : ''
        }`}
      onClick={onClick}
      role="button"
      aria-label={`Open ${vocabularySet.title}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 flex-1 pr-2">{vocabularySet.title}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleStarToggle}
            disabled={isStarLoading}
            className={`p-1 rounded-full transition-colors ${isStarred
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
              } ${isStarLoading ? 'opacity-50' : ''}`}
            aria-label={isStarred ? 'Unstar' : 'Star'}
          >
            <Star
              size={16}
              className={isStarred ? 'fill-current' : ''}
            />
          </button>
        </div>
      </div>

      {(vocabularySet as any).description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{(vocabularySet as any).description}</p>
      )}

      {/* Three-dot menu - Only show for non-default sets */}
      {!(vocabularySet as any).is_default && (
        <div className="absolute bottom-3 right-3" ref={menuOpen ? menuRef : null}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Xóa bộ
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full ${duePercentage > 50
              ? 'bg-red-500'
              : duePercentage > 0
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="mt-auto flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-[var(--primary)] font-medium">{vocabularySet.flashcards_due}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{vocabularySet.total_flashcards}</span>
        </div>

        {vocabularySet.flashcards_due > 0 && (
          <button
            className="text-xs px-2 py-1 bg-[var(--primary-blue-light)] text-[var(--primary)] rounded hover:bg-[var(--primary-blue-lighter)] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Review ${vocabularySet.title} vocabulary`);
            }}
            aria-label="Review vocabulary set"
          >
          </button>
        )}
      </div>
    </div>
  );
};
