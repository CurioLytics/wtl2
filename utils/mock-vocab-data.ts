import { VocabCollection } from '@/types/vocab';

/**
 * Mock data for vocabulary collections
 */
export const MOCK_VOCAB_COLLECTIONS: VocabCollection[] = [
  {
    id: '1',
    title: 'Ordering Coffee',
    description: 'From role-play feedback',
    type: 'role-play',
    wordsCount: 49,
    masteredCount: 32,
    userId: 'user-1',
    createdAt: new Date('2025-08-15')
  },
  {
    id: '2',
    title: 'Daily Routines',
    description: 'Journal entries',
    type: 'journal',
    wordsCount: 20,
    masteredCount: 9,
    userId: 'user-1',
    createdAt: new Date('2025-08-25')
  },
  {
    id: '3',
    title: 'Travel & Direction',
    description: 'Chat corrections',
    type: 'chat',
    wordsCount: 27,
    masteredCount: 11,
    userId: 'user-1',
    createdAt: new Date('2025-09-02')
  },
  {
    id: '4',
    title: 'Minimalist Home',
    description: 'Topic set',
    type: 'topic',
    wordsCount: 10,
    masteredCount: 6,
    userId: 'user-1',
    createdAt: new Date('2025-09-05')
  },
  {
    id: '5',
    title: 'Mindful Travel',
    description: 'Theme set',
    type: 'theme',
    wordsCount: 33,
    masteredCount: 14,
    userId: 'user-1',
    createdAt: new Date('2025-09-10')
  },
  {
    id: '6',
    title: 'Sustainable Living',
    description: 'Topic set',
    type: 'topic',
    wordsCount: 25,
    masteredCount: 8,
    userId: 'user-1',
    createdAt: new Date('2025-09-15')
  }
];