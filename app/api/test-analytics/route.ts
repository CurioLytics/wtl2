import { NextRequest } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { createClient } from '@/services/supabase/server';

/**
 * GET /api/test-analytics
 * Debug endpoint to inspect raw learning_events data
 * 
 * Query params:
 * - days: number of days to look back (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    const supabase = await createClient();

    // Get raw learning events
    const { data: events, error: eventsError } = await (supabase as any)
      .from('learning_events')
      .select('event_type, created_at, metadata')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (eventsError) throw eventsError;

    // Get user profile goals
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get user streak data
    const { data: streak, error: streakError } = await (supabase as any)
      .from('user_streaks')
      .select('*')
      .eq('profile_id', user.id)
      .single();

    // Analyze event distribution
    const eventCounts = events?.reduce((acc: any, e: any) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Group by date
    const eventsByDate = events?.reduce((acc: any, e: any) => {
      const dateKey = e.created_at.split('T')[0]; // Handle ISO format
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(e.event_type);
      return acc;
    }, {}) || {};

    return createSuccessResponse({
      debug_info: {
        user_id: user.id,
        total_events: events?.length || 0,
        date_range: {
          oldest: events?.[events.length - 1]?.created_at,
          newest: events?.[0]?.created_at
        }
      },
      user_goals: profile,
      user_streak: streak || { message: 'No streak data found' },
      event_type_counts: eventCounts,
      events_by_date: eventsByDate,
      recent_events: events?.slice(0, 20).map((e: any) => ({
        type: e.event_type,
        date: e.created_at,
        metadata: e.metadata
      })),
      sql_queries: {
        learning_events: `SELECT event_type, created_at, metadata FROM learning_events WHERE profile_id = '${user.id}' ORDER BY created_at DESC LIMIT 100`,
        profiles: `SELECT daily_review_goal, daily_roleplay_goal, daily_journal_goal FROM profiles WHERE id = '${user.id}'`,
        user_streaks: `SELECT * FROM user_streaks WHERE profile_id = '${user.id}'`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
