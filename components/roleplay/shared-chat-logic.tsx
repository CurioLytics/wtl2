'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { roleplayConversationService } from '@/services/roleplay/roleplay-conversation-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

export interface SharedChatState {
  sessionId: string;
  messages: RoleplayMessage[];
  finishing: boolean;
  error: string | null;
  hasUserMessages: boolean;
  messagesRef: React.MutableRefObject<RoleplayMessage[]>;
  userPreferences: {
    name: string;
    english_level: string;
    style: string;
  };
}

export interface SharedChatActions {
  addMessage: (msg: RoleplayMessage) => void;
  handleFinish: () => Promise<void>;
  handleExit: () => void;
  detectFinishIntent: (message: string) => boolean;
  getBotResponse: (userMsg: RoleplayMessage) => Promise<string>;
}

export function useSharedChatLogic(scenario: RoleplayScenario) {
  const router = useRouter();
  const { user, userPreferences: cachedPreferences } = useAuth();

  const [sessionId] = useState(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${timestamp}_${random}`;
  });

  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userPreferences = {
    name: cachedPreferences?.name || 'User',
    english_level: cachedPreferences?.english_level || 'intermediate',
    style: cachedPreferences?.style || 'conversational',
  };

  const autoFinishScheduled = useRef(false);
  const messagesRef = useRef<RoleplayMessage[]>([]);

  const hasUserMessages = messages.filter(msg => msg.sender === 'user').length > 0;

  const addMessage = useCallback((msg: RoleplayMessage) => {
    setMessages((prev) => {
      const updated = [...prev, msg];
      messagesRef.current = updated;
      return updated;
    });
  }, []);

  const detectFinishIntent = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    const finishPhrases = [
      'finish the conversation',
      'finish talking',
      'thank you for the chat',
      'goodbye',
      'good bye',
      'talk to you later',
      'bye',
      'see you later',
      'see you',
      'gotta go',
      'have to go',
      'need to go'
    ];
    
    return finishPhrases.some(phrase => lowerMessage.includes(phrase));
  }, []);

  const getBotResponse = useCallback(async (userMsg: RoleplayMessage): Promise<string> => {
    return await roleplayConversationService.getBotResponse(
      scenario,
      [...messagesRef.current, userMsg],
      sessionId,
      userPreferences
    );
  }, [scenario, sessionId, userPreferences]);

  const handleFinish = useCallback(async () => {
    if (finishing) return;
    
    setFinishing(true);
    setError(null);

    try {
      const currentMessages = messagesRef.current;

      if (!user?.id || currentMessages.length <= 1) {
        throw new Error('Unable to save session. Please try again.');
      }

      const completedSessionId = await roleplaySessionService.completeSession(
        user.id,
        scenario,
        currentMessages,
        userPreferences
      );

      router.replace(`/roleplay/summary/${completedSessionId}`);
    } catch (error: any) {
      console.error('Error in handleFinish:', error);
      setError(error?.message || 'Error saving session. Please try again.');
      setFinishing(false);
    }
  }, [finishing, user?.id, scenario, userPreferences, router]);

  const handleExit = useCallback(() => {
    router.push(`/roleplay/${scenario.id}`);
  }, [router, scenario.id]);

  // Prevent navigation with confirmation when there are user messages
  useEffect(() => {
    if (!hasUserMessages) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = () => {
      if (hasUserMessages) {
        const confirmLeave = window.confirm(
          'Bạn đã có tin nhắn trong cuộc trò chuyện này. Nếu thoát bây giờ, cuộc trò chuyện sẽ không được lưu lại. Bạn có chắc muốn thoát?'
        );

        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUserMessages]);

  return {
    state: {
      sessionId,
      messages,
      finishing,
      error,
      hasUserMessages,
      messagesRef,
      userPreferences,
    },
    actions: {
      addMessage,
      handleFinish,
      handleExit,
      detectFinishIntent,
      getBotResponse,
    },
    refs: {
      autoFinishScheduled,
    },
  };
}

export function getClosingMessage(): string {
  const closingMessages = [
    "Wrapping up the conversation...",
    "Finishing the conversation...",
    "Thank you for practicing with me today!",
    "Great job! Let me prepare your feedback...",
    "Excellent work! Preparing your session summary..."
  ];
  return closingMessages[Math.floor(Math.random() * closingMessages.length)];
}
