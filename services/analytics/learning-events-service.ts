import { supabase } from '@/services/supabase/client';
import { Database } from '@/types/database.types';

type LearningEventType = Database['public']['Tables']['learning_events']['Row']['event_type'];

/**
 * Service for querying user learning events for progress analytics
 * Note: Events are automatically created by database triggers, this service only reads them
 */
export class LearningEventsService {

  /**
   * Get events for a user within a date range
   */
  async getEvents(
    profileId: string,
    options?: {
      eventType?: LearningEventType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<Database['public']['Tables']['learning_events']['Row'][]> {
    try {
      let query = (supabase as any)
        .from('learning_events')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (options?.eventType) {
        query = query.eq('event_type', options.eventType);
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  }

  /**
   * Get event counts grouped by date
   */
  async getEventCounts(
    profileId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, Record<LearningEventType, number>>> {
    try {
      const events = await this.getEvents(profileId, { startDate, endDate });

      // Group by date and event type
      const counts: Record<string, Record<string, number>> = {};

      events.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!counts[date]) {
          counts[date] = {};
        }
        counts[date][event.event_type] = (counts[date][event.event_type] || 0) + 1;
      });

      return counts as Record<string, Record<LearningEventType, number>>;
    } catch (error) {
      console.error('Error in getEventCounts:', error);
      return {};
    }
  }
}

// Export singleton instance
export const learningEventsService = new LearningEventsService();
