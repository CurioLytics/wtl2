'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useResponsive } from '@/hooks/common/use-responsive';
import { zIndex } from '@/utils/z-index';
import { VocabCard } from '@/components/vocab/vocab-card';
import { FlashcardSetList } from '@/components/vocab/flashcard-set-list';
import { EmptyState } from '@/components/vocab/empty-state';
import { MOCK_VOCAB_COLLECTIONS } from '@/utils/mock-vocab-data';
import { VocabCollection, FlashcardSet } from '@/types/vocab';
import { flashcardService } from '@/services/api/flashcard-service';
import { MOCK_FLASHCARD_SETS } from '@/utils/mock-flashcard-data';

type FilterType = 'all' | 'role-play' | 'journal' | 'topic' | 'chat' | 'theme';

export default function VocabPage() {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [collections] = useState<VocabCollection[]>(MOCK_VOCAB_COLLECTIONS);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(true);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load flashcard sets on component mount
  useEffect(() => {
    async function loadFlashcardSets() {
      console.log('useEffect triggered. User data:', user);
      if (!user?.id) {
        console.log('No user ID available, skipping API call');
        return;
      }
      
      console.log('Starting API call with user ID:', user.id);
      setIsLoadingFlashcards(true);
      setFlashcardError(null);
      
      try {
        // Use real API call instead of mock data
        console.log('Making API call to flashcardService.getFlashcardSets with user ID:', user.id);
        const sets = await flashcardService.getFlashcardSets(user.id);
        // const sets = MOCK_FLASHCARD_SETS; // Uncomment for development
        console.log('API call successful, received sets:', sets);
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
  
  // Filter collections based on type and search term
  const filteredCollections = useMemo(() => {
    return collections.filter(collection => {
      const matchesFilter = activeFilter === 'all' || collection.type === activeFilter;
      const matchesSearch = searchTerm === '' || 
        collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [collections, activeFilter, searchTerm]);
  
  const handleAddWord = (collectionId: string) => {
    // Placeholder function for adding a word to a collection
    console.log(`Add word to collection ${collectionId}`);
    // In a real implementation, this would open a modal or navigate to a form
  };
  
  const handleCreateCollection = () => {
    // Placeholder function for creating a new collection
    console.log('Create new collection');
    // In a real implementation, this would open a modal or navigate to a form
  };
  
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
        
        {/* Search box */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-2.5 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500" 
              placeholder="Search collections..." 
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
        </div>
        
        {/* Filter tabs - mobile optimized with scrolling and larger touch targets */}
        <div 
          className="flex overflow-x-auto space-x-2 mb-6 pb-1 no-scrollbar"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
            paddingBottom: '0.5rem'
          }}
        >
          {(['all', 'role-play', 'journal', 'topic', 'chat', 'theme'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              style={{
                minHeight: isMobile ? '44px' : '38px', // Larger touch target on mobile
                minWidth: isMobile ? '100px' : 'auto',  // Ensure minimum width for touch
                flexShrink: 0                           // Prevent shrinking in the flex container
              }}
            >
              {filter === 'all' ? 'All Collections' : filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        
        {/* Flashcard Sets Section */}
        <div className="mb-8">
          <FlashcardSetList
            flashcardSets={flashcardSets}
            isLoading={isLoadingFlashcards}
            error={flashcardError}
          />
        </div>
        
        {/* Vocabulary Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {collections.length === 0 ? (
            <EmptyState onCreateCollection={handleCreateCollection} />
          ) : filteredCollections.length > 0 ? (
            filteredCollections.map((collection) => (
              <VocabCard
                key={collection.id}
                collection={collection}
                onAddClick={() => handleAddWord(collection.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No collections found matching your criteria.
            </div>
          )}
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
        
        {/* Floating Action Button for Creating New Collection */}
        <button 
          onClick={handleCreateCollection}
          className="fixed w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all mobile-btn tap-highlight-none safe-bottom"
          style={{
            right: '1.5rem',
            bottom: isMobile ? '5rem' : '1.5rem', // Positioned above the mobile navigation
            zIndex: zIndex.tooltip, // Use appropriate z-index from our system
          }}
          aria-label="Create new vocabulary collection"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "28" : "24"} height={isMobile ? "28" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
