import { NextRequest } from 'next/server';
import { authenticateUser, parseRequestBody, createSuccessResponse, handleApiError } from '@/utils/api-helpers';
import { saveOnboardingData } from '@/services/onboarding/onboarding-service';
import type { OnboardingData } from '@/types/onboarding';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser();
    const data = await parseRequestBody<OnboardingData>(request);

    await saveOnboardingData(user.id, data);

    return createSuccessResponse(
      { success: true },
      'Onboarding completed successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
