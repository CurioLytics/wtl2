'use client';

import { Mic, MicOff, Languages } from 'lucide-react';
import { useVoiceInput } from '@/hooks/journal/use-voice-input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

interface FloatingVoiceButtonProps {
  onTranscript: (text: string, isFinal: boolean) => void;
}

export function FloatingVoiceButton({ onTranscript }: FloatingVoiceButtonProps) {
  const {
    isListening,
    startListening,
    stopListening,
    toggleLanguage,
    language,
    error,
    interimText,
    isSupported
  } = useVoiceInput(onTranscript);

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    if (isListening) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isListening]);

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <Button
                disabled
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg opacity-50 cursor-not-allowed"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-sm">Trình duyệt không hỗ trợ.<br/>Vui lòng dùng Chrome hoặc Edge.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {/* Main Floating Button */}
      <TooltipProvider>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
          {interimText ? (
            <div className="max-w-md px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 shadow-xl animate-fade-in">
              {interimText}
            </div>
          ) : null}

          {/* Main Mic Button with Glow Effect */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                {/* Outer glow rings */}
                <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
                  isListening 
                    ? 'animate-ping-slow bg-blue-400/30' 
                    : 'bg-gray-900/20'
                }`} style={{ padding: '20px' }}></div>
                
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  isListening 
                    ? 'animate-pulse-glow bg-blue-500/20' 
                    : 'bg-gray-800/10'
                }`} style={{ padding: '10px' }}></div>

                {/* Main button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative h-20 w-20 rounded-full shadow-2xl transition-all duration-500 ease-out transform ${
                    isListening
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 scale-110 shadow-blue-500/50 animate-breathe'
                      : 'bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:scale-110 hover:shadow-gray-900/50 shadow-gray-900/30'
                  }`}
                >
                  {/* Inner glow */}
                  <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
                    isListening ? 'opacity-100 bg-white/10 animate-pulse' : 'opacity-0'
                  }`}></div>
                  
                  <Mic className={`relative z-10 h-8 w-8 text-white mx-auto transition-transform duration-300 ${
                    isListening ? 'animate-bounce-subtle' : ''
                  }`} />
                  
                  {/* Language badge */}
                  <div className="absolute -bottom-1 -right-1 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLanguage();
                      }}
                      className="h-7 w-7 rounded-full bg-white shadow-lg flex items-center justify-center text-xs font-bold text-gray-900 hover:scale-110 transition-transform border-2 border-gray-200"
                    >
                      {language === 'vi-VN' ? 'VI' : 'EN'}
                    </button>
                  </div>
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-base">
              <p className="font-medium">
                {isListening ? 'Stop Recording' : 'Start Recording'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Language: {language === 'vi-VN' ? 'Vietnamese' : 'English'}
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="min-h-[1.25rem] text-sm font-medium text-blue-200">
            {isListening ? (interimText ? 'Đang ghi lại...' : 'Đang nghe...') : ' '}
          </div>
        </div>
      </TooltipProvider>

      {/* Error Overlay - More prominent for mobile */}
      {error && (
        <div className="fixed bottom-32 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-md z-50 bg-red-50 border border-red-200 rounded-xl shadow-2xl p-4 animate-fade-in max-h-[60vh] overflow-y-auto">
          <div className="text-sm text-red-700 font-medium mb-2 whitespace-pre-line">{error}</div>
          {error.includes('overlay') || error.includes('bubble') || error.includes('ANDROID') ? (
            <div className="mt-2 pt-2 border-t border-red-300">
              <p className="text-xs font-bold text-red-800 mb-1">Cách tắt overlay trên Android:</p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Messenger: Cài đặt → Chat heads → Tắt</li>
                <li>• Blue light filter: Tắt trong thanh thông báo</li>
                <li>• Hoặc: Settings → Apps → Special access → Display over other apps → Tắt tất cả</li>
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
