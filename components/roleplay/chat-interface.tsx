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
import { VoiceInputButton } from './voice-input-button';
import { FeedbackLoadingScreen } from './feedback-loading-screen';
import { roleplayConversationService } from '@/services/roleplay/roleplay-conversation-service';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { useTTS } from '@/hooks/roleplay/use-tts';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import styles from './roleplay.module.css';

interface ChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function ChatInterface({ scenario }: ChatInterfaceProps) {
  const router = useRouter();
  const { user, userPreferences: cachedPreferences } = useAuth();
  const { speak, stop, isPlaying, playingMessageId } = useTTS();

  // Generate unique session ID for this conversation
  const [sessionId] = useState(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${timestamp}_${random}`;
  });

  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use cached preferences from auth context with defaults
  const userPreferences = {
    name: cachedPreferences?.name || 'User',
    english_level: cachedPreferences?.english_level || 'intermediate',
    style: cachedPreferences?.style || 'conversational',
  };

  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const autoFinishScheduled = useRef(false);
  const messagesRef = useRef<RoleplayMessage[]>([]);

  const addMessage = (msg: RoleplayMessage) =>
    setMessages((prev) => {
      const updated = [...prev, msg];
      messagesRef.current = updated;
      return updated;
    });

  const hasUserMessages = messages.filter(msg => msg.sender === 'user').length > 0;



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

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push state to enable popstate detection
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUserMessages]);

  const handleSpeakToggle = (messageId: string, text: string) => {
    if (isPlaying(messageId)) {
      stop();
    } else {
      speak(text, messageId);
    }
  };

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
    console.log('[DETECT-FINISH] Checking message:', message);
    console.log('[DETECT-FINISH] Lower message:', lowerMessage);
    console.log('[DETECT-FINISH] Result:', result);
    return result;
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
    console.log('[AUTO-FINISH] User message:', text);
    console.log('[AUTO-FINISH] Should auto-finish:', shouldAutoFinish);

    try {
      // If user wants to finish, show a closing message instead of calling webhook
      if (shouldAutoFinish && !autoFinishScheduled.current) {
        autoFinishScheduled.current = true;
        console.log('[AUTO-FINISH] User wants to finish, adding closing message...');
        
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
        setIsLoading(false);

        // Auto-play closing message
        setTimeout(() => {
          speak(randomClosing, botMsg.id);
        }, 300);

        // Schedule auto-finish
        console.log('[AUTO-FINISH] Scheduling auto-finish in 2 seconds...');
        setTimeout(() => {
          console.log('[AUTO-FINISH] Executing handleFinish now...');
          handleFinish();
        }, 2000);
        
        return; // Exit early, don't call webhook
      }

      // Normal flow: call webhook for bot response
      const reply = await roleplayConversationService.getBotResponse(
        scenario,
        [...messages, userMsg],
        sessionId,
        userPreferences
      );
      const botMsg: RoleplayMessage = {
        id: `bot-${Date.now()}`,
        content: reply,
        sender: 'bot',
        timestamp: Date.now(),
      };
      addMessage(botMsg);

      // Auto-play bot response
      setTimeout(() => {
        speak(reply, botMsg.id);
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

  const handleFinish = async () => {
    console.log('[HANDLE-FINISH] Starting handleFinish...');
    console.log('[HANDLE-FINISH] User ID:', user?.id);
    console.log('[HANDLE-FINISH] Messages count:', messages.length);
    console.log('[HANDLE-FINISH] finishing state:', finishing);
    
    // Prevent duplicate calls
    if (finishing) {
      console.log('[HANDLE-FINISH] Already finishing, skipping duplicate call');
      return;
    }
    
    // Stop all ongoing actions first
    stop();

    setFinishing(true);
    setError(null);

    try {
      // Get current messages from ref (always has latest value)
      const currentMessages = messagesRef.current;

      if (!user?.id || currentMessages.length <= 1) {
        console.error('[HANDLE-FINISH] Validation failed - insufficient data');
        console.error('[HANDLE-FINISH] Messages length:', currentMessages.length);
        throw new Error('Unable to save session. Please try again.');
      }

      console.log('[HANDLE-FINISH] Calling completeSession with', currentMessages.length, 'messages');
      const sessionId = await roleplaySessionService.completeSession(
        user.id,
        scenario,
        currentMessages,
        userPreferences
      );

      console.log('[HANDLE-FINISH] Session completed, ID:', sessionId);
      console.log('[HANDLE-FINISH] Redirecting to summary page...');
      router.replace(`/roleplay/summary/${sessionId}`);
      // Keep loading screen visible during navigation
    } catch (error: any) {
      console.error('[HANDLE-FINISH] Error:', error);
      setError(error?.message || 'Error saving session. Please try again.');
      setFinishing(false); // Only hide loading on error
    }
  };

  const handleExit = () => {
    router.push(`/roleplay/${scenario.id}`);
  };

  const handleVoiceTranscript = (text: string) => {
    // Append to existing input value with space
    setInputValue(prev => prev ? `${prev} ${text}` : text);
  };

  return (
    <>
      <FeedbackLoadingScreen isVisible={finishing} colorScheme="blue" />
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b flex justify-between items-center">
          <Dialog>
            <DialogTrigger asChild>
              <button
                aria-label="Show roleplay task"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 
                    0116 0zm-7-4a1 1 0 11-2 0 1 1 
                    0 012 0zM9 9a1 1 0 000 2v3a1 1 
                    0 001 1h1a1 1 0 100-2v-3a1 1 
                    0 00-1-1H9z"
                  />
                </svg>
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
            {/* Exit button with confirmation if there's content */}
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
        </div >

        {/* Chat */}
        < div className="flex-1 p-4 overflow-y-auto bg-gray-50" >
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
