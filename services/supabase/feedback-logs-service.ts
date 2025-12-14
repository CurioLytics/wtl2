import { supabase } from '@/services/supabase/client';
import { GrammarDetail } from '@/types/journal-feedback';

export class FeedbackLogsService {
  async getById(feedbackId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('id, profile_id, source_id, source_type, clarity_feedback, vocabulary_feedback, ideas_feedback, enhanced_version, fixed_typo, created_at')
      .eq('id', feedbackId)
      .single();

    if (error) {
      console.error('Error fetching feedback by ID:', error);
      return null;
    }

    const row: any = data as any;

    // Fetch grammar items
    const { data: grammarItems } = await supabase
      .from('feedback_grammar_items')
      .select('grammar_topic_id, description, tags')
      .eq('feedback_id', feedbackId);

    // Build minimal feedback object from normalized columns
    return {
      output: {
        clarity: row?.clarity_feedback || '',
        vocabulary: row?.vocabulary_feedback || '',
        ideas: row?.ideas_feedback || '',
      },
      enhanced_version: row?.enhanced_version || '',
      fixed_typo: row?.fixed_typo || '',
      grammar_details: grammarItems || [],
    };
  }

  async getLatestBySource(sourceId: string, sourceType: 'journal' | 'roleplay'): Promise<{ feedback: any | null, feedbackId: string | null }> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('id')
      .eq('source_id', sourceId)
      .eq('source_type', sourceType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest feedback for source:', error);
      return { feedback: null, feedbackId: null };
    }

    if (!data) return { feedback: null, feedbackId: null };

    const id = (data as any).id as string;
    const feedback = await this.getById(id);
    return { feedback, feedbackId: id };
  }
  /**
   * Save feedback to feedbacks table and grammar details to feedback_grammar_items table
   * @param userId - User ID
   * @param sourceId - Journal ID or Session ID
   * @param sourceType - 'journal' or 'roleplay'
   * @param feedbackData - Feedback content (clarity, vocabulary, ideas, enhanced_version)
   * @param grammarDetails - Array of grammar corrections
   */
  async saveFeedback({
    userId,
    sourceId,
    sourceType,
    feedbackData,
    grammarDetails,
    fullResponse,
    replaceExisting = true,
  }: {
    userId: string;
    sourceId: string;
    sourceType: 'journal' | 'roleplay';
    feedbackData: {
      clarity?: string;
      vocabulary?: string;
      ideas?: string;
      enhanced_version?: string;
      fixed_typo?: string;
    };
    grammarDetails?: GrammarDetail[];
    fullResponse?: unknown;
    replaceExisting?: boolean;
  }): Promise<string> {
    let existingFeedbackIds: string[] = [];

    if (replaceExisting) {
      const { data: existing } = await supabase
        .from('feedbacks')
        .select('id')
        .eq('source_id', sourceId)
        .eq('source_type', sourceType);

      if (existing && (existing as any[]).length > 0) {
        existingFeedbackIds = (existing as any[]).map((item: any) => item.id);

        // Remove existing grammar items first (to avoid FK conflicts)
        await supabase
          .from('feedback_grammar_items')
          .delete()
          .in('feedback_id', existingFeedbackIds);

        // Remove existing feedback records
        await supabase
          .from('feedbacks')
          .delete()
          .in('id', existingFeedbackIds);
      }
    }

    // Step 1: Insert into feedbacks table
    const { data: feedbackRecord, error: feedbackError } = await (supabase as any)
      .from('feedbacks')
      .insert({
        profile_id: userId,
        source_id: sourceId,
        source_type: sourceType,
        clarity_feedback: feedbackData.clarity || null,
        vocabulary_feedback: feedbackData.vocabulary || null,
        ideas_feedback: feedbackData.ideas || null,
        enhanced_version: feedbackData.enhanced_version || null,
      } as any)
      .select('id')
      .single();

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      throw new Error(`Failed to save feedback: ${feedbackError.message}`);
    }

    const feedbackId = (feedbackRecord as any).id as string;

    // Step 2: Insert grammar details into feedback_grammar_items table
    if (grammarDetails && grammarDetails.length > 0) {
      // Validate grammar_topic_ids exist in grammar_topics table
      const topicIds = grammarDetails
        .map(d => d.grammar_topic_id)
        .filter(id => id != null);

      let validTopicIds = new Set<string>();

      if (topicIds.length > 0) {
        const { data: existingTopics } = await supabase
          .from('grammar_topics')
          .select('topic_id')
          .in('topic_id', topicIds);

        validTopicIds = new Set((existingTopics as any[] | undefined)?.map((t: any) => t.topic_id) || []);
      }

      // Insert only items with valid topic IDs or null
      const grammarItems = grammarDetails.map(detail => ({
        feedback_id: feedbackId,
        grammar_topic_id: detail.grammar_topic_id && validTopicIds.has(detail.grammar_topic_id)
          ? detail.grammar_topic_id
          : null,
        description: detail.description,
        tags: detail.tags || [],
      }));

      const { error: grammarError } = await (supabase as any)
        .from('feedback_grammar_items')
        .insert(grammarItems as any);

      if (grammarError) {
        console.error('Error saving grammar items:', grammarError);
        // Don't throw - feedback is already saved
      }
    }

    return feedbackId;
  }


}

export const feedbackLogsService = new FeedbackLogsService();