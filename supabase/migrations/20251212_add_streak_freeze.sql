-- Add freeze functionality to user_streaks table
ALTER TABLE user_streaks
ADD COLUMN IF NOT EXISTS freeze_used_at DATE,
ADD COLUMN IF NOT EXISTS freeze_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS total_freezes_used INTEGER DEFAULT 0;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_streaks_freeze_used 
ON user_streaks(profile_id, freeze_used_at);

-- Add comment for documentation
COMMENT ON COLUMN user_streaks.freeze_used_at IS 'Date when freeze was last used (resets weekly on Monday)';
COMMENT ON COLUMN user_streaks.freeze_available IS 'Whether user can use freeze this week (resets Monday)';
COMMENT ON COLUMN user_streaks.total_freezes_used IS 'Total number of freezes used lifetime';

-- Create daily_goal_completions table to track which days met all goals
CREATE TABLE IF NOT EXISTS daily_goal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  vocab_count INTEGER NOT NULL,
  journal_count INTEGER NOT NULL,
  roleplay_count INTEGER NOT NULL,
  all_goals_met BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one record per user per day
  UNIQUE(profile_id, completion_date)
);

-- Index for efficient queries
CREATE INDEX idx_daily_completions_profile_date 
ON daily_goal_completions(profile_id, completion_date DESC);

CREATE INDEX idx_daily_completions_goals_met 
ON daily_goal_completions(profile_id, all_goals_met, completion_date DESC);

COMMENT ON TABLE daily_goal_completions IS 'Tracks daily goal completion status for streak calculation';
