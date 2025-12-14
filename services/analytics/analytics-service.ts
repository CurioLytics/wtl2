
import { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  LearningEventType,
  GrammarFeedbackView,
  DailyGoalStatus,
  WeeklyActivityData,
  GrammarErrorSummary,
  StreakData,
  AnalyticsSummary
} from '@/types/analytics';

// Types moved to @/types/analytics.ts

/**
 * Service for Progress page analytics
 * Provides aggregated data from learning_events and grammar_feedback_view
 */
export class AnalyticsService {
  /**
   * Create a server-side Supabase client with proper auth context
   */
  private async getSupabaseClient() {
    const { createClient } = await import('@/services/supabase/server');
    return createClient();
  }

  /**
   * Get today's goal completion status
   * 
   * Algorithm:
   * 1. Calculate target date in user's timezone
   * 2. Parallel fetch: profile goals + today's events (filtered at DB)
   * 3. Client-side date filtering for timezone precision
   * 4. Single-pass event aggregation by type
   * 5. Construct response with goal progress
   * Complexity: O(m) where m = events on target date (typically small)
   */
  async getDailyGoalStatus(profileId: string, date?: Date, timezoneOffset?: number): Promise<DailyGoalStatus> {
    try {
      const supabase = await this.getSupabaseClient();
      const targetDate = date || new Date();

      // Calculate date string in user's local timezone
      let dateString: string;
      if (timezoneOffset !== undefined) {
        const localTime = new Date(targetDate.getTime() - (timezoneOffset * 60000));
        dateString = localTime.toISOString().split('T')[0];
      } else {
        dateString = targetDate.toISOString().split('T')[0];
      }

      // Calculate DB query range (full day + buffer for timezone differences)
      const dayStart = new Date(dateString + 'T00:00:00Z');
      const dayEnd = new Date(dateString + 'T23:59:59Z');
      const bufferStart = new Date(dayStart.getTime() - 43200000).toISOString(); // -12h buffer
      const bufferEnd = new Date(dayEnd.getTime() + 43200000).toISOString();     // +12h buffer

      // OPTIMIZATION: Parallel fetch + DB-level date filtering
      const [profileResult, eventsResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
          .eq('id', profileId)
          .single(),
        (supabase as any)
          .from('learning_events')
          .select('event_type, created_at')
          .eq('profile_id', profileId)
          .neq('event_type', 'session_active')
          .gte('created_at', bufferStart)
          .lte('created_at', bufferEnd)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const profile = profileResult.data;
      
      // Client-side precision filtering and aggregation (O(m))
      const eventCounts: Record<string, number> = {};
      if (eventsResult.data?.length) {
        for (const event of eventsResult.data) {
          const eventDateString = event.created_at.split('T')[0];
          if (eventDateString === dateString) {
            eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
          }
        }
      }

      return {
        date: dateString,
        vocab_created: {
          completed: eventCounts['vocab_created'] || 0,
          target: profile?.daily_review_goal || 10,
        },
        journal_created: {
          completed: eventCounts['journal_created'] || 0,
          target: profile?.daily_journal_goal || 1,
        },
        roleplay_completed: {
          completed: eventCounts['roleplay_completed'] || 0,
          target: profile?.daily_roleplay_goal || 1,
        },
      };
    } catch (error) {
      console.error('Error fetching daily goal status:', error);
      return {
        date: (date || new Date()).toISOString().split('T')[0],
        vocab_created: { completed: 0, target: 10 },
        journal_created: { completed: 0, target: 1 },
        roleplay_completed: { completed: 0, target: 1 },
      };
    }
  }

  /**
   * Get weekly activity data (optimized with date filtering at DB level)
   * 
   * Algorithm:
   * 1. Calculate date range boundaries (start of startDate to end of endDate)
   * 2. Query DB with date filter to minimize data transfer
   * 3. Pre-allocate Map with all dates in range (O(n) where n = days)
   * 4. Single-pass aggregation of events into Map (O(m) where m = events)
   * 5. Convert to sorted array
   * Total: O(n + m) - linear time complexity
   */
  async getWeeklyActivity(
    profileId: string,
    startDate: Date,
    endDate: Date,
    timezoneOffset?: number
  ): Promise<WeeklyActivityData[]> {
    try {
      const supabase = await this.getSupabaseClient();
      
      // Extend date range to capture full days in user's timezone
      const startISO = new Date(startDate.getTime() - 86400000).toISOString(); // -1 day buffer
      const endISO = new Date(endDate.getTime() + 86400000).toISOString();     // +1 day buffer
      
      // OPTIMIZATION: Filter at database level to reduce data transfer
      const { data, error } = await (supabase as any)
        .from('learning_events')
        .select('event_type, created_at')
        .eq('profile_id', profileId)
        .neq('event_type', 'session_active')
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Pre-allocate Map with all dates (O(n) where n = number of days)
      const activityMap = new Map<string, WeeklyActivityData>();
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        activityMap.set(dateKey, {
          date: dateKey,
          vocab_created: 0,
          journal_created: 0,
          roleplay_completed: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Single-pass aggregation (O(m) where m = filtered events)
      if (data?.length) {
        for (const event of data) {
          const dateKey = event.created_at.split('T')[0];
          const dayData = activityMap.get(dateKey);
          if (dayData) {
            (dayData as any)[event.event_type] = ((dayData as any)[event.event_type] || 0) + 1;
          }
        }
      }

      return Array.from(activityMap.values());
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      return [];
    }
  }

  /**
   * Get grammar error summary grouped by topic
   */
  async getGrammarErrorSummary(
    profileId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<GrammarErrorSummary[]> {
    try {
      const supabase = await this.getSupabaseClient();
      let query = (supabase as any)
        .from('grammar_feedback_view')
        .select('*')
        .eq('profile_id', profileId)
        .not('topic_name', 'is', null)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by topic and aggregate
      const topicMap = new Map<string, {
        topic_id: string | null;
        topic_level: string | null;
        errors: string[];
        tags: Set<string>;
      }>();

      data?.forEach((item: any) => {
        if (!item.topic_name) return;

        if (!topicMap.has(item.topic_name)) {
          topicMap.set(item.topic_name, {
            topic_id: item.grammar_topic_id || null,
            topic_level: item.topic_level,
            errors: [],
            tags: new Set(),
          });
        }

        const topicData = topicMap.get(item.topic_name)!;
        if (item.error_description && topicData.errors.length < 5) {
          topicData.errors.push(item.error_description);
        }

        // Collect all tags
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => topicData.tags.add(tag));
        }
      });

      // Convert to array and sort by error count
      return Array.from(topicMap.entries())
        .map(([topic_name, data]) => ({
          topic_name,
          topic_id: data.topic_id,
          topic_level: data.topic_level,
          error_count: data.errors.length,
          recent_errors: data.errors,
          all_tags: Array.from(data.tags),
        }))
        .sort((a, b) => b.error_count - a.error_count);
    } catch (error) {
      console.error('Error fetching grammar error summary:', error);
      return [];
    }
  }

  /**
   * Track a learning event and update streak if ALL daily goals satisfied
   */
  async trackLearningEvent(
    profileId: string,
    eventType: LearningEventType,
    metadata: any = {}
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      // 1. Insert learning event
      const { error: eventError } = await (supabase as any)
        .from('learning_events')
        .insert({
          profile_id: profileId,
          event_type: eventType,
          metadata
        });

      if (eventError) throw eventError;

      // 2. Update streak if applicable (only for goal-related events)
      if (['vocab_created', 'journal_created', 'roleplay_completed'].includes(eventType)) {
        await this.updateStreakIfGoalsSatisfied(profileId);
      }
    } catch (error) {
      console.error('Error tracking learning event:', error);
    }
  }

  /**
   * Update streak using optimized database function
   * 
   * Uses PostgreSQL function `update_user_streak` which:
   * - Calculates streak atomically in single transaction
   * - Prevents race conditions with database-level locking
   * - Reduces network round-trips from 5-7 queries to 1
   * - Automatically handles goal checking and streak logic
   * 
   * Performance: O(1) single atomic database operation
   */
  private async updateStreakIfGoalsSatisfied(profileId: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      // Call PostgreSQL function - single atomic operation
      const { data, error } = await (supabase as any).rpc('update_user_streak', {
        p_profile_id: profileId,
        p_today: today
      });

      if (error) {
        console.error('Error calling update_user_streak:', error);
        throw error;
      }

      // Optional: Log result for debugging
      if (data && data.length > 0) {
        const result = data[0];
        console.log('Streak updated:', {
          current_streak: result.current_streak,
          longest_streak: result.longest_streak,
          goals_met: result.goals_met
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Get streak data from user_streaks table (simplified - no freeze info)
   */
  async getStreak(profileId: string): Promise<StreakData> {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await (supabase as any)
        .from('user_streaks')
        .select('current_streak, longest_streak, last_active_date')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return {
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null,
        };
      }

      return {
        current_streak: data.current_streak,
        longest_streak: data.longest_streak,
        last_active_date: data.last_active_date,
      };
    } catch (error) {
      console.error('Error fetching streak:', error);
      return {
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null,
      };
    }
  }

  /**
   * Get daily goal statuses for a month (optimized for calendar view)
   * 
   * Algorithm:
   * 1. Calculate month boundaries in user's timezone
   * 2. Parallel fetch: profile goals + month's events (DB-filtered)
   * 3. Single-pass grouping by date with Map (O(m))
   * 4. Convert to goal status objects (O(d) where d = days with events)
   * Total: O(m + d) - much faster than fetching all events
   */
  async getMonthlyGoalStatuses(
    profileId: string,
    month: Date,
    timezoneOffset?: number
  ): Promise<Map<string, DailyGoalStatus>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Calculate month range
      let targetMonthString: string;
      if (timezoneOffset !== undefined) {
        const localTime = new Date(month.getTime() - (timezoneOffset * 60000));
        targetMonthString = localTime.toISOString().substring(0, 7);
      } else {
        targetMonthString = month.toISOString().substring(0, 7);
      }

      // Calculate DB query range (first to last day of month + buffer)
      const monthStart = new Date(targetMonthString + '-01T00:00:00Z');
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
      const bufferStart = new Date(monthStart.getTime() - 86400000).toISOString(); // -1 day
      const bufferEnd = new Date(monthEnd.getTime() + 86400000).toISOString();     // +1 day

      // OPTIMIZATION: Parallel fetch + DB-level date filtering
      const [profileResult, eventsResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
          .eq('id', profileId)
          .single(),
        (supabase as any)
          .from('learning_events')
          .select('event_type, created_at')
          .eq('profile_id', profileId)
          .neq('event_type', 'session_active')
          .gte('created_at', bufferStart)
          .lte('created_at', bufferEnd)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const profile = profileResult.data;
      const eventsByDate = new Map<string, Record<string, number>>();

      // Single-pass grouping and aggregation (O(m))
      if (eventsResult.data?.length) {
        for (const event of eventsResult.data) {
          const dateKey = event.created_at.split('T')[0];
          const eventMonthString = dateKey.substring(0, 7);
          
          // Client-side precision filtering
          if (eventMonthString === targetMonthString) {
            if (!eventsByDate.has(dateKey)) {
              eventsByDate.set(dateKey, {});
            }
            const dayCounts = eventsByDate.get(dateKey)!;
            dayCounts[event.event_type] = (dayCounts[event.event_type] || 0) + 1;
          }
        }
      }

      // Convert to goal statuses (O(d))
      const goalStatuses = new Map<string, DailyGoalStatus>();
      for (const [dateKey, counts] of eventsByDate) {
        goalStatuses.set(dateKey, {
          date: dateKey,
          vocab_created: {
            completed: counts['vocab_created'] || 0,
            target: profile?.daily_review_goal || 10,
          },
          journal_created: {
            completed: counts['journal_created'] || 0,
            target: profile?.daily_journal_goal || 1,
          },
          roleplay_completed: {
            completed: counts['roleplay_completed'] || 0,
            target: profile?.daily_roleplay_goal || 1,
          },
        });
      }

      return goalStatuses;
    } catch (error) {
      console.error('Error fetching monthly goal statuses:', error);
      return new Map();
    }
  }

  /**
   * Get comprehensive analytics summary
   */
  async getAnalyticsSummary(
    profileId: string,
    startDate: Date,
    endDate: Date,
    timezoneOffset?: number
  ): Promise<AnalyticsSummary> {
    try {
      const [dailyGoal, weeklyActivity, grammarErrors, streak] = await Promise.all([
        this.getDailyGoalStatus(profileId, undefined, timezoneOffset),
        this.getWeeklyActivity(profileId, startDate, endDate, timezoneOffset),
        this.getGrammarErrorSummary(profileId, startDate, endDate),
        this.getStreak(profileId),
      ]);

      return {
        dailyGoal,
        weeklyActivity,
        grammarErrors,
        streak,
      };
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
