import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { vocabularyService } from '@/services/vocabulary/vocabulary-service';

/**
 * GET /api/flashcards (legacy endpoint - will be migrated to /api/vocabulary)
 * Get vocabulary sets for the authenticated user
 */
export async function GET() {
  try {
    const user = await authenticateUser();
    const vocabularySets = await vocabularyService.getVocabularySets(user.id);
    
    return createSuccessResponse({ vocabularySets });
  } catch (error) {
    return handleApiError(error);
  }
}