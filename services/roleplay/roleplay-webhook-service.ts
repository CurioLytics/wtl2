import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

class RoleplayWebhookService {
  async getBotResponse(
    scenario: RoleplayScenario, 
    messages: RoleplayMessage[], 
    sessionId: string,
    userPreferences: { name: string; english_level: string; style: string }
  ): Promise<string> {
    // Get only the last user message
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').slice(-1)[0];
    
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }
    
    const payload = {
      body: {
        query: {
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
    return data.message || data.output || 'No response received';
  }
}

export const roleplayWebhookService = new RoleplayWebhookService();