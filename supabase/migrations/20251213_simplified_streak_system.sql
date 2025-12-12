-- Simplified Streak System: Remove freeze functionality, ensure daily_goal_completions exists

-- Remove freeze columns from user_streaks if they exist
ALTER TABLE user_streaks
DROP COLUMN IF EXISTS freeze_used_at,
DROP COLUMN IF EXISTS freeze_available,
DROP COLUMN IF EXISTS total_freezes_used;

-- Drop related index
DROP INDEX IF EXISTS idx_user_streaks_freeze_used;

-- Ensure daily_goal_completions table exists (idempotent)
CREATE TABLE IF NOT EXISTS daily_goal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  vocab_count INTEGER NOT NULL DEFAULT 0,
  journal_count INTEGER NOT NULL DEFAULT 0,
  roleplay_count INTEGER NOT NULL DEFAULT 0,
  all_goals_met BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one record per user per day
  UNIQUE(profile_id, completion_date)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_completions_profile_date 
ON daily_goal_completions(profile_id, completion_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_completions_goals_met 
ON daily_goal_completions(profile_id, all_goals_met, completion_date DESC);

-- Add helpful comments
COMMENT ON TABLE daily_goal_completions IS 'Tracks daily goal completion status for streak calculation (simplified - no freeze logic)';
COMMENT ON COLUMN daily_goal_completions.all_goals_met IS 'True if ALL daily goals (vocab, journal, roleplay) were met on this date';
COMMENT ON COLUMN daily_goal_completions.completion_date IS 'Date in user timezone (date only, no time)';

-- Enable RLS on daily_goal_completions
ALTER TABLE daily_goal_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own completion records
CREATE POLICY "Users can view own daily completions"
ON daily_goal_completions
FOR SELECT
USING (auth.uid() = profile_id);

-- RLS Policy: Service role can insert/update (for analytics service)
CREATE POLICY "Service can manage daily completions"
ON daily_goal_completions
FOR ALL
USING (true)
WITH CHECK (true);
