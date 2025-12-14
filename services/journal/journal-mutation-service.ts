import { createSupabaseClient } from '@/services/supabase/auth-helpers';

/**
 * Journal Mutation Service - Write operations
 * Handles all data modification operations for journals
 */
class JournalMutationService {
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
        try {
            console.log('createJournal - Creating new journal entry for user:', userId);

            const supabase = createSupabaseClient();

            const { data: result, error } = await supabase
                .from('journals')
                .insert({
                    user_id: userId,
                    title: data.title,
                    content: data.content,
                    enhanced_version: data.enhanced_version || null,
                    summary: data.summary || null,
                    journal_date: data.journal_date || new Date().toISOString(),
                    is_draft: data.is_draft ?? false,
                })
                .select('id')
                .single();

            if (error) {
                console.error('Error creating journal entry:', error);
                throw error;
            }

            console.log('createJournal - Successfully created journal entry:', result);

            // Track learning event for streak calculation
            if (!data.is_draft) {
                fetch('/api/analytics/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventType: 'journal_created',
                        metadata: {
                            journal_id: result.id,
                            title: data.title
                        }
                    })
                }).catch(err => console.error('Error tracking journal event:', err));
            }

            return { id: result.id };
        } catch (error) {
            console.error('Error in createJournal:', error);
            throw error;
        }
    }

    /**
     * Creates a draft journal entry (for feedback review)
     */
    async createDraftJournal(userId: string, data: {
        title: string | null;
        content: string;
        journal_date?: string | null;
        summary?: string | null;
    }): Promise<{ id: string }> {
        return this.createJournal(userId, {
            ...data,
            is_draft: true,
        });
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
        try {
            console.log('publishDraft - Publishing draft journal:', journalId);

            const supabase = createSupabaseClient();

            const updateData: any = {
                is_draft: false,
                ...data,
            };

            const { error } = await supabase
                .from('journals')
                .update(updateData)
                .eq('id', journalId);

            if (error) {
                console.error('Error publishing draft journal:', error);
                throw error;
            }

            console.log('publishDraft - Successfully published draft journal');

            // Track learning event when draft is published
            const { data: journal } = await supabase
                .from('journals')
                .select('user_id, title')
                .eq('id', journalId)
                .single();

            if (journal) {
                fetch('/api/analytics/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventType: 'journal_created',
                        metadata: {
                            journal_id: journalId,
                            title: journal.title
                        }
                    })
                }).catch(err => console.error('Error tracking journal event:', err));
            }

            return { success: true };
        } catch (error) {
            console.error('Error in publishDraft:', error);
            throw error;
        }
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
        try {
            console.log('updateJournal - Updating journal entry:', journalId);

            const supabase = createSupabaseClient();

            const { error } = await supabase
                .from('journals')
                .update(data)
                .eq('id', journalId);

            if (error) {
                console.error('Error updating journal entry:', error);
                throw error;
            }

            console.log('updateJournal - Successfully updated journal entry:', journalId);

            return { success: true };
        } catch (error) {
            console.error('Error in updateJournal:', error);
            throw error;
        }
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
        try {
            console.log('createJournalFromFeedback - Creating journal from feedback for user:', userId);

            const result = await this.createJournal(userId, {
                title: data.title,
                content: data.originalContent,
                enhanced_version: data.enhancedContent,
                journal_date: data.journalDate,
                summary: data.summary,
            });

            return result;
        } catch (error) {
            console.error('Error in createJournalFromFeedback:', error);
            throw error;
        }
    }

    /**
     * Deletes a journal entry
     */
    async deleteJournal(journalId: string): Promise<{ success: boolean }> {
        try {
            console.log('deleteJournal - Deleting journal entry:', journalId);

            const supabase = createSupabaseClient();

            const { error } = await supabase
                .from('journals')
                .delete()
                .eq('id', journalId);

            if (error) {
                console.error('Error deleting journal entry:', error);
                throw error;
            }

            console.log('deleteJournal - Successfully deleted journal entry:', journalId);

            return { success: true };
        } catch (error) {
            console.error('Error in deleteJournal:', error);
            throw error;
        }
    }
}

export const journalMutationService = new JournalMutationService();
