import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

/**
 * Service for handling real-time bot responses during roleplay conversations
 */
class RoleplayConversationService {
  // Store session keys to track which sessions have been initialized
  private sessionKeys = new Map<string, string>();

  /**
   * Generate a unique session key
   */
  private generateSessionKey(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `key_${timestamp}_${random}`;
  }

  async getBotResponse(
    scenario: RoleplayScenario,
    messages: RoleplayMessage[],
    sessionId: string,
    userPreferences: { name: string; english_level: string; style: string }
  ): Promise<{ response: string; suggested_answer?: string }> {
    // Get only the last user message
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1)[0];

    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // Check if this is the first message for this session
    const isFirstMessage = !this.sessionKeys.has(sessionId);

    let payload: any;

    if (isFirstMessage) {
      // First message: generate key and send full context
      const sessionKey = this.generateSessionKey();
      this.sessionKeys.set(sessionId, sessionKey);

      payload = {
        body: {
          convoId: sessionKey,
          query: {
            key: sessionKey,
            user: {
              name: userPreferences.name,
              english_level: userPreferences.english_level,
              style: userPreferences.style,
            },
            session_id: sessionId,
            title: scenario.name,
            level: scenario.level,
            ai_role: scenario.ai_role,
            partner_prompt: scenario.partner_prompt
          }
        },
        messages: [{
          role: 'user',
          content: lastUserMessage.content
        }]
      };
    } else {
      // Subsequent messages: only send user message and key
      const sessionKey = this.sessionKeys.get(sessionId)!;

      payload = {
        body: {
          convoId: sessionKey,
          query: {
            key: sessionKey
          }
        },
        messages: [{
          role: 'user',
          content: lastUserMessage.content
        }]
      };
    }

    const response = await fetch('/api/roleplay/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Bot response failed (${response.status}): ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Handle new response structure
    if (data.response) {
      // Check if data.response is itself an object with nested response (double-encoded)
      if (typeof data.response === 'object' && data.response.response) {
        return {
          response: data.response.response,
          suggested_answer: data.response.suggested_answer
        };
      }
      
      // Otherwise, use data.response directly as string
      return {
        response: data.response,
        suggested_answer: data.suggested_answer
      };
    }
    
    // Fallback to old structure
    return {
      response: data.message || data.output || 'No response received'
    };
  }

  /**
   * Clear session key when session ends (optional cleanup)
   */
  clearSession(sessionId: string): void {
    this.sessionKeys.delete(sessionId);
  }
}

export const roleplayConversationService = new RoleplayConversationService();