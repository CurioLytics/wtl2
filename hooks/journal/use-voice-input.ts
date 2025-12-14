'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/media/voice-service';

const AUTO_INSERT_DELAY_MS = 2000; // 5 seconds of silence before auto-insert

const normalizeForComparison = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/u, '');

export function useVoiceInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState<'vi-VN' | 'en-US'>('en-US');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoInsertRef = useRef<NodeJS.Timeout | null>(null);
  const interimTextRef = useRef('');
  const skipNextFinalRef = useRef<string | null>(null);

  const clearAutoInsertTimer = useCallback(() => {
    if (autoInsertRef.current) {
      clearTimeout(autoInsertRef.current);
      autoInsertRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimText('');
    interimTextRef.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    clearAutoInsertTimer();
    skipNextFinalRef.current = null;
  }, [clearAutoInsertTimer]);

  // Auto-stop after 2 minutes
  useEffect(() => {
    if (isListening) {
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setError('Đã dừng tự động sau 2 phút.');
      }, 120000); // 2 minutes
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      clearAutoInsertTimer();
    };
  }, [isListening, stopListening, clearAutoInsertTimer]);

  const startListening = useCallback(async () => {
    if (!voiceService.isSupported()) {
      setError('Trình duyệt không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    setError(null);
    setIsListening(true);
    clearAutoInsertTimer();
    skipNextFinalRef.current = null;

    await voiceService.startListening(
      (text, isFinal) => {
        const trimmed = text.trim();

        if (!trimmed) {
          setInterimText('');
          interimTextRef.current = '';
          clearAutoInsertTimer();
          return;
        }

        if (isFinal) {
          const normalizedFinal = normalizeForComparison(trimmed);

          if (skipNextFinalRef.current && skipNextFinalRef.current === normalizedFinal) {
            skipNextFinalRef.current = null;
            setInterimText('');
            interimTextRef.current = '';
            return;
          }

          clearAutoInsertTimer();
          skipNextFinalRef.current = null;
          setInterimText('');
          interimTextRef.current = '';
          onTranscript(trimmed, true);
          return;
        }

        setInterimText(text);
        interimTextRef.current = text;
        onTranscript(text, false);

        clearAutoInsertTimer();
        autoInsertRef.current = setTimeout(() => {
          const pending = interimTextRef.current.trim();
          if (!pending) {
            return;
          }

          const normalizedPending = normalizeForComparison(pending);
          skipNextFinalRef.current = normalizedPending;
          clearAutoInsertTimer();
          autoInsertRef.current = null;
          setInterimText('');
          interimTextRef.current = '';
          onTranscript(pending, true);
        }, AUTO_INSERT_DELAY_MS);
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
        setInterimText('');
        interimTextRef.current = '';
        clearAutoInsertTimer();
        skipNextFinalRef.current = null;
      },
      language
    );
  }, [onTranscript, language, clearAutoInsertTimer]);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'vi-VN' ? 'en-US' : 'vi-VN';
    setLanguage(newLang);
    voiceService.setLanguage(newLang);
    
    // Restart if currently listening
    if (isListening) {
      voiceService.stopListening();
      setTimeout(() => {
        startListening();
      }, 100);
    }
  }, [language, isListening, startListening]);

  return {
    isListening,
    startListening,
    stopListening,
    toggleLanguage,
    language,
    error,
    interimText,
    isSupported: voiceService.isSupported()
  };
}
