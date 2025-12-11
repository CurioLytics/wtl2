import { createClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';
import { authenticateUser, parseRequestBody, createSuccessResponse, handleApiError, getUserPreferences } from '@/utils/api-helpers';

interface FlashcardGenerationRequest {
  highlights: string[];
  content: string;
  title?: string;
}

interface FlashcardResponse {
  word: string;
  back: {
    definition: string;
    example: string;
  };
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await authenticateUser();

    // Parse request body
    const { highlights, content, title } = await parseRequestBody<FlashcardGenerationRequest>(request);

    // Validate input
    if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No highlights provided' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user preferences (cached from profiles table)
    const userPreferences = await getUserPreferences(user.id);

    // Prepare webhook payload with consistent structure
    const webhookPayload = {
      user: {
        id: user.id,
        name: userPreferences.name,
        english_level: userPreferences.english_level,
        style: userPreferences.style,
      },
      highlights,
      context: content, // The improved/enhanced version of the journal
      title: title || 'Untitled Journal',
    };

    // Call external webhook
    const webhookUrl = process.env.NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Flashcard generation service not configured' },
        { status: 500 }
      );
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!webhookResponse.ok) {
      console.error('Webhook error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText
      });

      return NextResponse.json(
        { success: false, error: 'Failed to generate flashcards from highlights' },
        { status: 500 }
      );
    }

    const responseData = await webhookResponse.json();

    // Parse webhook response structure: [{ output: [{ word, back }] }]
    let flashcards: FlashcardResponse[] = [];

    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0]?.output) {
      flashcards = responseData[0].output;
    } else {
      console.error('Unexpected webhook response structure:', responseData);
      return NextResponse.json(
        { success: false, error: 'Invalid flashcard response structure' },
        { status: 500 }
      );
    }

    console.log('Webhook response:', JSON.stringify(responseData, null, 2));
    console.log('Extracted flashcards:', JSON.stringify(flashcards, null, 2));

    // Validate flashcard format where back is a string
    const validFlashcards = flashcards.filter((card: any) =>
      card &&
      typeof card.word === 'string' &&
      typeof card.back === 'string'
    ).map((card: any) => ({
      word: card.word,
      back: card.back
    }));

    return createSuccessResponse({
      flashcards: validFlashcards,
      totalGenerated: validFlashcards.length,
      originalHighlights: highlights.length
    }, `Generated ${validFlashcards.length} flashcards from ${highlights.length} highlights`);

  } catch (error) {
    console.error('Flashcard generation error:', error);
    return handleApiError(error);
  }
}