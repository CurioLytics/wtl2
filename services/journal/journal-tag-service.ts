import { createSupabaseClient } from '@/services/supabase/auth-helpers';

/**
 * Journal Tag Service - Tag management operations
 * Handles all tag-related operations for journals
 */
class JournalTagService {
    /**
     * Get tags for a specific journal entry
     */
    async getJournalEntryTags(journalId: string): Promise<string[]> {
        try {
            console.log('getJournalEntryTags - Fetching tags for journal:', journalId);

            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .from('journal_tag')
                .select('tag_id')
                .eq('journal_id', journalId);

            if (error) {
                console.error('Error fetching journal tags:', error);
                throw error;
            }

            return data?.map((tag: any) => tag.tag_id) || [];
        } catch (error) {
            console.error('Error in getJournalEntryTags:', error);
            throw error;
        }
    }

    /**
     * Save tags for a journal entry
     * Ensures tags exist in journal_tags table before creating associations
     */
    async saveJournalTags(journalId: string, tags: string[]): Promise<{ success: boolean }> {
        try {
            console.log('saveJournalTags - Saving tags for journal:', journalId, tags);

            const supabase = createSupabaseClient();

            // First, delete existing tag associations for this journal
            await supabase
                .from('journal_tag')
                .delete()
                .eq('journal_id', journalId);

            // Then insert new tags (if any)
            if (tags.length > 0) {
                // Step 1: Ensure all tags exist in journal_tags table
                const tagRecords = tags.map(tag => ({ name: tag }));
                const { error: tagError } = await supabase
                    .from('journal_tags')
                    .upsert(tagRecords, {
                        onConflict: 'name',
                        ignoreDuplicates: true
                    });

                if (tagError) {
                    console.error('Error ensuring tags exist in journal_tags:', tagError);
                    throw tagError;
                }

                // Step 2: Create associations in journal_tag junction table
                const tagInserts = tags.map(tag => ({
                    journal_id: journalId,
                    tag_id: tag
                }));

                const { error: insertError } = await supabase
                    .from('journal_tag')
                    .insert(tagInserts);

                if (insertError) {
                    console.error('Error inserting journal tag associations:', insertError);
                    throw insertError;
                }
            }

            console.log('saveJournalTags - Successfully saved tags');
            return { success: true };
        } catch (error) {
            console.error('Error in saveJournalTags:', error);
            throw error;
        }
    }
}

export const journalTagService = new JournalTagService();
