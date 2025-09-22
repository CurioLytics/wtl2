/**
 * Generates placeholder feedback when the API call fails
 * This provides a fallback experience rather than just showing an error
 */
export function generatePlaceholderFeedback(content: string, title?: string) {
  // Create a basic title if none provided
  const entryTitle = title || 'Your Journal Entry';
  
  // Extract first sentence or first 100 chars for summary
  let basicSummary = '';
  const firstPeriodIndex = content.indexOf('.');
  if (firstPeriodIndex > 0 && firstPeriodIndex < 150) {
    basicSummary = content.substring(0, firstPeriodIndex + 1);
  } else {
    basicSummary = content.substring(0, Math.min(100, content.length)) + '...';
  }
  
  return {
    title: entryTitle,
    summary: `Basic summary: ${basicSummary}\n\nWe couldn't generate a detailed summary for your journal entry at this time.`,
    improvedVersion: content,
    originalVersion: content, // Add the original content
    vocabSuggestions: [
      {
        word: 'feedback',
        meaning: 'Information about reactions to a product, a person\'s performance of a task, etc. which is used as a basis for improvement.',
        example: 'The team provided feedback on the new design.'
      }
    ]
  };
}