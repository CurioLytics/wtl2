import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { Journal, JournalStats } from '@/types/journal';

/**
 * Journal Query Service - Read operations
 * Handles all data fetching operations for journals
 */
class JournalQueryService {
    /**
     * Get all available journal tags
     */
    async getJournalTags(): Promise<string[]> {
        try {
            console.log('getJournalTags - Fetching all journal tags');

            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .from('journal_tags')
                .select('name')
                .order('name');

            console.log('getJournalTags - Response from Supabase:', { data, error });

            if (error) {
                console.error('Error fetching journal tags:', error);
                throw error;
            }

            if (!data || !Array.isArray(data)) {
                console.warn('Invalid data structure returned from journal_tags:', data);
                return [];
            }

            return data.map((tag: any) => tag.name);
        } catch (error) {
            console.error('Error in getJournalTags:', error);
            throw error;
        }
    }

    /**
     * Get a single journal entry by ID
     */
    async getJournalById(journalId: string): Promise<Journal> {
        try {
            console.log('getJournalById - Fetching journal:', journalId);

            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .from('journals')
                .select('id, title, content, journal_date, summary')
                .eq('id', journalId)
                .single();

            console.log('getJournalById - Response from Supabase:', { data, error });

            if (error) {
                console.error('Error fetching journal by ID:', error);
                throw error;
            }

            if (!data) {
                throw new Error('Journal not found');
            }

            return {
                id: String(data.id),
                title: data.title,
                content: data.content,
                journal_date: data.journal_date ?? new Date().toISOString(),
                summary: data.summary
            };
        } catch (error) {
            console.error('Error in getJournalById:', error);
            throw error;
        }
    }

    /**
     * Get journals filtered by tag
     */
    async getJournalsByTag(userId: string, tagName: string): Promise<Journal[]> {
        try {
            console.log('getJournalsByTag - Fetching journals for user:', userId, 'with tag:', tagName);

            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .from('journals')
                .select(`
          id,
          title,
          content,
          journal_date,
          created_at,
          journal_tag!inner(tag_id)
        `)
                .eq('user_id', userId)
                .eq('journal_tag.tag_id', tagName)
                .order('journal_date', { ascending: false })
                .order('created_at', { ascending: false });

            console.log('getJournalsByTag - Response from Supabase:', { data, error });

            if (error) {
                console.error('Error fetching journals by tag:', error);
                throw error;
            }

            if (!data || !Array.isArray(data)) {
                console.warn('Invalid data structure returned from journals:', data);
                return [];
            }

            return data.map((journal: any) => ({
                id: String(journal.id),
                title: journal.title,
                content: journal.content,
                journal_date: journal.journal_date ?? new Date().toISOString(),
                created_at: journal.created_at
            }));
        } catch (error) {
            console.error('Error in getJournalsByTag:', error);
            throw error;
        }
    }

    /**
     * Get all journal entries for a user
     */
    async getJournals(userId: string, includeDrafts: boolean = false): Promise<Journal[]> {
        try {
            console.log('getJournals - userId being passed:', userId);

            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .rpc("get_journals", { _user_id: userId });

            console.log('getJournals - Response from Supabase:', { data, error });

            if (error) {
                console.error('Error fetching journals:', error);
                throw error;
            }

            if (!data || !Array.isArray(data)) {
                console.warn('Invalid data structure returned from get_journals:', data);
                return [];
            }

            console.log('getJournals - Processed data to return:', data?.length, 'entries');

            let mappedData = data.map((journal: any) => ({
                id: String(journal.id),
                title: journal.title,
                content: journal.content,
                journal_date: journal.journal_date ?? journal.created_at ?? new Date().toISOString(),
                created_at: journal.created_at,
                is_draft: journal.is_draft ?? false,
            }));

            if (!includeDrafts) {
                mappedData = mappedData.filter((journal: any) => !journal.is_draft);
            }

            return mappedData.sort((a, b) => {
                const dateCompare = new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime();
                if (dateCompare !== 0) return dateCompare;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        } catch (error) {
            console.error('Error in getJournals:', error);
            throw error;
        }
    }

    /**
     * Get journal statistics for a user
     */
    async getJournalStats(userId: string): Promise<JournalStats> {
        try {
            console.log('getJournalStats - userId being passed:', userId);

            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .rpc('get_journal_stats', { user_uuid: userId });

            console.log('getJournalStats - Response from Supabase:', { data, error });

            if (error) {
                console.error('Error fetching journal stats:', error);
                throw error;
            }

            if (!data) {
                console.warn('Invalid data structure returned from get_journal_stats:', data);
                return {
                    total_journals: 0,
                    current_streak: 0
                };
            }

            const statsData = Array.isArray(data) ? data[0] : data;

            console.log('getJournalStats - Stats data after handling array:', statsData);

            const processedData = {
                total_journals: statsData.total_entries || 0,
                current_streak: statsData.current_streak || 0
            };

            console.log('getJournalStats - Final processed data:', processedData);

            return processedData;
        } catch (error) {
            console.error('Error in getJournalStats:', error);
            throw error;
        }
    }
}

export const journalQueryService = new JournalQueryService();
