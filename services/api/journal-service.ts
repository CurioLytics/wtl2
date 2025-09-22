import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { Journal, JournalStats } from '@/types/journal';

/**
 * Service for fetching and managing journal entries
 * 
 * NOTE: There is an inconsistency in the Supabase function parameter naming:
 * - get_journals expects a parameter named "_user_id"
 * - get_journal_stats expects a parameter named "user_uuid"
 * This is handled in each method accordingly.
 */
class JournalService {
  /**
   * Get all journal entries for a user
   * 
   * @param userId The user ID to fetch journals for
   * @returns Promise with array of journal entries
   */
  async getJournals(userId: string): Promise<Journal[]> {
    try {
      console.log('getJournals - userId being passed:', userId);
      
      const supabase = createSupabaseClient();
      
      // Call the get_journals Supabase function
      // Correct parameter name is _user_id
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
      
      return data.map(journal => ({
        id: journal.id,
        title: journal.title,
        content: journal.content,
        created_at: journal.created_at
      }));
    } catch (error) {
      console.error('Error in getJournals:', error);
      throw error;
    }
  }

  /**
   * Get journal statistics for a user
   * 
   * @param userId The user ID to fetch journal stats for
   * @returns Promise with journal statistics
   */
  async getJournalStats(userId: string): Promise<JournalStats> {
    try {
      console.log('getJournalStats - userId being passed:', userId);
      
      const supabase = createSupabaseClient();
      
      // Call the get_journal_stats Supabase function
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
      
      // Handle the response as an array with one object
      const statsData = Array.isArray(data) ? data[0] : data;
      
      console.log('getJournalStats - Stats data after handling array:', statsData);
      
      // Map the response field names to our expected field names
      const processedData = {
        total_journals: statsData.total_entries || 0,  // Use total_entries from response
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

export const journalService = new JournalService();