import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { analyticsService } from '@/services/analytics/analytics-service';

/**
 * GET /api/analytics/daily-goal
 * Get today's goal completion status (not affected by date filters)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser();
    
    const searchParams = request.nextUrl.searchParams;
    const timezoneOffsetParam = searchParams.get('timezoneOffset');
    const timezoneOffset = timezoneOffsetParam ? parseInt(timezoneOffsetParam) : undefined;

    const dailyGoal = await analyticsService.getDailyGoalStatus(
      user.id,
      new Date(), // Always today
      timezoneOffset
    );

    return createSuccessResponse(dailyGoal);
  } catch (error) {
    return handleApiError(error);
  }
}
