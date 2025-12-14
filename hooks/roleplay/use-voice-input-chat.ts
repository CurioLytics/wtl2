'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/media/voice-service';

export function useVoiceInputChat(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');

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
    
    // Set to English
    voiceService.setLanguage('en-US');

    await voiceService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          onTranscript(text);
          setInterimText('');
        } else {
          setInterimText(text);
        }
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
      }
    );
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimText('');
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    error,
    interimText,
    isSupported: voiceService.isSupported()
  };
}
