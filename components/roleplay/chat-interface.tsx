'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { VoiceInputButton } from './voice-input-button';
import { FeedbackLoadingScreen } from './feedback-loading-screen';
import { SharedChatHeader } from './shared-chat-header';
import { useSharedChatLogic, getClosingMessage } from './shared-chat-logic';
import { useTTS } from '@/hooks/roleplay/use-tts';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import styles from './roleplay.module.css';

interface ChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function ChatInterface({ scenario }: ChatInterfaceProps) {
  const { speak, stop, isPlaying } = useTTS();
  const { state, actions, refs } = useSharedChatLogic(scenario);
  const { messages, finishing, error, hasUserMessages } = state;
  const { addMessage, handleFinish, handleExit, detectFinishIntent, getBotResponse } = actions;
  const { autoFinishScheduled } = refs;

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);



  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSpeakToggle = (messageId: string, text: string) => {
    if (isPlaying(messageId)) {
      stop();
    } else {
      speak(text, messageId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInputValue('');
    setIsLoading(true);

    // Check if user wants to finish
    const shouldAutoFinish = detectFinishIntent(text);

    try {
      // If user wants to finish, show a closing message instead of calling webhook
      if (shouldAutoFinish && !autoFinishScheduled.current) {
        autoFinishScheduled.current = true;
        
        const randomClosing = getClosingMessage();
        
        const botMsg: RoleplayMessage = {
          id: `bot-${Date.now()}`,
          content: randomClosing,
          sender: 'bot',
          timestamp: Date.now(),
        };
        addMessage(botMsg);
        setIsLoading(false);

        // Auto-play closing message
        setTimeout(() => {
          speak(randomClosing, botMsg.id);
        }, 300);

        // Schedule auto-finish
        setTimeout(() => {
          handleFinish();
        }, 2000);
        
        return; // Exit early, don't call webhook
      }

      // Normal flow: call webhook for bot response
      const botResponseData = await getBotResponse(userMsg);
      
      // Safety check: if response looks like JSON string, parse it
      let actualResponse = botResponseData.response;
      let actualSuggestedAnswer = botResponseData.suggested_answer;
      
      if (typeof actualResponse === 'string' && actualResponse.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(actualResponse);
          if (parsed.response) {
            actualResponse = parsed.response;
            actualSuggestedAnswer = parsed.suggested_answer;
          }
        } catch (e) {
          // Keep original if parsing fails
        }
      }
      
      const botMsg: RoleplayMessage = {
        id: `bot-${Date.now()}`,
        content: actualResponse,
        sender: 'bot',
        timestamp: Date.now(),
        suggested_answer: actualSuggestedAnswer,
      };
      
      addMessage(botMsg);

      // Auto-play bot response
      setTimeout(() => {
        speak(actualResponse, botMsg.id);
      }, 300);
    } catch (error: any) {
      addMessage({
        id: `err-${Date.now()}`,
        content: `Error: ${error?.message}`,
        sender: 'bot',
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    // Append to existing input value with space
    setInputValue(prev => prev ? `${prev} ${text}` : text);
  };

  return (
    <>
      <FeedbackLoadingScreen isVisible={finishing} colorScheme="blue" />
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
        <SharedChatHeader
          scenario={scenario}
          hasUserMessages={hasUserMessages}
          finishing={finishing}
          messagesLength={messages.length}
          onFinish={handleFinish}
          onExit={handleExit}
        />

        {/* Chat */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                roleName={m.sender === 'bot' ? scenario.ai_role : 'You'}
                onSpeakToggle={handleSpeakToggle}
                isPlaying={isPlaying(m.id)}
              />
            ))
          }

          {
            isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                <div className="w-6 h-6 rounded-full bg-[var(--primary-blue-lighter)] flex items-center justify-center text-[var(--primary)] text-xs font-medium">
                  {scenario.ai_role[0].toUpperCase()}
                </div>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )
          }

          <div ref={endRef} />
        </div >

        {/* Error */}
        {
          error && (
            <div className="border-t bg-red-50 text-red-700 text-sm p-3 border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )
        }

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || finishing}
            className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-gray-300 outline-none"
          />

          {/* Voice Input Button */}
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            disabled={isLoading || finishing}
          />

          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading || finishing}
            className="bg-gray-900 hover:bg-gray-800 rounded-full w-10 h-10 p-0 text-white flex items-center justify-center"
          >
            →
          </Button>
        </form>
      </div>
    </>
  );
}
