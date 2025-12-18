'use client';

import { useState, useCallback, useRef } from 'react';
import { voiceService } from '@/services/media/voice-service';

export function useVoiceInputChat(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');

  // Manually track accumulated text across recognition restarts
  const accumulatedTextRef = useRef('');

  const startListening = useCallback(async () => {
    if (!voiceService.isSupported()) {
      setError('Trình duyệt không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    if (!navigator.onLine) {
      setError('Cần kết nối internet để sử dụng tính năng này.');
      return;
    }

    setError(null);
    setIsListening(true);

    // Reset accumulated text when starting fresh
    accumulatedTextRef.current = '';
    setInterimText('');

    // Set to English
    voiceService.setLanguage('en-US');

    await voiceService.startListening(
      (text, isFinal) => {
        // For roleplay: Manually accumulate text
        // When isFinal, append to accumulated text
        if (isFinal && text.trim()) {
          // Append new final text to accumulated text
          const newAccumulated = accumulatedTextRef.current
            ? `${accumulatedTextRef.current} ${text.trim()}`
            : text.trim();
          accumulatedTextRef.current = newAccumulated;
          setInterimText(newAccumulated);
        } else if (!isFinal && text.trim()) {
          // Show interim text combined with accumulated
          const combined = accumulatedTextRef.current
            ? `${accumulatedTextRef.current} ${text.trim()}`
            : text.trim();
          setInterimText(combined);
        }
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
      },
      undefined,  // language (already set by setLanguage call above)
      false       // accumulateResults = false (we're doing manual accumulation now)
    );
  }, []);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);

    // Send the accumulated text as a message before clearing
    // This is called when user manually stops or when timer runs out
    if (accumulatedTextRef.current.trim()) {
      onTranscript(accumulatedTextRef.current.trim());
    }

    // Clear accumulated text and interim display
    accumulatedTextRef.current = '';
    setInterimText('');
  }, [onTranscript]);

  return {
    isListening,
    startListening,
    stopListening,
    error,
    interimText,
    isSupported: voiceService.isSupported()
  };
}
