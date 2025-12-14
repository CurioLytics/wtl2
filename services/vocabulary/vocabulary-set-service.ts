import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { analyticsService } from '@/services/analytics/analytics-service';

export interface CreateVocabularySetRequest {
  title: string;
  description?: string;
  is_default?: boolean;
  vocabularyWords?: Array<{
    word: string;
    meaning: string;
    example?: string;
  }>;
}

export interface VocabularySetResponse {
  id: string;
  title: string;
  description?: string;
  profile_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  vocabulary_count: number;
  is_starred?: boolean;
}

/**
 * Service for handling vocabulary set operations
 */
export class VocabularySetService {
  private supabase = createSupabaseClient();

  /**
   * Create a new vocabulary set with optional vocabulary words
   */
  async createVocabularySet(
    userId: string,
    request: CreateVocabularySetRequest
  ): Promise<VocabularySetResponse> {
    const { title, description, is_default = false, vocabularyWords = [] } = request;

    if (!title?.trim()) {
      throw new Error('Title is required');
    }

    // Create vocabulary set
    const { data: setData, error: setError } = await this.supabase
      .from('vocabulary_set')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        profile_id: userId,
        is_default
      })
      .select()
      .single();

    if (setError) {
      console.error('Error creating vocabulary set:', setError);
      throw new Error(`Failed to create vocabulary set: ${setError.message}`);
    }

    // Add vocabulary words if provided
    let vocabularyCount = 0;
    if (vocabularyWords.length > 0) {
      vocabularyCount = await this.addVocabularyWords(setData.id, vocabularyWords);
    }

    return {
      id: setData.id,
      title: setData.title,
      description: setData.description,
      profile_id: setData.profile_id,
      is_default: setData.is_default,
      created_at: setData.created_at,
      updated_at: setData.updated_at,
      vocabulary_count: vocabularyCount
    };
  }

  /**
   * Add vocabulary words to a set
   */
  async addVocabularyWords(
    setId: string,
    vocabularyWords: Array<{ word: string; meaning: string; example?: string; }>
  ): Promise<number> {
    const validWords = vocabularyWords.filter(word =>
      word.word?.trim() && word.meaning?.trim()
    );

    if (validWords.length === 0) {
      return 0;
    }

    const wordsToInsert = validWords.map(word => ({
      set_id: setId,
      word: word.word.trim(),
      meaning: word.meaning.trim(),
      example: word.example?.trim() || null
    }));

    const { error: wordsError } = await this.supabase
      .from('vocabulary')
      .insert(wordsToInsert);

    if (wordsError) {
      console.error('Error adding vocabulary words:', wordsError);
      throw new Error(`Failed to add vocabulary words: ${wordsError.message}`);
    }

    // Get profile_id for the set to track events
    const { data: setInfo } = await this.supabase
      .from('vocabulary_set')
      .select('profile_id')
      .eq('id', setId)
      .single();

    if (setInfo?.profile_id) {
      // Track learning events for each word
      // We run this in parallel and don't block the return
      Promise.all(validWords.map(word =>
        analyticsService.trackLearningEvent(setInfo.profile_id, 'vocab_created', {
          set_id: setId,
          word: word.word
        })
      )).catch(err => console.error('Error tracking vocab events:', err));
    }

    return validWords.length;
  }

  /**
   * Get vocabulary set details with word count
   */
  async getVocabularySet(setId: string, userId: string): Promise<VocabularySetResponse | null> {
    const { data: setData, error: setError } = await this.supabase
      .from('vocabulary_set')
      .select('*')
      .eq('id', setId)
      .eq('profile_id', userId)
      .single();

    if (setError) {
      if (setError.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get vocabulary set: ${setError.message}`);
    }

    // Get vocabulary count
    const { count } = await this.supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('set_id', setId);

    return {
      id: setData.id,
      title: setData.title,
      description: setData.description,
      profile_id: setData.profile_id,
      is_default: setData.is_default,
      created_at: setData.created_at,
      updated_at: setData.updated_at,
      vocabulary_count: count || 0,
      is_starred: setData.is_starred
    };
  }

  /**
   * Toggle star status for a vocabulary set
   */
  async toggleVocabularySetStar(setId: string, userId: string): Promise<boolean> {
    // First get current star status
    const { data: currentData, error: fetchError } = await this.supabase
      .from('vocabulary_set')
      .select('is_starred')
      .eq('id', setId)
      .eq('profile_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to get vocabulary set: ${fetchError.message}`);
    }

    const newStarredStatus = !currentData.is_starred;

    // Update star status
    const { error: updateError } = await this.supabase
      .from('vocabulary_set')
      .update({ is_starred: newStarredStatus })
      .eq('id', setId)
      .eq('profile_id', userId);

    if (updateError) {
      throw new Error(`Failed to update star status: ${updateError.message}`);
    }

    return newStarredStatus;
  }

  /**
   * Get all starred vocabulary sets for a user
   */
  async getStarredVocabularySets(userId: string): Promise<VocabularySetResponse[]> {
    const { data: setsData, error: setsError } = await this.supabase
      .from('vocabulary_set')
      .select('*')
      .eq('profile_id', userId)
      .eq('is_starred', true)
      .order('updated_at', { ascending: false });

    if (setsError) {
      throw new Error(`Failed to get starred vocabulary sets: ${setsError.message}`);
    }

    // Get vocabulary counts for each set
    const setsWithCounts = await Promise.all(
      setsData.map(async (set) => {
        const { count } = await this.supabase
          .from('vocabulary')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', set.id);

        return {
          id: set.id,
          title: set.title,
          description: set.description,
          profile_id: set.profile_id,
          is_default: set.is_default,
          created_at: set.created_at,
          updated_at: set.updated_at,
          vocabulary_count: count || 0,
          is_starred: set.is_starred
        };
      })
    );

    return setsWithCounts;
  }
}

export const vocabularySetService = new VocabularySetService();