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

      // Call the vocabulary_set table as replacement for vocab_collections
      const { data, error } = await supabase
        .from('vocabulary_set')
        .select('*')
        .eq('profile_id', userId);

      if (error) {
        console.error('Error fetching vocabulary collections:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned for vocabulary collections');
        return [];
      }

      return (data as any[]).map(collection => ({
        id: collection.id,
        title: collection.title,
        description: collection.description || '',
        type: 'theme', // Default type as vocabulary_set doesn't have type
        wordsCount: 0, // Default as vocabulary_set doesn't have count
        masteredCount: 0, // Default as vocabulary_set doesn't have count
        userId: collection.profile_id,
        createdAt: new Date(collection.created_at || Date.now())
      }));
    } catch (error) {
      console.error('Error in getVocabCollections:', error);
      throw error;
    }
  }
}

export const vocabService = new VocabService();