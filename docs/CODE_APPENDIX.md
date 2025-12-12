# Write2Learn - Code Appendix

**Repository**: https://github.com/CurioLytics/wtl2  
**Branch**: feature/experimental-code

This appendix contains key code snippets from important modules and functions in the Write2Learn application. Code is formatted for readability and includes explanatory comments.

---

## Table of Contents

1. [Analytics & Streak System](#1-analytics--streak-system)
2. [Weekly Activity Chart](#2-weekly-activity-chart)
3. [Vocabulary & FSRS System](#3-vocabulary--fsrs-system)
4. [Journal Feedback System](#4-journal-feedback-system)
5. [Authentication & Middleware](#5-authentication--middleware)
6. [Database Utilities](#6-database-utilities)

---

## 1. Analytics & Streak System

### 1.1 Streak Calculation Algorithm

**File**: `services/analytics-service.ts` (Lines 297-410)

```typescript
/**
 * Update streak only when ALL daily goals are satisfied (simplified - no freeze logic)
 * 
 * Algorithm:
 * 1. Check if today already processed (early return for performance)
 * 2. Parallel fetch: profile goals + today's events
 * 3. Count events by type (vocab, journal, roleplay)
 * 4. Check if ALL goals satisfied
 * 5. Record to daily_goal_completions (UPSERT)
 * 6. If satisfied AND consecutive from yesterday: increment streak
 *    If satisfied AND gap: reset to 1
 *    If not satisfied: streak = 0
 * 7. Update user_streaks table
 * 
 * Performance: O(1) with constant queries, early return prevents redundant processing
 */
private async updateStreakIfGoalsSatisfied(profileId: string): Promise<void> {
  const supabase = await this.getSupabaseClient();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Step 1: Early return if already processed (PERFORMANCE OPTIMIZATION)
  const { data: currentStreakData } = await (supabase as any)
    .from('user_streaks')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (currentStreakData?.last_active_date === today) {
    return; // Already counted today - skip expensive queries
  }

  // Step 2: Parallel fetch goals and today's events
  const [profileResult, eventsResult] = await Promise.all([
    (supabase as any)
      .from('profiles')
      .select('daily_review_goal, daily_journal_goal, daily_roleplay_goal')
      .eq('id', profileId)
      .single(),
    (supabase as any)
      .from('learning_events')
      .select('event_type')
      .eq('profile_id', profileId)
      .gte('created_at', today + 'T00:00:00Z')
      .lte('created_at', today + 'T23:59:59Z')
  ]);

  if (profileResult.error) throw profileResult.error;
  if (eventsResult.error) throw eventsResult.error;

  const profile = profileResult.data;
  const goals = {
    vocab: profile?.daily_review_goal || 10,
    journal: profile?.daily_journal_goal || 1,
    roleplay: profile?.daily_roleplay_goal || 1,
  };

  // Step 3: Count today's events
  const counts = {
    vocab_created: 0,
    journal_created: 0,
    roleplay_completed: 0,
  };

  eventsResult.data?.forEach((event: any) => {
    if (event.event_type in counts) {
      (counts as any)[event.event_type]++;
    }
  });

  // Step 4: Check if ALL goals satisfied
  const allGoalsSatisfied =
    counts.vocab_created >= goals.vocab &&
    counts.journal_created >= goals.journal &&
    counts.roleplay_completed >= goals.roleplay;

  // Step 5: Record today's completion status
  await (supabase as any)
    .from('daily_goal_completions')
    .upsert({
      profile_id: profileId,
      completion_date: today,
      vocab_count: counts.vocab_created,
      journal_count: counts.journal_created,
      roleplay_count: counts.roleplay_completed,
      all_goals_met: allGoalsSatisfied,
    });

  // Step 6-7: Calculate new streak (simplified logic)
  let newCurrentStreak: number;
  let newLongestStreak: number;

  if (allGoalsSatisfied) {
    // Goals met! Check if consecutive from yesterday
    if (currentStreakData?.last_active_date === yesterday) {
      newCurrentStreak = currentStreakData.current_streak + 1;
    } else {
      newCurrentStreak = 1; // First day or after gap
    }
    newLongestStreak = Math.max(currentStreakData?.longest_streak || 0, newCurrentStreak);
  } else {
    // Goals not met: streak broken
    newCurrentStreak = 0;
    newLongestStreak = currentStreakData?.longest_streak || 0;
  }

  // Upsert streak record (simplified - no freeze fields)
  await (supabase as any)
    .from('user_streaks')
    .upsert({
      profile_id: profileId,
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_active_date: today,
      updated_at: new Date().toISOString()
    });
}
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/analytics-service.ts#L297-L410

### 1.2 Get Streak Data

**File**: `services/analytics-service.ts` (Lines 416-437)

```typescript
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
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/analytics-service.ts#L416-L437

### 1.3 Track Learning Event

**File**: `services/analytics-service.ts` (Lines 263-287)

```typescript
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
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/analytics-service.ts#L263-L287

---

## 2. Weekly Activity Chart

### 2.1 Get Weekly Activity Data

**File**: `services/analytics-service.ts` (Lines 118-186)

```typescript
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
        vocab_reviewed: 0,
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
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/analytics-service.ts#L118-L186

### 2.2 Weekly Activity Chart Component

**File**: `components/dashboard/weekly-activity-chart.tsx`

```typescript
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { WeeklyActivityData } from '@/types/analytics';

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[];
  isLoading?: boolean;
}

const ACTIVITY_COLORS = {
  vocab_created: '#8b5cf6',      // purple
  vocab_reviewed: '#06b6d4',     // cyan
  journal_created: '#f59e0b',    // amber
  roleplay_completed: '#10b981', // emerald
};

const ACTIVITY_LABELS = {
  vocab_created: 'Vocab Added',
  vocab_reviewed: 'Vocab Reviewed',
  journal_created: 'Journal Entry',
  roleplay_completed: 'Roleplay Session',
};

export function WeeklyActivityChart({ data, isLoading }: WeeklyActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Đang tải dữ liệu hoạt động...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Không có dữ liệu hoạt động</div>
        </div>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
  }));

  return (
    <Card className="p-6 bg-white shadow rounded-2xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Weekly Activity</h3>
        <p className="text-sm text-muted-foreground">Your learning activities over time</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="dateLabel"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => ACTIVITY_LABELS[value as keyof typeof ACTIVITY_LABELS] || value}
          />
          <Bar
            dataKey="vocab_created"
            stackId="a"
            fill={ACTIVITY_COLORS.vocab_created}
            name="vocab_created"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="vocab_reviewed"
            stackId="a"
            fill={ACTIVITY_COLORS.vocab_reviewed}
            name="vocab_reviewed"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="journal_created"
            stackId="a"
            fill={ACTIVITY_COLORS.journal_created}
            name="journal_created"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="roleplay_completed"
            stackId="a"
            fill={ACTIVITY_COLORS.roleplay_completed}
            name="roleplay_completed"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/components/dashboard/weekly-activity-chart.tsx

---

## 3. Vocabulary & FSRS System

### 3.1 FSRS Handler - Review Processing

**File**: `lib/fsrs/handler.ts`

```typescript
import { fsrs, Rating } from "ts-fsrs";
import { db } from "../database/db"; // your singleton client

const scheduler = fsrs();

/**
 * Handles a user review for a given vocabulary word.
 * Fetches, updates, and logs using Supabase.
 */
export async function handleReview(vocabulary_id: string, ratingValue: number) {
  // 1️⃣ Fetch current status
  const { data: status, error: fetchError } = await db
    .from("vocabulary_status")
    .select("*")
    .eq("vocabulary_id", vocabulary_id)
    .single();

  if (fetchError || !status) throw new Error("Vocabulary status not found");

  // 2️⃣ Build FSRS card object
  const card = {
    due: new Date(status.next_review_at || Date.now()),
    stability: status.stability ?? 0,
    difficulty: status.difficulty ?? 0.3,
    elapsed_days: status.elapsed_days ?? 0,
    scheduled_days: status.scheduled_days ?? 0,
    learning_steps: status.learning_steps ?? 0,
    reps: status.repetitions ?? 0,
    lapses: status.lapses ?? 0,
    state: mapState(status.state),
    last_review: status.last_review_at ? new Date(status.last_review_at) : new Date(),
  };

  // 3️⃣ Run FSRS algorithm
  const now = new Date();
  const rating = mapRating(ratingValue);
  const { card: updated, log } = scheduler.next(card, now, rating);

  // 4️⃣ Update vocabulary_status
  const { error: updateError } = await db
    .from("vocabulary_status")
    .update({
      next_review_at: updated.due.toISOString(),
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsed_days: updated.elapsed_days,
      scheduled_days: updated.scheduled_days,
      learning_steps: updated.learning_steps,
      repetitions: updated.reps,
      lapses: updated.lapses,
      state: reverseMapState(updated.state),
      last_review_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("vocabulary_id", vocabulary_id);

  if (updateError) throw updateError;

  // 5️⃣ Log the review
  const { error: logError } = await db
    .from("fsrs_review_logs")
    .insert({
      card_id: status.id,
      rating: ratingValue.toString(),
      scheduled_days: log.scheduled_days,
      elapsed_days: log.elapsed_days,
      review_date: log.review.toISOString(),
      state: reverseMapState(log.state),
    });

  if (logError) throw logError;

  return {
    vocabulary_id,
    next_review_at: updated.due,
    stability: updated.stability,
    difficulty: updated.difficulty,
  };
}

/** Map DB state (string) to FSRS state (number) */
function mapState(state: string | null) {
  if (!state) return 0; // New
  if (state === 'learning') return 1;
  if (state === 'review') return 2;
  if (state === 'relearning') return 3;
  return 0;
}

/** Map FSRS state (number) back to DB string */
function reverseMapState(state: number) {
  if (state === 0) return 'new';
  if (state === 1) return 'learning';
  if (state === 2) return 'review';
  if (state === 3) return 'relearning';
  return 'new';
}

/** Convert user rating (1–4) to FSRS Rating enum */
function mapRating(value: number) {
  if (value === 1) return Rating.Again;
  if (value === 2) return Rating.Hard;
  if (value === 3) return Rating.Good;
  return Rating.Easy;
}
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/lib/fsrs/handler.ts

### 3.2 Vocabulary Review Service

**File**: `services/vocabulary/vocabulary-review-service.ts`

```typescript
import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { handleReview } from '@/lib/fsrs/handler';

export interface VocabularyForReview {
  vocabulary_id: string;
  word: string;
  meaning: string;
  example?: string;
  next_review_at: string;
  ease_factor: number;
  interval: number;
  state: string;
}

export interface ReviewResult {
  success: boolean;
  vocabulary_id: string;
  next_review_at: string;
  stability: number;
  difficulty: number;
}

/**
 * Service for handling vocabulary review operations
 */
export class VocabularyReviewService {
  private supabase = createSupabaseClient();

  /**
   * Get vocabulary words due for review from a specific set
   */
  async getVocabularyForReview(setId: string): Promise<VocabularyForReview[]> {
    const { data, error } = await this.supabase
      .from('vocabulary_status')
      .select(`
        vocabulary_id,
        next_review_at,
        ease_factor,
        interval,
        state,
        vocabulary!inner (
          id,
          word,
          meaning,
          example,
          set_id
        )
      `)
      .eq('vocabulary.set_id', setId)
      .lte('next_review_at', new Date().toISOString())
      .limit(30);

    if (error) {
      console.error('Error fetching vocabulary for review:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return this.transformVocabularyData(data || []);
  }

  /**
   * Submit a review for a vocabulary word using FSRS algorithm
   */
  async submitReview(vocabularyId: string, rating: number): Promise<ReviewResult> {
    try {
      // Validate rating (1-4 scale)
      if (rating < 1 || rating > 4) {
        throw new Error('Rating must be between 1 and 4');
      }

      // Use FSRS handler to process review
      const result = await handleReview(vocabularyId, rating);

      return {
        success: true,
        vocabulary_id: result.vocabulary_id,
        next_review_at: result.next_review_at.toISOString(),
        stability: result.stability,
        difficulty: result.difficulty,
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Transform raw database data to vocabulary review format
   */
  private transformVocabularyData(data: any[]): VocabularyForReview[] {
    return data.map((item: any) => ({
      vocabulary_id: item.vocabulary.id,
      word: item.vocabulary.word,
      meaning: item.vocabulary.meaning,
      example: item.vocabulary.example,
      next_review_at: item.next_review_at,
      ease_factor: item.ease_factor,
      interval: item.interval,
      state: item.state
    }));
  }
}

export const vocabularyReviewService = new VocabularyReviewService();
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/vocabulary/vocabulary-review-service.ts

---

## 4. Journal Feedback System

### 4.1 Journal Feedback Service

**File**: `services/journal-feedback-service.ts`

```typescript
import { 
  JournalFeedbackResponse, 
  FeedbackServiceResult,
  ServiceError 
} from '@/types/journal-feedback';

class JournalFeedbackService {
  /**
   * Get feedback for journal content with proper error handling
   */
  async getFeedback(content: string, title?: string): Promise<FeedbackServiceResult> {
    try {
      // Validation
      if (!content.trim()) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Journal content cannot be empty'
          }
        };
      }

      const response = await fetch('/api/journal-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: title || '' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: errorData.error || `Request failed with status: ${response.status}`
          }
        };
      }

      const data: JournalFeedbackResponse = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getFeedback instead which returns FeedbackServiceResult
   */
  async getLegacyFeedback(content: string, title?: string): Promise<JournalFeedbackResponse> {
    const result = await this.getFeedback(content, title);
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to get feedback');
    }
    
    return result.data;
  }
}

export const journalFeedbackService = new JournalFeedbackService();
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/journal-feedback-service.ts

### 4.2 Journal Service - Create Draft & Publish

**File**: `services/journal-service.ts` (Excerpts)

```typescript
/**
 * Creates a draft journal entry (for feedback review)
 */
async createDraftJournal(userId: string, data: {
  title: string | null;
  content: string;
  journal_date?: string | null;
  summary?: string | null;
}): Promise<{ id: string }> {
  return this.createJournal(userId, {
    ...data,
    is_draft: true,
  });
}

/**
 * Converts a draft journal to a final published journal
 */
async publishDraft(journalId: string, data: {
  title?: string | null;
  content?: string;
  journal_date?: string | null;
  enhanced_version?: string | null;
  summary?: string | null;
  is_draft?: boolean;
}): Promise<{ success: boolean }> {
  const supabase = createSupabaseClient();

  console.log('publishDraft - Publishing draft journal:', journalId);

  const { error } = await supabase
    .from('journals')
    .update({
      is_draft: false, // Mark as published
      title: data.title,
      content: data.content,
      journal_date: data.journal_date,
      enhanced_version: data.enhanced_version,
      summary: data.summary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', journalId);

  if (error) {
    console.error('Error publishing draft journal:', error);
    throw new Error(`Failed to publish draft journal: ${error.message}`);
  }

  return { success: true };
}

/**
 * Creates a journal entry from feedback data
 * Saves original content to content field and enhanced version to enhanced_version field
 */
async createJournalFromFeedback(userId: string, data: {
  title: string;
  originalContent: string;
  enhancedContent: string;
  journalDate: string;
  summary?: string;
  highlights?: string[];
}): Promise<{ id: string }> {
  try {
    console.log('createJournalFromFeedback - Creating journal from feedback for user:', userId);

    const result = await this.createJournal(userId, {
      title: data.title,
      content: data.originalContent,        // Save original content
      enhanced_version: data.enhancedContent,  // Save enhanced version
      journal_date: data.journalDate,
      summary: data.summary,               // Save summary
    });

    return result;
  } catch (error) {
    console.error('Error in createJournalFromFeedback:', error);
    throw error;
  }
}
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/journal-service.ts

---

## 5. Authentication & Middleware

### 5.1 Authentication Middleware

**File**: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, CookieOptions } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/auth', '/auth/callback', '/auth/forgot-password', '/auth/reset-password', '/'];
const PROTECTED_ROUTES = ['/home', '/journal', '/vocab', '/flashcards', '/roleplay', '/report', '/profile', '/account'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication check
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and accessing protected route, redirect to auth
  if (!session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // Check onboarding status for authenticated users
  if (session && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/onboarding';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/middleware.ts

### 5.2 API Authentication Helper

**File**: `utils/api-helpers.ts` (Excerpt)

```typescript
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Authenticates the user for API routes
 * Returns the authenticated user or throws an error
 */
export async function authenticateUser() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Creates standardized success response
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}

/**
 * Creates standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  errorCode?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(errorCode && { code: errorCode }),
      },
    },
    { status: statusCode }
  );
}

/**
 * Handles API errors consistently
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }
    return createErrorResponse(error.message, 500, 'INTERNAL_ERROR');
  }
  
  return createErrorResponse('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/utils/api-helpers.ts

---

## 6. Database Utilities

### 6.1 Database Types (Auto-Generated)

**File**: `types/database.types.ts` (Excerpt showing key tables)

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          english_level: string | null;
          style: string | null;
          daily_review_goal: number;
          daily_journal_goal: number;
          daily_roleplay_goal: number;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          english_level?: string | null;
          style?: string | null;
          daily_review_goal?: number;
          daily_journal_goal?: number;
          daily_roleplay_goal?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          english_level?: string | null;
          style?: string | null;
          daily_review_goal?: number;
          daily_journal_goal?: number;
          daily_roleplay_goal?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      learning_events: {
        Row: {
          id: string;
          profile_id: string;
          event_type: 'vocab_created' | 'vocab_reviewed' | 'journal_created' | 'roleplay_completed' | 'session_active';
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event_type: 'vocab_created' | 'vocab_reviewed' | 'journal_created' | 'roleplay_completed' | 'session_active';
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          event_type?: 'vocab_created' | 'vocab_reviewed' | 'journal_created' | 'roleplay_completed' | 'session_active';
          metadata?: any | null;
          created_at?: string;
        };
      };
      
      user_streaks: {
        Row: {
          id: string;
          profile_id: string;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      vocabulary_status: {
        Row: {
          id: string;
          vocabulary_id: string;
          interval: number;
          repetitions: number;
          ease_factor: number;
          next_review_at: string | null;
          last_review_at: string | null;
          stability: number | null;
          difficulty: number;
          elapsed_days: number | null;
          scheduled_days: number | null;
          learning_steps: number | null;
          lapses: number | null;
          state: string | null;
          updated_at: string | null;
        };
        // Insert and Update types omitted for brevity
      };
    };
  };
};
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/types/database.types.ts

### 6.2 Supabase Client Creation

**File**: `services/supabase/server.ts`

```typescript
import { cookies } from 'next/headers';
import { createServerClient, CookieOptions } from '@supabase/ssr';

/**
 * Creates a Supabase client for server-side operations (App Router)
 * Handles cookie management for authentication
 */
export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors (e.g., during static generation)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  );
}
```

**GitHub Link**: https://github.com/CurioLytics/wtl2/blob/feature/experimental-code/services/supabase/server.ts

---

## Conclusion

This appendix provides key code snippets from the most important modules in the Write2Learn application. Each section includes:

- **Formatted code** with proper syntax highlighting
- **Explanatory comments** describing algorithms and logic
- **GitHub links** to the actual source files

For the complete codebase and latest updates, visit the repository:
**https://github.com/CurioLytics/wtl2** (branch: `feature/experimental-code`)

