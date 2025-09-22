export type VocabLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: VocabLevel;
  createdAt: Date;
  userId: string;
}

/**
 * Represents a collection of vocabulary words grouped by a topic or theme
 */
export interface VocabCollection {
  id: string;
  title: string;
  description: string;
  type: 'role-play' | 'journal' | 'topic' | 'chat' | 'theme';
  wordsCount: number;
  masteredCount: number;
  userId: string;
  createdAt: Date;
}

/**
 * Represents a flashcard set as returned by the Supabase function
 */
export interface FlashcardSet {
  set_id: string;
  set_title: string;
  total_flashcards: number;
  flashcards_due: number;
}

/**
 * Statistics for a vocabulary collection
 */
export interface VocabStats {
  total: number;
  mastered: number;
}

/**
 * Categorized vocabulary data for display on the vocab hub page
 */
export interface VocabHubData {
  collections: VocabCollection[];
  flashcardSets?: FlashcardSet[];
}