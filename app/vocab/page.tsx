'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useResponsive } from '@/hooks/common/use-responsive';
import { zIndex } from '@/utils/z-index';
import { FlashcardSetList } from '@/components/vocab/flashcard-set-list';
import { FlashcardSet } from '@/types/vocab';
import { flashcardService } from '@/services/api/flashcard-service';

export default function VocabPage() {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(true);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  
  // Load flashcard sets on component mount
  useEffect(() => {
    async function loadFlashcardSets() {
      if (!user?.id) return;
      
      setIsLoadingFlashcards(true);
      setFlashcardError(null);
      
      try {
        const sets = await flashcardService.getFlashcardSets(user.id);
        setFlashcardSets(sets);
      } catch (error) {
        console.error('Error loading flashcard sets:', error);
        setFlashcardError('Failed to load flashcard sets. Please try again.');
      } finally {
        setIsLoadingFlashcards(false);
      }
    }
    
    loadFlashcardSets();
  }, [user?.id]);
  
  // Handler functions for action buttons
  
  const handleReviewVocab = () => {
    // Placeholder function for reviewing vocabulary
    console.log('Review vocabulary');
    // In a real implementation, this would navigate to the vocabulary review page
  };
  
  const handleStoryTranslation = () => {
    // Placeholder function for story translation
    console.log('Story translation');
    // In a real implementation, this would navigate to the story translation page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Your Vocab Hub</h1>
          <button
            onClick={() => {}}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Export vocabulary"
          >
            ↗ Export
          </button>
        </div>
        
        {/* Flashcard Sets Section */}
        <div className="mb-8">
          <FlashcardSetList
            flashcardSets={flashcardSets}
            isLoading={isLoadingFlashcards}
            error={flashcardError}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={handleReviewVocab}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md shadow-sm transition"
          >
            Review Vocabulary
          </button>
          <button
            onClick={handleStoryTranslation}
            className="px-6 py-3 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-md shadow-sm transition"
          >
            Story Translation
          </button>
        </div>
      </div>
    </div>
  );
}
