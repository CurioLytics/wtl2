'use client';

import { RoleplayMessage, RoleplayScenario, RoleplayFeedback } from '@/types/roleplay';

/**
 * Service for generating AI feedback on roleplay conversations
 */
class RoleplayFeedbackService {
  /**
   * Generate feedback for a roleplay conversation
   * Calls external webhook to analyze conversation and return structured feedback
   */
  async generateFeedback(
    scenario: RoleplayScenario,
    messages: RoleplayMessage[],
    userPreferences?: { name?: string; english_level?: string; style?: string } | null
  ): Promise<RoleplayFeedback> {
    try {
      console.log('[FEEDBACK-SERVICE] Starting generateFeedback...');
      console.log('[FEEDBACK-SERVICE] Messages count:', messages.length);
      
      // Safe defaults if preferences are not provided
      const safePreferences = {
        name: userPreferences?.name || 'User',
        english_level: userPreferences?.english_level || 'intermediate',
        style: userPreferences?.style || 'conversational',
      };

      const payload = {
        body: {
          query: {
            user: {
              name: safePreferences.name,
              english_level: safePreferences.english_level,
              style: safePreferences.style,
            },
            title: scenario.name,
            level: scenario.level,
            ai_role: scenario.ai_role,
            partner_prompt: scenario.partner_prompt
          }
        },
        messages: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : scenario.ai_role,
          content: msg.content
        }))
      };

      console.log('[FEEDBACK-SERVICE] Calling /api/roleplay/feedback...');
      // Call our internal API route instead of the external webhook directly
      // This avoids exposing the webhook URL and handles the server-side env var access
      const response = await fetch('/api/roleplay/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[FEEDBACK-SERVICE] Response status:', response.status);
      
      if (!response.ok) {
        console.error('[FEEDBACK-SERVICE] Webhook returned error:', response.status);
        throw new Error(`Webhook returned ${response.status}`);
      }

      const data = await response.json();
      console.log('[FEEDBACK-SERVICE] Feedback data received successfully');

      // Flexible parsing - handle both old and new webhook formats
      const findFeedback = (obj: any): RoleplayFeedback | null => {
        // NEW FORMAT: { enhanced_version, grammar_details, output: {clarity, vocabulary, ideas} }
        if (obj?.enhanced_version && obj?.grammar_details && obj?.output) {
          return {
            enhanced_version: obj.enhanced_version,
            grammar_details: obj.grammar_details || [],
            output: {
              clarity: obj.output.clarity || '',
              vocabulary: obj.output.vocabulary || '',
              ideas: obj.output.ideas || ''
            }
          };
        }

        // OLD FORMAT: { output: {clarity, vocabulary, ideas, enhanced_version} }
        // Convert to new format
        if (obj?.output && (obj.output.clarity || obj.output.vocabulary || obj.output.ideas)) {
          return {
            enhanced_version: Array.isArray(obj.output.enhanced_version)
              ? obj.output.enhanced_version.join('\n\n')
              : (obj.output.enhanced_version || ''),
            grammar_details: obj.grammar_details || [],
            output: {
              clarity: obj.output.clarity || '',
              vocabulary: obj.output.vocabulary || '',
              ideas: obj.output.ideas || ''
            }
          };
        }

        // Search in nested fields
        if (obj?.response) {
          const result = findFeedback(obj.response);
          if (result) return result;
        }

        // Search in array elements
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const result = findFeedback(item);
            if (result) return result;
          }
        }

        return null;
      };

      const feedback = findFeedback(data);
      if (feedback) {
        return feedback;
      }

      throw new Error('Invalid feedback response structure');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to generate feedback');
    }
  }
}

export const roleplayFeedbackService = new RoleplayFeedbackService();
