import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { vocabularyService } from '@/services/vocabulary/vocabulary-service';
import { vocabularySetService } from '@/services/vocabulary/vocabulary-set-service';

/**
 * GET /api/vocabulary
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

/**
 * POST /api/vocabulary
 * Create a new vocabulary set
 */
export async function POST(req: Request) {
  try {
    const user = await authenticateUser();
    const body = await parseRequestBody(req);
    
    const result = await vocabularySetService.createVocabularySet(user.id, body as any);
    
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}