import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { VocabCollection } from '@/types/vocab';

/**
 * Service for fetching and managing vocabulary collections
 */
class VocabService {
  /**
   * Get all vocabulary collections for a user
   * 
   * @param userId The user ID to fetch vocabulary collections for
   * @returns Promise with array of vocabulary collections
   */
  async getVocabCollections(userId: string): Promise<VocabCollection[]> {
    try {
      const supabase = createSupabaseClient();
      
      // Call the get_vocab_collections Supabase function
      const { data, error } = await supabase
        .from('vocab_collections')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching vocabulary collections:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned for vocabulary collections');
        return [];
      }
      
      return data.map(collection => ({
        id: collection.id,
        title: collection.title,
        description: collection.description,
        type: collection.type,
        wordsCount: collection.words_count || 0,
        masteredCount: collection.mastered_count || 0,
        userId: collection.user_id,
        createdAt: new Date(collection.created_at)
      }));
    } catch (error) {
      console.error('Error in getVocabCollections:', error);
      throw error;
    }
  }
}

export const vocabService = new VocabService();