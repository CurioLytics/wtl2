'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/media/voice-service';
import { ttsService } from '@/services/media/tts-service';

type VoiceState = 'idle' | 'bot-speaking' | 'listening' | 'user-speaking' | 'thinking';

interface UseVoiceModeOptions {
  onUserMessage: (text: string) => void;
  autoActivateDelay?: number; // Delay after bot finishes (ms)
  listeningTimeout?: number; // Timeout for user silence (ms)
  autoSendDelay?: number; // Auto-send after user pauses (ms)
}

export function useVoiceMode({
  onUserMessage,
  autoActivateDelay = 1500, // 1.5 seconds
  listeningTimeout = 12000, // 12 seconds
  autoSendDelay = 2000, // 2 seconds after user pauses
}: UseVoiceModeOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoActivateRef = useRef<NodeJS.Timeout | null>(null);
  const autoSendRef = useRef<NodeJS.Timeout | null>(null);
  const lastInterimTextRef = useRef<string>('');

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (autoActivateRef.current) {
      clearTimeout(autoActivateRef.current);
      autoActivateRef.current = null;
    }
    if (autoSendRef.current) {
      clearTimeout(autoSendRef.current);
      autoSendRef.current = null;
    }
  }, []);

  // Start listening with timeout
  const startListening = useCallback(() => {
    if (!voiceService.isSupported()) {
      setError('Trình duyệt không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    if (!navigator.onLine) {
      setError('Cần kết nối internet để sử dụng tính năng này.');
      return;
    }

    // Stop bot speaking if it's playing before starting to listen
    if (voiceState === 'bot-speaking') {
      ttsService.stop();
      setPlayingMessageId(null);
    }

    clearTimers();
    setError(null);
    setVoiceState('listening');
    
    // Set to English
    voiceService.setLanguage('en-US');

    // Start timeout for user silence
    timeoutRef.current = setTimeout(() => {
      voiceService.stopListening();
      setVoiceState('idle');
      setInterimText('');
    }, listeningTimeout);

    voiceService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          // Clear all timers
          clearTimers();
          
          // Stop listening
          voiceService.stopListening();
          
          // Send message
          onUserMessage(text);
          setInterimText('');
          setVoiceState('thinking');
        } else {
          // User is speaking - update state
          if (voiceState === 'listening') {
            setVoiceState('user-speaking');
          }
          setInterimText(text);
          lastInterimTextRef.current = text;
          
          // Clear previous auto-send timer
          if (autoSendRef.current) {
            clearTimeout(autoSendRef.current);
            autoSendRef.current = null;
          }
          
          // Set auto-send timer - if user pauses for 2 seconds, send message
          autoSendRef.current = setTimeout(() => {
            if (lastInterimTextRef.current.trim()) {
              voiceService.stopListening();
              onUserMessage(lastInterimTextRef.current);
              setInterimText('');
              setVoiceState('thinking');
              lastInterimTextRef.current = '';
            }
          }, autoSendDelay);
          
          // Reset timeout on speech activity
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              voiceService.stopListening();
              setVoiceState('idle');
              setInterimText('');
              lastInterimTextRef.current = '';
            }, listeningTimeout);
          }
        }
      },
      (errorMsg) => {
        clearTimers();
        setError(errorMsg);
        setVoiceState('idle');
      }
    );
  }, [onUserMessage, voiceState, listeningTimeout, autoSendDelay, clearTimers]);

  // Stop listening manually (user clicks mic button)
  const stopListening = useCallback(() => {
    clearTimers();
    voiceService.stopListening();
    
    // If we have interim text, send it
    if (interimText.trim()) {
      onUserMessage(interimText);
      setVoiceState('thinking');
    } else {
      setVoiceState('idle');
    }
    
    setInterimText('');
    lastInterimTextRef.current = '';
  }, [interimText, onUserMessage, clearTimers]);

  // Play bot message with auto-activation
  const playBotMessage = useCallback((text: string, messageId: string) => {
    // Stop listening if currently recording
    if (voiceState === 'listening' || voiceState === 'user-speaking') {
      voiceService.stopListening();
      setInterimText('');
      lastInterimTextRef.current = '';
    }
    
    clearTimers();
    setVoiceState('bot-speaking');
    
    ttsService.speak(
      text,
      messageId,
      () => setPlayingMessageId(messageId),
      () => {
        setPlayingMessageId(null);
        
        // Auto-activate mic after delay
        autoActivateRef.current = setTimeout(() => {
          startListening();
        }, autoActivateDelay);
      }
    );
  }, [autoActivateDelay, startListening, clearTimers]);

  // Stop bot speaking
  const stopBotSpeaking = useCallback(() => {
    clearTimers();
    ttsService.stop();
    setPlayingMessageId(null);
    setVoiceState('idle');
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      voiceService.stopListening();
      ttsService.stop();
    };
  }, [clearTimers]);

  return {
    voiceState,
    error,
    interimText,
    playingMessageId,
    startListening,
    stopListening,
    playBotMessage,
    stopBotSpeaking,
    isSupported: voiceService.isSupported() && ttsService.isSupported(),
  };
}
