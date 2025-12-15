'use client';

import { RoleplayMessage } from '@/types/roleplay';
import { Volume2, Square, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MessageBubbleProps {
  message: RoleplayMessage;
  roleName: string;
  compact?: boolean;
  onSpeakToggle?: (messageId: string, text: string) => void;
  isPlaying?: boolean;
}

export function MessageBubble({ message, roleName, compact = false, onSpeakToggle, isPlaying = false }: MessageBubbleProps) {
  const isUserMessage = message.sender === 'user';
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleSpeakerClick = () => {
    if (onSpeakToggle) {
      onSpeakToggle(message.id, message.content);
    }
  };
  
  return (
    <div className={`${compact ? 'mb-2' : 'mb-4'} flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Bong bóng tin nhắn */}
      <div className={`${compact ? 'max-w-[85%]' : 'max-w-[75%]'} ${isUserMessage ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-800'} rounded-lg px-3 py-2 shadow-sm relative group`}>
        <div className={`${compact ? 'text-xs' : 'text-sm'} break-words ${message.suggested_answer ? 'pr-16' : 'pr-8'}`}>{message.content}</div>
        
        {/* Suggested Answer Tooltip - Only for bot messages */}
        {!isUserMessage && message.suggested_answer && (
          <>
            <div className="absolute top-9 right-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowTooltip(!showTooltip)}
                className="h-6 w-6 text-purple-600 hover:text-purple-700"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
            {showTooltip && (
              <>
                <div 
                  className="fixed inset-0 z-[200]" 
                  onClick={() => setShowTooltip(false)}
                />
                <div className="fixed z-[201] w-64 p-3 bg-white text-black text-xs rounded-lg shadow-2xl border-2 border-purple-600 whitespace-normal break-words" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <div className="font-semibold mb-1">Gợi ý trả lời:</div>
                  <div>{message.suggested_answer}</div>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Speaker icon */}
        {onSpeakToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSpeakerClick}
            className={`absolute top-2 right-1 h-6 w-6 transition-opacity ${
              isPlaying 
                ? 'text-[var(--primary)]' 
                : isUserMessage 
                  ? 'text-white hover:text-white/80' 
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {isPlaying ? (
              <Square className="h-3 w-3 fill-current" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}