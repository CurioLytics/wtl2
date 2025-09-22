import { NextResponse } from 'next/server';
import { Flashcard } from '@/types/flashcard';

export async function POST(request: Request) {
  try {
    // Parse the request body to get the flashcards
    const body = await request.json();
    const { flashcards } = body as { flashcards: Flashcard[] };
    
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json({ error: 'No valid flashcards provided' }, { status: 400 });
    }
    
    // In a real implementation, you would save the flashcards to your database here
    // For now, we'll just return a success message
    
    // For demonstration purposes, log the flashcards
    console.log('Saving flashcards:', flashcards);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Flashcards saved successfully',
      count: flashcards.length
    });
    
  } catch (error) {
    console.error('Error saving flashcards:', error);
    return NextResponse.json({ error: 'Failed to save flashcards' }, { status: 500 });
  }
}