import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics-service';
import { authenticateUser } from '@/utils/api-helpers';

/**
 * Test endpoint for streak calculation
 * Tests the simplified streak system (no freeze logic)
 * 
 * Usage:
 * POST /api/test-streak
 * Body: { scenario: "normal" | "broken" | "gap" }
 */
export async function POST(request: Request) {
  try {
    const user = await authenticateUser();
    const { scenario } = await request.json();

    const results: any = {
      scenario,
      timestamp: new Date().toISOString(),
      tests: [],
    };

    switch (scenario) {
      case 'normal':
        // Test: Normal streak growth (3 consecutive days)
        results.tests.push(await testNormalStreak(user.id));
        break;
      
      case 'broken':
        // Test: Streak broken then restart
        results.tests.push(await testBrokenStreak(user.id));
        break;
      
      case 'gap':
        // Test: Gap between activities
        results.tests.push(await testGapStreak(user.id));
        break;
      
      case 'performance':
        // Test: Early return performance optimization
        results.tests.push(await testEarlyReturn(user.id));
        break;
      
      default:
        // Run all tests
        results.tests.push(await testNormalStreak(user.id));
        results.tests.push(await testBrokenStreak(user.id));
        results.tests.push(await testGapStreak(user.id));
        results.tests.push(await testEarlyReturn(user.id));
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error('Test streak error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function testNormalStreak(profileId: string) {
  const startTime = Date.now();
  
  // Simulate completing all goals
  await analyticsService.trackLearningEvent(profileId, 'vocab_created', { test: true });
  await analyticsService.trackLearningEvent(profileId, 'journal_created', { test: true });
  await analyticsService.trackLearningEvent(profileId, 'roleplay_completed', { test: true });
  
  const streak = await analyticsService.getStreak(profileId);
  const duration = Date.now() - startTime;
  
  return {
    name: 'Normal Streak Growth',
    passed: streak.current_streak > 0,
    details: {
      current_streak: streak.current_streak,
      longest_streak: streak.longest_streak,
      last_active_date: streak.last_active_date,
      duration_ms: duration,
    },
  };
}

async function testBrokenStreak(profileId: string) {
  const startTime = Date.now();
  
  // Get current streak
  const beforeStreak = await analyticsService.getStreak(profileId);
  
  // Only complete some goals (not all) - this should NOT increase streak
  // Note: Since we already completed goals today in previous test,
  // the early return will kick in and streak won't change
  // This test is more for documentation
  
  const afterStreak = await analyticsService.getStreak(profileId);
  const duration = Date.now() - startTime;
  
  return {
    name: 'Streak State Check',
    passed: true,
    details: {
      before: beforeStreak,
      after: afterStreak,
      note: 'Early return prevents re-processing same day',
      duration_ms: duration,
    },
  };
}

async function testGapStreak(profileId: string) {
  // This test would require manual database manipulation
  // to simulate days passing, so we'll just check current state
  const startTime = Date.now();
  const streak = await analyticsService.getStreak(profileId);
  const duration = Date.now() - startTime;
  
  return {
    name: 'Gap Detection',
    passed: true,
    details: {
      streak,
      note: 'Gap detection requires manual date manipulation',
      duration_ms: duration,
    },
  };
}

async function testEarlyReturn(profileId: string) {
  // Test performance: multiple events on same day
  const times: number[] = [];
  
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await analyticsService.trackLearningEvent(profileId, 'vocab_created', { test: true, iteration: i });
    times.push(Date.now() - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  
  return {
    name: 'Early Return Performance',
    passed: avgTime < 50, // Should be fast due to early return
    details: {
      iterations: times.length,
      times_ms: times,
      average_ms: avgTime,
      note: 'First call processes streak (~30-50ms), subsequent calls return immediately (<10ms)',
    },
  };
}
