'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { MessageBubble } from './message-bubble';
import { FeedbackLoadingScreen } from './feedback-loading-screen';
import { useVoiceMode } from '@/hooks/roleplay/use-voice-mode';
import { roleplayConversationService } from '@/services/roleplay/roleplay-conversation-service';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import { Mic, MicOff, Send, Keyboard, Lightbulb } from 'lucide-react';

interface VoiceModeChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function VoiceModeChatInterface({ scenario }: VoiceModeChatInterfaceProps) {
  const router = useRouter();
  const { user, userPreferences: cachedPreferences } = useAuth();

  // Generate unique session ID for this conversation
  const [sessionId] = useState(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${timestamp}_${random}`;
  });

  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [backupInput, setBackupInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use cached preferences from auth context with defaults
  const userPreferences = {
    name: cachedPreferences?.name || 'User',
    english_level: cachedPreferences?.english_level || 'intermediate',
    style: cachedPreferences?.style || 'conversational',
  };

  const endRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const isSessionFinished = useRef(false);
  const autoFinishScheduled = useRef(false);
  const messagesRef = useRef<RoleplayMessage[]>([]);

  const hasUserMessages = messages.filter(msg => msg.sender === 'user').length > 0;

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: Date.now(),
    };

    addMessage(userMsg);

    // Check if user wants to finish
    const shouldAutoFinish = detectFinishIntent(text);
    console.log('[VOICE-AUTO-FINISH] User message:', text);
    console.log('[VOICE-AUTO-FINISH] Should auto-finish:', shouldAutoFinish);

    try {
      // If user wants to finish, show a closing message instead of calling webhook
      if (shouldAutoFinish && !isSessionFinished.current && !autoFinishScheduled.current) {
        autoFinishScheduled.current = true;
        console.log('[VOICE-AUTO-FINISH] User wants to finish, adding closing message...');
        
        // Random closing messages
        const closingMessages = [
          "Wrapping up the conversation...",
          "Finishing the conversation...",
          "Thank you for practicing with me today!",
          "Great job! Let me prepare your feedback...",
          "Excellent work! Preparing your session summary..."
        ];
        
        const randomClosing = closingMessages[Math.floor(Math.random() * closingMessages.length)];
        
        const botMsg: RoleplayMessage = {
          id: `bot-${Date.now()}`,
          content: randomClosing,
          sender: 'bot',
          timestamp: Date.now(),
        };
        addMessage(botMsg);

        // Auto-play closing message
        if (!isSessionFinished.current) {
          playBotMessage(randomClosing, botMsg.id);
        }

        // Schedule auto-finish after audio plays
        console.log('[VOICE-AUTO-FINISH] Scheduling auto-finish after audio completes...');
        setTimeout(() => {
          console.log('[VOICE-AUTO-FINISH] Initial delay complete, executing handleFinish...');
          handleFinish();
        }, 5000); // Wait 5 seconds to allow audio to play
        
        return; // Exit early, don't call webhook
      }

      // Normal flow: call webhook for bot response
      const reply = await roleplayConversationService.getBotResponse(
        scenario,
        [...messages, userMsg],
        sessionId,
        userPreferences
      );

      // Check if session was finished while waiting for response
      if (isSessionFinished.current) return;

      const botMsg: RoleplayMessage = {
        id: `bot-${Date.now()}`,
        content: reply,
        sender: 'bot',
        timestamp: Date.now(),
      };
      addMessage(botMsg);

      // Auto-play and auto-activate next
      if (!isSessionFinished.current) {
        playBotMessage(reply, botMsg.id);
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
      // Don't play error message if session is finished
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
  } = useVoiceMode({
    onUserMessage: handleUserMessage,
  });

  const addMessage = (msg: RoleplayMessage) =>
    setMessages((prev) => {
      const updated = [...prev, msg];
      messagesRef.current = updated;
      return updated;
    });

  // Detect if user wants to finish the conversation
  const detectFinishIntent = (message: string): boolean => {
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
    
    const result = finishPhrases.some(phrase => lowerMessage.includes(phrase));
    console.log('[VOICE-DETECT-FINISH] Checking message:', message);
    console.log('[VOICE-DETECT-FINISH] Lower message:', lowerMessage);
    console.log('[VOICE-DETECT-FINISH] Result:', result);
    return result;
  };

  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(3);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished
      setCountdown(null);
      // Start listening automatically only if not already speaking/listening
      if (voiceState === 'idle') {
        startListening();
      }
    }
  }, [countdown, startListening, voiceState]);

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent navigation/reload when there are user messages
  useEffect(() => {
    if (!hasUserMessages) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e: PopStateEvent) => {
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

  const handleMicClick = () => {
    // Don't allow mic interaction if session is finished
    if (isSessionFinished.current) return;

    if (voiceState === 'listening' || voiceState === 'user-speaking') {
      // Stop recording
      stopListening();
    } else if (voiceState === 'bot-speaking') {
      // Stop bot speaking, don't start recording automatically
      stopBotSpeaking();
    } else if (voiceState === 'idle') {
      // Only start listening if truly idle (not speaking or thinking)
      startListening();
    }
    // If thinking, do nothing (button is disabled anyway)
  };

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = backupInput.trim();
    if (!text) return;

    handleUserMessage(text);
    setBackupInput('');
  };

  const handleFinish = async () => {
    console.log('[VOICE-HANDLE-FINISH] Starting handleFinish...');
    console.log('[VOICE-HANDLE-FINISH] User ID:', user?.id);
    console.log('[VOICE-HANDLE-FINISH] Messages count:', messages.length);
    console.log('[VOICE-HANDLE-FINISH] isSessionFinished:', isSessionFinished.current);
    console.log('[VOICE-HANDLE-FINISH] finishing state:', finishing);
    
    // Prevent duplicate calls
    if (isSessionFinished.current || finishing) {
      console.log('[VOICE-HANDLE-FINISH] Already finishing, skipping duplicate call');
      return;
    }
    
    // Mark session as finished to prevent any further processing
    isSessionFinished.current = true;

    // Stop all ongoing actions first
    stopListening();
    stopBotSpeaking();

    setFinishing(true);
    setError(null);

    try {
      // Get current messages from ref (always has latest value)
      const currentMessages = messagesRef.current;

      if (!user?.id || currentMessages.length <= 1) {
        console.error('[VOICE-HANDLE-FINISH] Validation failed - insufficient data');
        console.error('[VOICE-HANDLE-FINISH] Messages length:', currentMessages.length);
        throw new Error('Unable to save session. Please try again.');
      }

      console.log('[VOICE-HANDLE-FINISH] Calling completeSession with', currentMessages.length, 'messages');
      const sessionId = await roleplaySessionService.completeSession(
        user.id,
        scenario,
        currentMessages,
        userPreferences
      );

      console.log('[VOICE-HANDLE-FINISH] Session completed, ID:', sessionId);
      console.log('[VOICE-HANDLE-FINISH] Redirecting to summary page...');
      // Keep loading screen visible during navigation
      router.replace(`/roleplay/summary/${sessionId}`);
      // Don't set finishing to false - let the navigation happen with loading screen visible
    } catch (error: any) {
      console.error('[VOICE-HANDLE-FINISH] Error:', error);
      setError(error?.message || 'Error saving session. Please try again.');
      // Reset the flag if there's an error so user can try again
      isSessionFinished.current = false;
      setFinishing(false); // Only hide loading on error
    }
  };

  const handleExit = () => {
    router.push(`/roleplay/${scenario.id}`);
  };

  // Mic button states
  const isMicActive = voiceState === 'listening' || voiceState === 'user-speaking';
  const isBotSpeaking = voiceState === 'bot-speaking';
  const isThinking = voiceState === 'thinking';

  return (
    <>
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-9xl font-bold text-white animate-bounce">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* Loading Screen */}
      <FeedbackLoadingScreen isVisible={finishing} colorScheme="purple" />

      <div className="flex flex-col h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-3 border-b flex justify-between items-center bg-white">
          <Dialog>
            <DialogTrigger asChild>
              <button
                aria-label="Show roleplay task"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Roleplay Task</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Nhiệm vụ:</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {scenario.task || 'No task available'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Câu mở đầu gợi ý:</h3>
                  <p className="text-sm text-gray-600 italic bg-blue-50 p-3 rounded-md">
                    "{scenario.starter_message}"
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            {hasUserMessages ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Thoát
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Thoát khỏi cuộc trò chuyện?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn đã có tin nhắn trong cuộc trò chuyện này. Nếu thoát bây giờ, cuộc trò chuyện sẽ không được lưu lại.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExit} className="bg-red-600 hover:bg-red-700">
                      Thoát
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleExit}>
                Thoát
              </Button>
            )}

            <Button
              onClick={handleFinish}
              disabled={finishing || messages.length <= 1}
              variant="outline"
              size="sm"
            >
              {finishing ? 'Saving...' : 'Finish'}
            </Button>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 p-4 overflow-y-auto">
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

        {/* Voice Controls Container */}
        <div className="relative pb-8">
          {/* Toggle Icons (top-right) */}
          {!showTextInput && (
            <div className="absolute top-2 right-6 z-10">
              <button
                onClick={() => setShowTextInput(true)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Toggle text input"
              >
                <Keyboard className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Text Input Mode */}
          {showTextInput ? (
            <div className="px-4 pb-2 pt-2">
              <form onSubmit={handleBackupSubmit} className="flex gap-2 max-w-md mx-auto items-center">
                {/* Small Mic Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowTextInput(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Switch to voice mode"
                >
                  <Mic className="w-4 h-4 text-gray-600" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={backupInput}
                  onChange={(e) => setBackupInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isThinking || finishing}
                  className="flex-1 px-4 py-2 text-sm border rounded-full focus:ring-2 focus:ring-[var(--primary-purple-lighter)] outline-none bg-white"
                  autoFocus
                />

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!backupInput.trim() || isThinking || finishing}
                  size="sm"
                  className="bg-[var(--primary-purple)] hover:bg-[var(--primary-purple-hover)] rounded-full h-9 w-9 p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            /* Voice Mode - Large Centered Mic Button with Transcription Above */
            <div className="flex flex-col items-center gap-3 pb-4 pt-4">
              {/* Status Text */}
              <div className="h-6 flex items-center">
                {isThinking && (
                  <p className="text-sm text-gray-600 animate-pulse">Đang nghĩ...</p>
                )}
                {voiceState === 'listening' && (
                  <p className="text-sm text-purple-600 font-medium animate-pulse">Đang nghe...</p>
                )}
                {voiceState === 'user-speaking' && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                    <p className="text-sm text-purple-600 font-medium">Bạn đang nói...</p>
                  </div>
                )}
              </div>

              {/* Interim Text Display - Directly Above Mic */}
              {interimText && (
                <div className="max-w-md px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm text-gray-700 mb-2">
                  {interimText}
                </div>
              )}

              <div className="relative">
                {/* Outer glow rings */}
                <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isMicActive
                  ? 'animate-ping-slow bg-gradient-to-r from-purple-400/30 to-pink-400/30'
                  : isBotSpeaking
                    ? 'animate-pulse bg-gray-400/20'
                    : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20'
                  }`} style={{ padding: '20px' }}></div>

                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isMicActive
                  ? 'animate-pulse-glow bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                  : isBotSpeaking
                    ? 'bg-gray-400/10'
                    : 'bg-gradient-to-r from-purple-800/10 to-pink-800/10'
                  }`} style={{ padding: '10px' }}></div>

                {/* Main button */}
                <button
                  onClick={handleMicClick}
                  disabled={isThinking || finishing || isSessionFinished.current}
                  aria-label={isMicActive ? 'Stop recording' : isBotSpeaking ? 'Stop bot speaking' : 'Start recording'}
                  className={`relative h-20 w-20 rounded-full shadow-2xl transition-all duration-500 ease-out transform ${isMicActive
                    ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 scale-110 shadow-purple-500/50 animate-breathe'
                    : isBotSpeaking
                      ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 scale-105 shadow-gray-500/30 animate-pulse'
                      : 'bg-gradient-to-br from-purple-800 via-purple-900 to-pink-900 hover:scale-110 hover:shadow-purple-900/50 shadow-purple-900/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {/* Inner glow */}
                  <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isMicActive ? 'opacity-100 bg-gradient-to-br from-white/20 to-yellow-200/20 animate-pulse' : 'opacity-0'
                    }`}></div>

                  <Mic className={`relative z-10 h-8 w-8 text-white mx-auto transition-transform duration-300 ${isMicActive ? 'animate-bounce-subtle' : ''
                    }`} />
                </button>
              </div>

              {/* Tap to stop hint */}
              {isMicActive && (
                <p className="text-xs text-gray-500">Nhấn để gửi tin nhắn</p>
              )}
            </div>
          )}



          {/* Error Display */}
          {(error || voiceError) && (
            <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <strong>Error:</strong> {error || voiceError}
            </div>
          )}

          {/* Browser Support Warning */}
          {!isSupported && (
            <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Voice mode không được hỗ trợ trên trình duyệt này. Vui lòng dùng Chrome hoặc Edge.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 1rem; }
          50% { height: 1.5rem; }
        }
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes breathe {
          0%, 100% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
