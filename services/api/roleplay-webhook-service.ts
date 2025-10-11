'use client';

import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

// Use our Next.js API route as a proxy to avoid CORS issues
const ROLEPLAY_WEBHOOK_PROXY = "/api/roleplay/webhook";

// Interface for the webhook request payload - updated to match required format with query wrapper
interface WebhookRequestPayload {
  query: {
    scenario_context: {
      scenario_context: string;
      title: string;
      difficulty: string;
      role1: string;
    };
    convo_id: string;
    messages: {
      role: 'user' | 'ai';
      content: string;
    }[];
  };
}

// Fallback responses when the webhook fails
const FALLBACK_RESPONSES = [
  "I understand you're looking for a response. How can I assist you further?",
  "Let's continue our conversation. What would you like to discuss next?",
  "I'm here to help with your language practice. What would you like to talk about?",
  "That's an interesting point. Could you tell me more about your thoughts on this?",
  "Let's keep practicing! What else would you like to say about this topic?",
  "I'd be happy to continue our conversation. What aspects of this topic interest you most?",
  "Thank you for sharing. Would you like to explore this topic further or try something else?",
  "I appreciate your engagement. How would you like to proceed with our conversation?"
];

// Interface for the webhook response
interface WebhookResponse {
  message?: string;
  output?: string; // Some webhook APIs return 'output' instead of 'message'
}

// Generate a UUID v4 for conversation ID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Service for interacting with the roleplay webhook
 */
class RoleplayWebhookService {
  // Store conversation IDs and their associated scenario data
  private conversationIds: Map<string, string> = new Map();
  private scenarioData: Map<string, {
    id: string;
    context: string;
    name: string;
    level: string;
    role1: string;
  }> = new Map();
  
  // Constructor to initialize conversation IDs from localStorage if available
  constructor() {
    // We use try-catch because this code runs in both client and server contexts
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear localStorage to ensure we don't use stale data (uncomment if needed)
        // localStorage.removeItem('roleplayConversationIds');
        
        const storedIds = localStorage.getItem('roleplayConversationIds');
        if (storedIds) {
          const idsObject = JSON.parse(storedIds);
          Object.entries(idsObject).forEach(([scenarioId, convoId]) => {
            this.conversationIds.set(scenarioId, convoId as string);
          });
          console.log('Restored conversation IDs from localStorage');
        }
      }
    } catch (e) {
      console.error('Failed to load conversation IDs from localStorage', e);
    }
  }
  
  /**
   * Get a bot response from the webhook
   * @param scenario The roleplay scenario
   * @param messages The message history
   * @returns A promise that resolves to the bot response
   */
  async getBotResponse(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
    try {
      // Create a request ID for debugging and potential idempotency
      const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Always create a new conversation ID for each session to avoid data mixing
      // This ensures we start fresh each time rather than potentially using stale data
      const convoId = generateUUID();
      this.conversationIds.set(scenario.id, convoId);
      console.log(`[${requestId}] Created new conversation ID: ${convoId} for scenario: ${scenario.id}`);
      
      // Store the current scenario data for reference
      this.scenarioData.set(scenario.id, {
        id: scenario.id,
        context: scenario.context,
        name: scenario.name,
        level: scenario.level,
        role1: scenario.role1
      });
      
      // Store in localStorage if available
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const idsObject = Object.fromEntries(this.conversationIds.entries());
          localStorage.setItem('roleplayConversationIds', JSON.stringify(idsObject));
        }
      } catch (e) {
        console.error('Failed to save conversation ID to localStorage', e);
      }
      
      // Log detailed scenario data for debugging
      console.log(`[${requestId}] Scenario data used for payload:`, {
        id: scenario.id,
        name: scenario.name,
        context: scenario.context,
        level: scenario.level,
        topic: scenario.topic
      });
      
      // Prepare the webhook payload with the required nested query structure
      const payload = {
        query: {
          scenario_context: {
            scenario_context: scenario.context,
            title: scenario.name,  // Using 'name' instead of 'title'
            difficulty: scenario.level.toLowerCase(), // Using 'level' instead of 'difficulty'
            role1: scenario.role1 // Add role1 field
          },
          convo_id: convoId,
          messages: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'ai',
            content: msg.content
          }))
        }
      };
      
      console.log(`[${requestId}] Sending webhook request:`, payload);
      
      // Cast the payload to the interface type
      const typedPayload = payload as WebhookRequestPayload;
      
      // Set up the request with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn(`[${requestId}] Request timed out after 30 seconds`);
      }, 30000); // 30-second timeout
      
      // Make the webhook request with retry logic
      let retryCount = 0;
      const maxRetries = 2;
      let response;
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch(ROLEPLAY_WEBHOOK_PROXY, {
            method: 'POST',  // We still use POST to our proxy, which will convert it to GET
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': `${requestId}-try-${retryCount}`,
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(typedPayload),
            signal: controller.signal
          });
          
          // If successful, break out of retry loop
          break;
        } catch (err) {
          // Only retry network errors, not aborts or other errors
          if (err instanceof Error && err.name !== 'AbortError' && retryCount < maxRetries) {
            retryCount++;
            console.log(`[${requestId}] Retrying request (${retryCount}/${maxRetries})`);
            // Exponential backoff: 1s, 2s
            await new Promise(r => setTimeout(r, retryCount * 1000));
          } else {
            throw err;
          }
        }
      }
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Check if we have a response
      if (!response) {
        throw new Error('No response received from webhook after retries');
      }

      // Check if the request was successful
      if (!response.ok) {
        console.error(`[${requestId}] Webhook error:`, response.status, response.statusText);
        
        // Attempt to parse error response
        try {
          const errorData = await response.json();
          console.error(`[${requestId}] Error details:`, errorData);
        } catch (e) {
          // JSON parsing failed, just log the status
        }
        
        // For 404 errors, provide a more helpful message
        if (response.status === 404) {
          throw new Error(`The roleplay service is currently unavailable. Please try again later or contact support if the issue persists.`);
        } else {
          throw new Error(`Webhook request failed with status ${response.status}`);
        }
      }
      
      // Parse the response (handling potential empty or non-JSON responses)
      let responseData: WebhookResponse;
      
      try {
        responseData = await response.json();
        console.log(`[${requestId}] Webhook response:`, responseData);
      } catch (e) {
        console.error(`[${requestId}] Failed to parse response as JSON:`, e);
        
        // Use a default response if parsing fails
        responseData = {
          message: "I'm ready to assist with your conversation. How can I help you today?"
        };
      }
      
      // Check for either 'message' or 'output' property in the response
      if (responseData.message) {
        return responseData.message;
      } else if (responseData.output) {
        // Use 'output' if 'message' is not available
        return responseData.output;
      } else {
        console.error(`[${requestId}] Invalid response format:`, responseData);
        
        // Use a random fallback response when no valid response property is found
        const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
        return FALLBACK_RESPONSES[randomIndex];
      }
    } catch (error: unknown) {
      console.error('Error getting bot response:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // For other errors, use a fallback response
      console.warn(`[${Date.now()}] Using fallback response due to error:`, error);
      const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
      return FALLBACK_RESPONSES[randomIndex];
    }
  }
}

export const roleplayWebhookService = new RoleplayWebhookService();
