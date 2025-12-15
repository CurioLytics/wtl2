'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './message-bubble';
import { FeedbackLoadingScreen } from './feedback-loading-screen';
import { SharedChatHeader } from './shared-chat-header';
import { VoiceControls } from './voice-controls';
import { CountdownOverlay } from './countdown-overlay';
import { useSharedChatLogic, getClosingMessage } from './shared-chat-logic';
import { useVoiceMode } from '@/hooks/roleplay/use-voice-mode';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

interface VoiceModeChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function VoiceModeChatInterface({ scenario }: VoiceModeChatInterfaceProps) {
  const { state, actions, refs } = useSharedChatLogic(scenario);
  const { messages, finishing, error, hasUserMessages } = state;
  const { addMessage, handleFinish, handleExit, detectFinishIntent, getBotResponse } = actions;
  const { autoFinishScheduled } = refs;

  const [backupInput, setBackupInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);

  const endRef = useRef<HTMLDivElement>(null);
  const isSessionFinished = useRef(false);

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: Date.now(),
    };

    addMessage(userMsg);

    const shouldAutoFinish = detectFinishIntent(text);

    try {
      if (shouldAutoFinish && !isSessionFinished.current && !autoFinishScheduled.current) {
        autoFinishScheduled.current = true;
        const randomClosing = getClosingMessage();
        const botMsg: RoleplayMessage = {
          id: `bot-${Date.now()}`,
          content: randomClosing,
          sender: 'bot',
          timestamp: Date.now(),
        };
        addMessage(botMsg);

        if (!isSessionFinished.current) {
          playBotMessage(randomClosing, botMsg.id);
        }

        setTimeout(() => handleFinish(), 5000);
        return;
      }

      const botResponseData = await getBotResponse(userMsg);
      if (isSessionFinished.current) return;

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

      if (!isSessionFinished.current) {
        playBotMessage(actualResponse, botMsg.id);
      }
    } catch (error: any) {
      if (isSessionFinished.current) return;

      const errMsg: RoleplayMessage = {
        id: `err-${Date.now()}`,
        content: `Error: ${error?.message}`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      addMessage(errMsg);
      if (!isSessionFinished.current) {
        playBotMessage(errMsg.content, errMsg.id);
      }
    }
  };

  const {
    voiceState,
    error: voiceError,
    interimText,
    playingMessageId,
    playBotMessage,
    stopBotSpeaking,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceMode({ onUserMessage: handleUserMessage });

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
      if (voiceState === 'idle') startListening();
    }
  }, [countdown, startListening, voiceState]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMicClick = () => {
    if (isSessionFinished.current) return;

    if (voiceState === 'listening' || voiceState === 'user-speaking') {
      stopListening();
    } else if (voiceState === 'bot-speaking') {
      stopBotSpeaking();
    } else if (voiceState === 'idle') {
      startListening();
    }
  };

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = backupInput.trim();
    if (!text) return;
    handleUserMessage(text);
    setBackupInput('');
  };

  const wrappedHandleFinish = async () => {
    if (isSessionFinished.current) return;
    isSessionFinished.current = true;
    stopListening();
    stopBotSpeaking();
    await handleFinish();
  };

  return (
    <>
      <CountdownOverlay countdown={countdown} />
      <FeedbackLoadingScreen isVisible={finishing} colorScheme="purple" />

      <div className="flex flex-col h-[100dvh] max-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <SharedChatHeader
          scenario={scenario}
          hasUserMessages={hasUserMessages}
          finishing={finishing}
          messagesLength={messages.length}
          onFinish={wrappedHandleFinish}
          onExit={handleExit}
          theme="purple"
        />

        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              roleName={m.sender === 'bot' ? scenario.ai_role : 'You'}
              onSpeakToggle={(msgId, text) => {
                if (playingMessageId === msgId) {
                  stopBotSpeaking();
                } else {
                  playBotMessage(text, msgId);
                }
              }}
              isPlaying={playingMessageId === m.id}
            />
          ))}
          <div ref={endRef} />
        </div>

        <VoiceControls
          voiceState={voiceState}
          interimText={interimText}
          showTextInput={showTextInput}
          backupInput={backupInput}
          disabled={voiceState === 'thinking' || finishing || isSessionFinished.current}
          onMicClick={handleMicClick}
          onToggleInput={() => setShowTextInput(!showTextInput)}
          onTextChange={setBackupInput}
          onTextSubmit={handleBackupSubmit}
        />

        {(error || voiceError) && (
          <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <strong>Error:</strong> {error || voiceError}
          </div>
        )}

        {!isSupported && (
          <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            Voice mode không được hỗ trợ trên trình duyệt này. Vui lòng dùng Chrome hoặc Edge.
          </div>
        )}
      </div>
    </>
  );
}

