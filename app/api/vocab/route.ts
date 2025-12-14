import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { vocabService } from '@/services/vocabulary/vocab-service';

/**
 * GET /api/vocab
 * Get vocabulary collections for the authenticated user
 */
export async function GET() {
  try {
    const user = await authenticateUser();
    const collections = await vocabService.getVocabCollections(user.id);
    
    return createSuccessResponse({ collections });
  } catch (error) {
    return handleApiError(error);
  }
}
