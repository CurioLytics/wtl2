import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { journalService } from '@/services/journal/journal-service';

/**
 * POST /api/journal
 * Creates a new journal entry
 */
export async function POST(request: Request) {
  try {
    const user = await authenticateUser();

    const { title, content, templateId, entryDate } = await parseRequestBody<{
      title?: string;
      content: string;
      templateId?: string;
      entryDate?: string;
    }>(request);

    if (!content) {
      throw new Error('Content is required');
    }

    // Validate date format if provided
    let parsedDate: string;
    try {
      parsedDate = entryDate
        ? new Date(entryDate).toISOString()
        : new Date().toISOString();
    } catch {
      throw new Error('Invalid date format');
    }

    const result = await journalService.createJournal(user.id, {
      title: title || null,
      content,
      journal_date: parsedDate,
    });

    return createSuccessResponse(
      { id: result.id },
      'Journal entry created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}