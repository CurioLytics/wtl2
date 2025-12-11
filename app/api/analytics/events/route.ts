import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { analyticsService } from '@/services/analytics-service';

/**
 * GET /api/analytics/events
 * Get comprehensive analytics data for progress page
 * 
 * Query params:
 * - startDate: ISO date string (default: 7 days ago)
 * - endDate: ISO date string (default: today)
 * - includeToday: boolean (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser();
    
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const timezoneOffsetParam = searchParams.get('timezoneOffset');
    const includeToday = searchParams.get('includeToday') !== 'false';

    // Default to last 7 days
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timezoneOffset = timezoneOffsetParam ? parseInt(timezoneOffsetParam) : undefined;

    const summary = await analyticsService.getAnalyticsSummary(
      user.id,
      startDate,
      endDate,
      timezoneOffset
    );

    return createSuccessResponse(summary);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/analytics/events/daily-goal
 * Get today's goal completion status
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser();
    const { date, timezoneOffset } = await request.json();
    
    const targetDate = date ? new Date(date) : new Date();
    const dailyGoal = await analyticsService.getDailyGoalStatus(
      user.id, 
      targetDate,
      timezoneOffset
    );

    return createSuccessResponse({ dailyGoal });
  } catch (error) {
    return handleApiError(error);
  }
}
