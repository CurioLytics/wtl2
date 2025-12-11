
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
   * @param profileId - User profile ID
   * @param date - Target date (defaults to today)
   * @param timezoneOffset - Client timezone offset in minutes (e.g., -420 for UTC+7)
   */
  async getDailyGoalStatus(profileId: string, date?: Date, timezoneOffset?: number): Promise<DailyGoalStatus> {
    try {
      const supabase = await this.getSupabaseClient();
      const targetDate = date || new Date();

      // Get the date string in user's local timezone
      let dateString: string;
      if (timezoneOffset !== undefined) {
        // Adjust for user's timezone offset
        const localTime = new Date(targetDate.getTime() - (timezoneOffset * 60000));
        dateString = localTime.toISOString().split('T')[0];
      } else {
        // Fallback: use ISO date (will be UTC)
        dateString = targetDate.toISOString().split('T')[0];
      }

      console.log('[getDailyGoalStatus] Date range:', {
        targetDate: targetDate.toISOString(),
        timezoneOffset,
        dateString,
        profileId
      });

      // Fetch user's goal settings from profile and today's events in parallel
      const [profileResult, eventsResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
          .eq('id', profileId)
          .maybeSingle(),
        (supabase as any)
          .from('learning_events')
          .select('event_type, created_at')
          .eq('profile_id', profileId)
          .neq('event_type', 'session_active')
      ]);

      if (profileResult.error) throw profileResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const profile = profileResult.data;
      const allEvents = eventsResult.data || [];

      // Filter events by date string extracted from ISO timestamp
      // This preserves the original timezone from the database
      const events = allEvents.filter((event: any) => {
        // Extract YYYY-MM-DD from timestamp like "2025-12-11 06:20:44.961921+07"
        // The database timestamp includes timezone, so we extract the local date portion
        const timestamp = event.created_at;
        const eventDateString = timestamp.split(' ')[0]; // Get "2025-12-11" part
        return eventDateString === dateString;
      });

      console.log('[getDailyGoalStatus] Profile goals:', profile);
      console.log('[getDailyGoalStatus] All events:', allEvents?.length);
      console.log('[getDailyGoalStatus] Events for', dateString, ':', events?.length, events);

      // Count each event type
      const eventCounts = (events as any)?.reduce((acc: any, e: any) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('[getDailyGoalStatus] Event counts:', eventCounts);

      return {
        date: targetDate.toISOString().split('T')[0],
        vocab_created: {
          completed: eventCounts['vocab_created'] || 0,
          target: profile?.daily_review_goal || 10, // default 10 if not set
        },
        journal_created: {
          completed: eventCounts['journal_created'] || 0,
          target: profile?.daily_journal_goal || 1, // default 1 if not set
        },
        roleplay_completed: {
          completed: eventCounts['roleplay_completed'] || 0,
          target: profile?.daily_roleplay_goal || 1, // default 1 if not set
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
   * Get weekly activity data (7 days by default)
   */
  async getWeeklyActivity(
    profileId: string,
    startDate: Date,
    endDate: Date,
    timezoneOffset?: number
  ): Promise<WeeklyActivityData[]> {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await (supabase as any)
        .from('learning_events')
        .select('event_type, created_at')
        .eq('profile_id', profileId)
        .neq('event_type', 'session_active')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date and event type
      const activityMap = new Map<string, WeeklyActivityData>();

      // Initialize all dates in range with zero counts
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        activityMap.set(dateKey, {
          date: dateKey,
          vocab_created: 0,
          vocab_reviewed: 0,
          journal_created: 0,
          roleplay_completed: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count events per day by extracting date from timestamp string
      (data as any)?.forEach((event: any) => {
        // Extract YYYY-MM-DD from timestamp like "2025-12-11 06:20:44.961921+07"
        const timestamp = event.created_at;
        const dateKey = timestamp.split(' ')[0]; // Get "2025-12-11" part
        const dayData = activityMap.get(dateKey);
        if (dayData && event.event_type !== 'session_active') {
          (dayData as any)[event.event_type]++;
        }
      });

      return Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date));
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
   * Calculate streak based on session_active events
   */
  /**
   * Track a learning event and update streak
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

      // 2. Update streak if applicable
      if (['vocab_created', 'journal_created', 'roleplay_completed'].includes(eventType)) {
        await this.updateStreak(profileId);
      }
    } catch (error) {
      console.error('Error tracking learning event:', error);
    }
  }

  /**
   * Internal method to update streak logic
   */
  private async updateStreak(profileId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get current streak
    const { data: currentStreakData } = await (supabase as any)
      .from('user_streaks')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    let newCurrentStreak = 1;
    let newLongestStreak = 1;
    let shouldUpdate = false;

    if (currentStreakData) {
      const lastActive = currentStreakData.last_active_date;

      if (lastActive === today) {
        return; // Already counted
      } else if (lastActive === yesterday) {
        newCurrentStreak = currentStreakData.current_streak + 1;
      } else {
        newCurrentStreak = 1; // Streak broken
      }

      newLongestStreak = Math.max(currentStreakData.longest_streak, newCurrentStreak);
      shouldUpdate = true;
    } else {
      shouldUpdate = true; // First time
    }

    if (shouldUpdate) {
      const { error } = await (supabase as any)
        .from('user_streaks')
        .upsert({
          profile_id: profileId,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_active_date: today,
          updated_at: new Date().toISOString()
        });

      if (error) console.error('Error updating streak:', error);
    }
  }

  /**
   * Get streak data from user_streaks table
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
        return { current_streak: 0, longest_streak: 0, last_active_date: null };
      }

      return {
        current_streak: data.current_streak,
        longest_streak: data.longest_streak,
        last_active_date: data.last_active_date,
      };
    } catch (error) {
      console.error('Error fetching streak:', error);
      return { current_streak: 0, longest_streak: 0, last_active_date: null };
    }
  }

  /**
   * Get daily goal statuses for a month (for calendar view)
   */
  async getMonthlyGoalStatuses(
    profileId: string,
    month: Date,
    timezoneOffset?: number
  ): Promise<Map<string, DailyGoalStatus>> {
    try {
      const supabase = await this.getSupabaseClient();

      console.log('[getMonthlyGoalStatuses] Fetching for month:', {
        month: month.toISOString(),
        timezoneOffset,
        profileId
      });

      // Fetch profile goals and all events (will filter client-side)
      const [profileResult, eventsResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
          .eq('id', profileId)
          .maybeSingle(),
        (supabase as any)
          .from('learning_events')
          .select('event_type, created_at')
          .eq('profile_id', profileId)
          .neq('event_type', 'session_active')
      ]);

      if (profileResult.error) throw profileResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const profile = profileResult.data;
      const allEvents = eventsResult.data || [];

      // Get target month string in YYYY-MM format (adjusted for timezone)
      let targetMonthString: string;
      if (timezoneOffset !== undefined) {
        const localTime = new Date(month.getTime() - (timezoneOffset * 60000));
        targetMonthString = localTime.toISOString().substring(0, 7);
      } else {
        targetMonthString = month.toISOString().substring(0, 7);
      }

      // Group events by date using timestamp string extraction
      const eventsByDate = new Map<string, { [key: string]: number }>();

      allEvents.forEach((event: any) => {
        // Extract YYYY-MM-DD from timestamp like "2025-12-11 06:20:44.961921+07"
        const timestamp = event.created_at;
        const dateKey = timestamp.split(' ')[0]; // Get "2025-12-11" part
        const eventMonthString = dateKey.substring(0, 7); // Get "2025-12" part
        
        // Only include events from the target month
        if (eventMonthString !== targetMonthString) {
          return;
        }

        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, {});
        }

        const dayCounts = eventsByDate.get(dateKey)!;
        dayCounts[event.event_type] = (dayCounts[event.event_type] || 0) + 1;
      });

      // Create goal statuses for each date
      const goalStatuses = new Map<string, DailyGoalStatus>();

      eventsByDate.forEach((counts, dateKey) => {
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
      });

      console.log('[getMonthlyGoalStatuses] Generated statuses for', goalStatuses.size, 'days');

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
