import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError } from '@/utils/api-helpers';
import { journalTemplateService } from '@/services/journal/journal-template-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser();
    const { id } = await params;
    const template = await journalTemplateService.getTemplateByName(user.id, id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    return handleApiError(error);
  }
}