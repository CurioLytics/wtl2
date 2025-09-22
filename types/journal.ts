export type JournalTemplateCategory = 'Journaling' | 'Productivity' | 'Wellness' | 'Decision Making' | 'Problem Solving' | 'Business';

/**
 * Interface for the journal_template table according to SRS.md
 * - id: Unique identifier for each journal template
 * - name: Title or name of the journal template
 * - other: Additional metadata or unused field
 * - content: The actual prompt or body of the journal entry
 * - category: Category of the journal template (matches JournalTemplateCategory)
 * - tag: Array of tags for additional categorization and filtering
 */
export interface JournalTemplate {
  id: string;
  name: string;
  other?: string;
  content: string;
  category?: JournalTemplateCategory;
  tag: string[];
}

/**
 * Interface for journal feedback response from the feedback API
 */
export interface JournalFeedbackContent {
  title: string;
  summary: string;
  improvedVersion: string;
  originalVersion: string; // Original journal content before improvement
  vocabSuggestions: Array<{
    word: string;
    meaning?: string;
    example?: string;
  }>;
  highlights?: string[]; // Array of text highlights from journal content
}

/**
 * Interface for the raw webhook response structure
 */
export interface WebhookResponseItem {
  output: JournalFeedbackContent;
}

/**
 * Complete webhook response (array of items)
 */
export type WebhookResponse = WebhookResponseItem[];

/**
 * Interface for journal feedback used throughout the application
 * This maintains backward compatibility with existing code
 */
export interface JournalFeedback extends JournalFeedbackContent {
  // Extends the content structure to maintain backward compatibility
}

// Keep legacy interface for transition period
export interface LegacyJournalTemplate {
  id: string;
  name: string;
  description: string;
  category: JournalTemplateCategory;
  icon: string;
  templateType: 'daily_reflection' | 'prompt_based' | 'goal_oriented' | 'gratitude' | 'mindfulness' | 'habit_tracker' | 'pros_cons' | 'decision_journal' | 'problem_solving';
}

export const TEMPLATE_CATEGORIES: JournalTemplateCategory[] = [
  'Journaling',
  'Productivity',
  'Wellness',
  'Decision Making',
  'Problem Solving',
  'Business'
];

/**
 * Interface for a journal entry
 */
export interface Journal {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

/**
 * Interface for journal statistics
 */
export interface JournalStats {
  total_journals: number;
  current_streak: number;
}