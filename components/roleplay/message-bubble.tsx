'use client';

import { RoleplayMessage } from '@/types/roleplay';

interface MessageBubbleProps {
  message: RoleplayMessage;
  roleName: string;
}

export function MessageBubble({ message, roleName }: MessageBubbleProps) {
  // Định dạng thời gian tin nhắn
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isUserMessage = message.sender === 'user';
  
  return (
    <div className={`mb-4 flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar và tên - chỉ hiển thị cho tin nhắn bot */}
      {!isUserMessage && (
        <div className="flex flex-col items-center mr-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-sm">
            {roleName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 mt-1">{roleName}</span>
        </div>
      )}
      
      {/* Bong bóng tin nhắn */}
      <div className={`max-w-[70%] ${isUserMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} rounded-lg px-4 py-2 shadow-sm`}>
        <div className="text-sm break-words">{message.content}</div>
        <div className={`text-xs mt-1 ${isUserMessage ? 'text-blue-200' : 'text-gray-400'} text-right`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
      
      {/* Avatar và tên - chỉ hiển thị cho tin nhắn người dùng */}
      {isUserMessage && (
        <div className="flex flex-col items-center ml-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium text-sm">
            {roleName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 mt-1">{roleName}</span>
        </div>
      )}
    </div>
  );
}