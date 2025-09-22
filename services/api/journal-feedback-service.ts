import { JournalFeedback, JournalFeedbackContent } from '@/types/journal';

/**
 * Service for getting feedback on journal entries
 */
class JournalFeedbackService {
  /**
   * Get feedback for a journal entry
   * 
   * @param content The journal content to get feedback for
   * @param title Optional title of the journal
   * @returns Promise with feedback data
   */
  async getFeedback(content: string, title?: string): Promise<JournalFeedback> {
    try {
      // Validate input before sending
      const validationError = this.validateContent(content);
      if (validationError) {
        throw new Error(validationError);
      }
      
      // Create the payload
      const payload = {
        content,
        title: title || '',
      };
      
      // Log request for debugging (truncate content for readability)
      const truncatedPayload = {
        ...payload,
        content: payload.content.length > 100 
          ? payload.content.substring(0, 100) + '...' 
          : payload.content
      };
      console.log('Sending journal feedback request:', truncatedPayload);
      
      // Use our server-side API route instead of calling external API directly
      // This avoids CORS issues and provides better error handling
      const response = await fetch('/api/journal-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Log response status for debugging
      console.log('Journal feedback API response status:', response.status);
      
      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json().catch(() => {
          console.log('Could not parse error response as JSON');
          return {};
        });
        console.error('API Error response:', errorData);
        const errorMessage = errorData.error || `Failed to get journal feedback: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // Get the response data directly as JSON
      let feedback: JournalFeedback;
      try {
        feedback = await response.json();
        console.log('API response received successfully');
      } catch (parseError) {
        console.error('Failed to parse API response as JSON:', parseError);
        throw new Error('Invalid response format from feedback API');
      }
      
      // Validate response format with better error handling
      if (!feedback) {
        console.error('Empty feedback data received');
        throw new Error('Empty response received from feedback API');
      }
      
      // Log the structure for debugging
      console.log('Feedback data structure:', {
        hasTitle: Boolean(feedback.title),
        hasSummary: Boolean(feedback.summary),
        hasImprovedVersion: Boolean(feedback.improvedVersion),
        hasVocabSuggestions: Boolean(feedback.vocabSuggestions),
        vocabCount: Array.isArray(feedback.vocabSuggestions) ? feedback.vocabSuggestions.length : 'not an array',
        debugKeys: Object.keys(feedback)
      });
      
      // Check if we have at least some expected fields
      if (!feedback.title && !feedback.summary && !feedback.improvedVersion && 
          (!feedback.vocabSuggestions || !Array.isArray(feedback.vocabSuggestions))) {
        console.warn('Feedback data is missing expected structure, using fallback with original content');
        
        // Return fallback with original content
        return {
          title: title || 'Journal Entry',
          summary: 'We could not generate a summary at this time due to a technical issue.',
          improvedVersion: content,
          originalVersion: content, // Always include the original content
          vocabSuggestions: []
        };
      }
      
      // Create a complete feedback object with defaults for any missing fields
      const completeFeedback: JournalFeedback = {
        title: feedback.title || title || 'Journal Entry',
        summary: feedback.summary || 'No summary available',
        improvedVersion: feedback.improvedVersion || content,
        originalVersion: feedback.originalVersion || content, // Add original content
        vocabSuggestions: Array.isArray(feedback.vocabSuggestions) 
          ? feedback.vocabSuggestions
              .filter(item => item && (typeof item === 'string' || (typeof item === 'object' && item !== null)))
              .map(item => {
                if (typeof item === 'string') {
                  return {
                    word: item,
                    meaning: 'No meaning provided',
                    example: ''
                  };
                } else {
                  // Cast to any to handle diverse property names
                  const vocabItem = item as any;
                  return {
                    word: vocabItem.word || vocabItem.term || vocabItem.name || 'Unknown word',
                    meaning: vocabItem.meaning || vocabItem.definition || vocabItem.desc || 'No meaning provided',
                    example: vocabItem.example || vocabItem.usage || vocabItem.sentence || ''
                  };
                }
              })
          : []
      };
      
      console.log('Feedback data processed successfully:', {
        titleLength: completeFeedback.title.length,
        summaryLength: completeFeedback.summary.length,
        improvedVersionLength: completeFeedback.improvedVersion.length,
        originalVersionLength: completeFeedback.originalVersion.length,
        vocabCount: completeFeedback.vocabSuggestions.length
      });
      
      return completeFeedback;
    } catch (error) {
      console.error('Error getting journal feedback:', error);
      throw error;
    }
  }
  
  // Helper method to check if the content is too large or otherwise problematic
  private validateContent(content: string): string | null {
    if (!content || content.trim() === '') {
      return 'Journal content cannot be empty';
    }
    
    if (content.length > 10000) {
      return 'Journal content is too long (max 10,000 characters)';
    }
    
    return null;
  }
}

export const journalFeedbackService = new JournalFeedbackService();