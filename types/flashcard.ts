/**
 * Interface for flashcard back side content
 */
export interface FlashcardBack {
  definition: string;
  example: string;
  synonyms?: string[];
}

/**
 * Interface for individual flashcard data
 */
export interface Flashcard {
  word: string;
  back: FlashcardBack;
}

/**
 * Interface for the flashcard webhook response format
 */
export interface FlashcardWebhookResponse {
  output: Flashcard[];
}

/**
 * Complete flashcard webhook response (array of response items)
 */
export type FlashcardWebhookResponseArray = FlashcardWebhookResponse[];