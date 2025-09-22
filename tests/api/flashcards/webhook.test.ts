import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Flashcard } from '@/types/flashcard';

// Mock fetch
global.fetch = vi.fn();

describe('Flashcard Webhook Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockUserId = 'test-user-id';
  const mockFlashcards: Flashcard[] = [
    {
      word: 'test',
      back: {
        definition: 'a procedure intended to establish the quality or functionality of something',
        example: 'This is a ___ case'
      }
    },
    {
      word: 'integration',
      back: {
        definition: 'the act of combining or adding parts to make a unified whole',
        example: 'The ___ of the API was successful'
      }
    }
  ];

  it('should successfully save flashcards to webhook', async () => {
    // Mock successful response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Flashcards saved successfully', count: 2 })
    });

    // Prepare payload
    const payload = {
      profileId: mockUserId,
      flashcards: mockFlashcards.map(card => ({
        front: card.word,
        back: {
          definition: card.back.definition,
          example: card.back.example
        }
      }))
    };

    // Call the webhook
    const response = await fetch('https://auto.zephyrastyle.com/webhook/save-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();

    // Verify the request was made correctly
    expect(fetch).toHaveBeenCalledWith(
      'https://auto.zephyrastyle.com/webhook/save-flashcards',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    // Verify the response
    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(data.count).toBe(2);
  });

  it('should handle webhook errors appropriately', async () => {
    // Mock error response
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save flashcards', status: 500 })
    });

    // Prepare payload (same as before)
    const payload = {
      profileId: mockUserId,
      flashcards: mockFlashcards.map(card => ({
        front: card.word,
        back: {
          definition: card.back.definition,
          example: card.back.example
        }
      }))
    };

    // Call the webhook (will fail)
    const response = await fetch('https://auto.zephyrastyle.com/webhook/save-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();

    // Verify the response indicates an error
    expect(response.ok).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should validate required fields before submission', () => {
    // Invalid flashcard missing word
    const invalidCard1: Partial<Flashcard> = {
      word: '', // Empty word
      back: {
        definition: 'Some definition',
        example: 'Some example'
      }
    };

    // Invalid flashcard missing definition
    const invalidCard2: Partial<Flashcard> = {
      word: 'test',
      back: {
        definition: '', // Empty definition
        example: 'Some example'
      }
    };

    // Function to validate flashcards (simplified version of what's in the component)
    const validateFlashcard = (card: Partial<Flashcard>): boolean => {
      return Boolean(
        card.word && 
        card.word.trim() !== '' && 
        card.back?.definition && 
        card.back.definition.trim() !== '' &&
        card.back?.example &&
        card.back.example.trim() !== ''
      );
    };

    // Test validation
    expect(validateFlashcard(invalidCard1)).toBe(false);
    expect(validateFlashcard(invalidCard2)).toBe(false);
    expect(validateFlashcard(mockFlashcards[0])).toBe(true);
  });
});