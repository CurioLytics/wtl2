import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { createClient } from '@/services/supabase/server';

/**
 * POST /api/vocabulary/words/[wordId]/star
 * Toggle star status for a vocabulary word
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  try {
    const user = await authenticateUser();
    const { wordId } = await params;

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
    }

    // Use server-side Supabase client with authenticated user
    const supabase = await createClient();

    // Get current starred status
    const { data: currentData } = await supabase
      .from('vocabulary')
      .select('is_starred')
      .eq('id', wordId)
      .single();

    const newStarredStatus = !currentData?.is_starred;

    // Update starred status
    const { error: updateError } = await supabase
      .from('vocabulary')
      .update({ is_starred: newStarredStatus })
      .eq('id', wordId);

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse({
      isStarred: newStarredStatus,
      wordId
    });
  } catch (error) {
    return handleApiError(error);
  }
}