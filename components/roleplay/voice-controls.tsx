'use client';

import { Mic, Send, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceControlsProps {
  voiceState: 'idle' | 'listening' | 'user-speaking' | 'bot-speaking' | 'thinking';
  interimText: string;
  showTextInput: boolean;
  backupInput: string;
  disabled: boolean;
  onMicClick: () => void;
  onToggleInput: () => void;
  onTextChange: (text: string) => void;
  onTextSubmit: (e: React.FormEvent) => void;
}

export function VoiceControls({
  voiceState,
  interimText,
  showTextInput,
  backupInput,
  disabled,
  onMicClick,
  onToggleInput,
  onTextChange,
  onTextSubmit
}: VoiceControlsProps) {
  const isListening = voiceState === 'listening' || voiceState === 'user-speaking';
  const isThinking = voiceState === 'thinking';

  return (
    <div className="relative pb-8 pt-1 safe-bottom">
      {/* Toggle Button - Top Right */}
      <div className="absolute -top-10 right-4 z-10">
        <button
          onClick={onToggleInput}
          className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-md border border-gray-200"
        >
          <Keyboard className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {showTextInput ? (
        <div className="px-4 pb-3">
          <form onSubmit={onTextSubmit} className="flex gap-2 w-full max-w-2xl mx-auto items-center">
            <input
              type="text"
              value={backupInput}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type your message..."
              disabled={disabled}
              className="flex-1 px-4 py-3 text-sm border-0 rounded-full focus:ring-2 focus:ring-[var(--primary-purple-lighter)] outline-none bg-white"
              autoFocus
            />

            <Button
              type="submit"
              disabled={!backupInput.trim() || disabled}
              size="sm"
              className="bg-[var(--primary-purple)] hover:bg-[var(--primary-purple-hover)] rounded-full h-10 w-10 p-0 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 pb-2">
          {/* Status Text */}
          <div className="h-5 flex items-center">
            {isThinking && <p className="text-xs text-gray-600 animate-pulse">Đang nghĩ...</p>}
            {voiceState === 'listening' && <p className="text-xs text-purple-600 font-medium animate-pulse">Đang nghe...</p>}
            {voiceState === 'user-speaking' && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 0.1, 0.2, 0.3].map((delay, i) => (
                    <span key={i} className="w-1 h-3 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
                <p className="text-xs text-purple-600 font-medium">Bạn đang nói...</p>
              </div>
            )}
          </div>

          {/* Interim Text */}
          {interimText && (
            <div className="max-w-md px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-xs text-gray-700 mb-1">
              {interimText}
            </div>
          )}

          {/* Mic Button - Fixed at Bottom */}
          <div className="relative mt-1">
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isListening ? 'animate-ping-slow' : ''} bg-gradient-to-r from-purple-400/30 to-pink-400/30`} style={{ padding: '15px' }} />
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isListening ? 'animate-pulse-glow' : ''} bg-gradient-to-r from-purple-500/20 to-pink-500/20`} style={{ padding: '8px' }} />

            <button
              onClick={onMicClick}
              disabled={disabled}
              className={`relative h-16 w-16 rounded-full transition-all duration-500 ease-out transform bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 ${
                isListening ? 'scale-110 animate-breathe' : 'hover:scale-110'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isListening ? 'opacity-100 bg-gradient-to-br from-white/20 to-yellow-200/20 animate-pulse' : 'opacity-0'}`} />
              <Mic className={`relative z-10 h-7 w-7 text-white mx-auto transition-transform duration-300 ${isListening ? 'animate-bounce-subtle' : ''}`} />
            </button>
          </div>

          {isListening && <p className="text-xs text-gray-500">Nhấn để gửi tin nhắn</p>}
        </div>
      )}
    </div>
  );
}
