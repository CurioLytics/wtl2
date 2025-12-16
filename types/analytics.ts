import { Database } from '@/types/database.types';

export type LearningEventType = Database['public']['Tables']['learning_events']['Row']['event_type'];
export type GrammarFeedbackView = Database['public']['Views']['grammar_feedback_view']['Row'];

export interface DailyGoalStatus {
    date: string;
    vocab_created: {
        completed: number;
        target: number;
    };
    journal_created: {
        completed: number;
        target: number;
    };
    roleplay_completed: {
        completed: number;
        target: number;
    };
    all_goals_met?: boolean; // From daily_goal_completions table
}

export interface WeeklyActivityData {
    date: string;
    vocab_created: number;
    journal_created: number;
    roleplay_completed: number;
}

export interface GrammarErrorSummary {
    topic_name: string;
    topic_id: string | null;
    topic_level: string | null;
    error_count: number;
    recent_errors: string[];
    all_tags: string[]; // All tags from all errors in this topic
}

export interface StreakData {
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
}

export interface DailyGoalCompletion {
    id: string;
    profile_id: string;
    completion_date: string;
    vocab_count: number;
    journal_count: number;
    roleplay_count: number;
    all_goals_met: boolean;
    created_at: string;
}

export interface AnalyticsSummary {
    dailyGoal: DailyGoalStatus;
    weeklyActivity: WeeklyActivityData[];
    grammarErrors: GrammarErrorSummary[];
    streak: StreakData;
}
