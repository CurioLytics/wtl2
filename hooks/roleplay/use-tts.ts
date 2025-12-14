'use client';

import { useState, useCallback, useEffect } from 'react';
import { ttsService } from '@/services/media/tts-service';

export function useTTS() {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const speak = useCallback((text: string, messageId: string) => {
    ttsService.speak(
      text,
      messageId,
      () => setPlayingMessageId(messageId),
      () => setPlayingMessageId(null)
    );
  }, []);

  const stop = useCallback(() => {
    ttsService.stop();
    setPlayingMessageId(null);
  }, []);

  const isPlaying = useCallback((messageId: string) => {
    return playingMessageId === messageId;
  }, [playingMessageId]);

  return {
    speak,
    stop,
    isPlaying,
    playingMessageId,
    isSupported: ttsService.isSupported()
  };
}
