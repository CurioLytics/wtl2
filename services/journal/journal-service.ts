/**
 * Main Journal Service
 * 
 * This service maintains backward compatibility by re-exporting all methods
 * from the specialized service modules. Existing code can continue to use
 * journalService.methodName() without any changes.
 * 
 * The service is now organized into three focused modules:
 * - journal-query-service: Read operations (get journals, stats, tags)
 * - journal-mutation-service: Write operations (create, update, delete)
 * - journal-tag-service: Tag management operations
 */

import { journalQueryService } from './journal-query-service';
import { journalMutationService } from './journal-mutation-service';
import { journalTagService } from './journal-tag-service';
import { Journal, JournalStats } from '@/types/journal';

class JournalService {
  // ============================================
  // Query Operations (Read)
  // ============================================

  /**
   * Get all available journal tags
   */
  async getJournalTags(): Promise<string[]> {
    return journalQueryService.getJournalTags();
  }

  /**
   * Get a single journal entry by ID
   */
  async getJournalById(journalId: string): Promise<Journal> {
    return journalQueryService.getJournalById(journalId);
  }

  /**
   * Get journals filtered by tag
   */
  async getJournalsByTag(userId: string, tagName: string): Promise<Journal[]> {
    return journalQueryService.getJournalsByTag(userId, tagName);
  }

  /**
   * Get all journal entries for a user
   */
  async getJournals(userId: string, includeDrafts: boolean = false): Promise<Journal[]> {
    return journalQueryService.getJournals(userId, includeDrafts);
  }

  /**
   * Get journal statistics for a user
   */
  async getJournalStats(userId: string): Promise<JournalStats> {
    return journalQueryService.getJournalStats(userId);
  }

  // ============================================
  // Mutation Operations (Write)
  // ============================================

  /**
   * Creates a new journal entry
   */
  async createJournal(userId: string, data: {
    title: string | null;
    content: string;
    journal_date?: string | null;
    enhanced_version?: string | null;
    summary?: string | null;
    is_draft?: boolean;
  }): Promise<{ id: string }> {
    return journalMutationService.createJournal(userId, data);
  }

  /**
   * Creates a draft journal entry
   */
  async createDraftJournal(userId: string, data: {
    title: string | null;
    content: string;
    journal_date?: string | null;
    summary?: string | null;
  }): Promise<{ id: string }> {
    return journalMutationService.createDraftJournal(userId, data);
  }

  /**
   * Converts a draft journal to a final published journal
   */
  async publishDraft(journalId: string, data?: {
    title?: string | null;
    content?: string;
    enhanced_version?: string | null;
    summary?: string | null;
  }): Promise<{ success: boolean }> {
    return journalMutationService.publishDraft(journalId, data);
  }

  /**
   * Updates a journal entry
   */
  async updateJournal(journalId: string, data: {
    title?: string | null;
    content?: string;
    journal_date?: string | null;
    enhanced_version?: string | null;
    summary?: string | null;
    is_draft?: boolean;
  }): Promise<{ success: boolean }> {
    return journalMutationService.updateJournal(journalId, data);
  }

  /**
   * Creates a journal entry from feedback data
   */
  async createJournalFromFeedback(userId: string, data: {
    title: string;
    originalContent: string;
    enhancedContent: string;
    journalDate: string;
    summary?: string;
    highlights?: string[];
  }): Promise<{ id: string }> {
    return journalMutationService.createJournalFromFeedback(userId, data);
  }

  /**
   * Deletes a journal entry
   */
  async deleteJournal(journalId: string): Promise<{ success: boolean }> {
    return journalMutationService.deleteJournal(journalId);
  }

  // ============================================
  // Tag Operations
  // ============================================

  /**
   * Get tags for a specific journal entry
   */
  async getJournalEntryTags(journalId: string): Promise<string[]> {
    return journalTagService.getJournalEntryTags(journalId);
  }

  /**
   * Save tags for a journal entry
   */
  async saveJournalTags(journalId: string, tags: string[]): Promise<{ success: boolean }> {
    return journalTagService.saveJournalTags(journalId, tags);
  }
}

export const journalService = new JournalService();