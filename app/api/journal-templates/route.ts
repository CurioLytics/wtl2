import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { journalTemplateService } from '@/services/journal/journal-template-service';

export async function GET() {
  try {
    const user = await authenticateUser();
    const templates = await journalTemplateService.getTemplatesByUserId(user.id);
    
    return NextResponse.json(templates);
  } catch (error) {
    return handleApiError(error);
  }
}