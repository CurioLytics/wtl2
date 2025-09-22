import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { FlashcardSet } from '@/types/vocab';

/**
 * Service for fetching and managing flashcard sets
 */
class FlashcardService {
  /**
   * Get all flashcard sets for a user
   * 
   * @param userId The user ID to fetch flashcard sets for
   * @returns Promise with array of flashcard sets
   */
  async getFlashcardSets(userId: string): Promise<FlashcardSet[]> {
    try {
      console.log('getFlashcardSets - userId being passed:', userId);
      
      const supabase = createSupabaseClient();
      
      // Call the get_flashcard_sets Supabase function
      const { data, error } = await supabase
        .rpc('get_flashcard_sets', { profile: userId });
      
      console.log('getFlashcardSets - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching flashcard sets:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned from get_flashcard_sets:', data);
        return [];
      }
      
      console.log('getFlashcardSets - Processed data to return:', data?.length, 'sets');
      
      return data.map(set => ({
        set_id: set.set_id,
        set_title: set.set_title,
        total_flashcards: set.total_flashcards,
        flashcards_due: set.flashcards_due
      }));
    } catch (error) {
      console.error('Error in getFlashcardSets:', error);
      throw error;
    }
  }
}

export const flashcardService = new FlashcardService();