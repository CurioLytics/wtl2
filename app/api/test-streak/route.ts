import { createClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];

        console.log('=== TESTING update_user_streak FUNCTION ===');
        console.log('User ID:', user.id);
        console.log('Today:', today);

        // Step 1: Check current goals
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('daily_review_goal, daily_journal_goal, daily_roleplay_goal')
            .eq('id', user.id)
            .single();

        console.log('User goals:', profile);

        // Step 2: Check today's events
        const { data: events, error: eventsError } = await supabase
            .from('learning_events')
            .select('event_type, created_at')
            .eq('profile_id', user.id)
            .gte('created_at', today + 'T00:00:00Z')
            .lte('created_at', today + 'T23:59:59Z');

        console.log('Today\'s events:', events);

        // Count events by type
        const eventCounts = {
            vocab_created: 0,
            journal_created: 0,
            roleplay_completed: 0
        };

        events?.forEach(event => {
            if (event.event_type in eventCounts) {
                eventCounts[event.event_type as keyof typeof eventCounts]++;
            }
        });

        console.log('Event counts:', eventCounts);

        // Step 3: Check current streak before update
        const { data: streakBefore, error: streakBeforeError } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('profile_id', user.id)
            .single();

        console.log('Streak before:', streakBefore);

        // Step 4: Call the function
        console.log('Calling update_user_streak...');
        const { data: functionResult, error: functionError } = await supabase.rpc('update_user_streak', {
            p_profile_id: user.id,
            p_today: today
        });

        if (functionError) {
            console.error('Function error:', functionError);
            return NextResponse.json({
                success: false,
                error: functionError,
                details: {
                    code: functionError.code,
                    message: functionError.message,
                    details: functionError.details,
                    hint: functionError.hint
                }
            }, { status: 500 });
        }

        console.log('Function result:', functionResult);

        // Step 5: Check streak after update
        const { data: streakAfter, error: streakAfterError } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('profile_id', user.id)
            .single();

        console.log('Streak after:', streakAfter);

        // Step 6: Check if daily_goal_completions was updated
        const { data: completion, error: completionError } = await supabase
            .from('daily_goal_completions')
            .select('*')
            .eq('profile_id', user.id)
            .eq('completion_date', today)
            .single();

        console.log('Daily goal completion record:', completion);

        // Step 7: Get all completions for this user
        const { data: allCompletions, error: allCompletionsError } = await supabase
            .from('daily_goal_completions')
            .select('*')
            .eq('profile_id', user.id)
            .order('completion_date', { ascending: false })
            .limit(10);

        console.log('All completions (last 10):', allCompletions);

        return NextResponse.json({
            success: true,
            data: {
                user_id: user.id,
                today,
                profile,
                event_counts: eventCounts,
                events_list: events,
                streak_before: streakBefore,
                function_result: functionResult,
                streak_after: streakAfter,
                today_completion: completion,
                all_completions: allCompletions,
                goals_met: (
                    eventCounts.vocab_created >= (profile?.daily_review_goal || 10) &&
                    eventCounts.journal_created >= (profile?.daily_journal_goal || 1) &&
                    eventCounts.roleplay_completed >= (profile?.daily_roleplay_goal || 1)
                )
            }
        });

    } catch (error: any) {
        console.error('Test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
