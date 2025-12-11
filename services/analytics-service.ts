
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
   */
  async getDailyGoalStatus(profileId: string, date?: Date): Promise<DailyGoalStatus> {
    try {
      const supabase = await this.getSupabaseClient();
      const targetDate = date || new Date();

      // Get the date string in YYYY-MM-DD format (local timezone)
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      console.log('[getDailyGoalStatus] Date range:', {
        targetDate: targetDate.toISOString(),
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

      // Filter events by local date string
      const events = allEvents.filter((event: any) => {
        const eventDate = new Date(event.created_at);
        const eventYear = eventDate.getFullYear();
        const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
        const eventDay = String(eventDate.getDate()).padStart(2, '0');
        const eventDateString = `${eventYear}-${eventMonth}-${eventDay}`;
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
    endDate: Date
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

      // Initialize all dates in range with zero counts using local dates
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        activityMap.set(dateKey, {
          date: dateKey,
          vocab_created: 0,
          vocab_reviewed: 0,
          journal_created: 0,
          roleplay_completed: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count events per day using local date conversion
      (data as any)?.forEach((event: any) => {
        const eventDate = new Date(event.created_at);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
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
    month: Date
  ): Promise<Map<string, DailyGoalStatus>> {
    try {
      const supabase = await this.getSupabaseClient();

      console.log('[getMonthlyGoalStatuses] Fetching for month:', {
        month: month.toISOString(),
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

      // Get month boundaries using local time
      const targetYear = month.getFullYear();
      const targetMonth = month.getMonth();

      // Group events by date using local timezone
      const eventsByDate = new Map<string, { [key: string]: number }>();

      allEvents.forEach((event: any) => {
        const eventDate = new Date(event.created_at);
        const eventYear = eventDate.getFullYear();
        const eventMonth = eventDate.getMonth();
        
        // Only include events from the target month
        if (eventYear !== targetYear || eventMonth !== targetMonth) {
          return;
        }

        const dateKey = `${eventYear}-${String(eventMonth + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

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
    endDate: Date
  ): Promise<AnalyticsSummary> {
    try {
      const [dailyGoal, weeklyActivity, grammarErrors, streak] = await Promise.all([
        this.getDailyGoalStatus(profileId),
        this.getWeeklyActivity(profileId, startDate, endDate),
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
