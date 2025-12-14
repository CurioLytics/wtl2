import { 
  JournalFeedbackResponse, 
  FeedbackServiceResult,
  ServiceError 
} from '@/types/journal-feedback';

class JournalFeedbackService {
  /**
   * Get feedback for journal content with proper error handling
   */
  async getFeedback(content: string, title?: string): Promise<FeedbackServiceResult> {
    try {
      // Validation
      if (!content.trim()) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Journal content cannot be empty'
          }
        };
      }

      const response = await fetch('/api/journal-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: title || '' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: errorData.error || `Request failed with status: ${response.status}`
          }
        };
      }

      const data: JournalFeedbackResponse = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getFeedback instead which returns FeedbackServiceResult
   */
  async getLegacyFeedback(content: string, title?: string): Promise<JournalFeedbackResponse> {
    const result = await this.getFeedback(content, title);
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to get feedback');
    }
    
    return result.data;
  }
}

export const journalFeedbackService = new JournalFeedbackService();