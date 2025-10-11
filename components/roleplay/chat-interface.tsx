'use client';

import { useState, useRef, useEffect } from 'react';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { useRouter } from 'next/navigation';
import { roleplayWebhookService } from '@/services/api/roleplay-webhook-service';
import styles from './roleplay.module.css';

interface ChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function ChatInterface({ scenario }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Thêm tin nhắn mở đầu khi component được tải
  useEffect(() => {
    // Tạo tin nhắn từ bot với nội dung là starter_message
    const initialMessage: RoleplayMessage = {
      id: 'initial',
      content: scenario.starter_message,
      sender: 'bot',
      timestamp: Date.now()
    };
    
    // Thêm tin nhắn vào danh sách
    setMessages([initialMessage]);
  }, [scenario]);
  
  // Cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra xem input có nội dung không
    if (!inputValue.trim()) return;
    
    // Tạo tin nhắn người dùng
    const userMessage: RoleplayMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: Date.now()
    };
    
    // Cập nhật danh sách tin nhắn và xóa input
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    
    // Show typing indicator while waiting for response
    setIsLoading(true);
    
    try {
      // Call the webhook service with the full scenario object and all messages so far
      const botResponseText = await roleplayWebhookService.getBotResponse(
        scenario, 
        updatedMessages
      );
      
      // Create the bot response message
      const botResponse: RoleplayMessage = {
        id: `bot-${Date.now()}`,
        content: botResponseText,
        sender: 'bot',
        timestamp: Date.now()
      };
      
      // Add the bot response to the messages
      setMessages(currentMessages => [...currentMessages, botResponse]);
    } catch (error) {
      // Handle errors from the webhook
      console.error('Failed to get bot response:', error);
      
      // Prepare a user-friendly error message based on the error type
      let errorContent = "Sorry, I couldn't process your message. Please try again.";
      
      if (error instanceof Error) {
        // Customize error message based on the error
        if (error.message.includes('timed out')) {
          errorContent = "The response is taking longer than expected. Please try again or use a shorter message.";
        } else if (error.message.includes('failed with status 429')) {
          errorContent = "We're receiving too many requests right now. Please wait a moment and try again.";
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorContent = "There seems to be a connection issue. Please check your internet connection and try again.";
        }
      }
      
      // Show an error message to the user
      const errorMessage: RoleplayMessage = {
        id: `error-${Date.now()}`,
        content: errorContent,
        sender: 'bot',
        timestamp: Date.now()
      };
      
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      // Hide the typing indicator
      setIsLoading(false);
    }
  };
  
  const handleBackClick = () => {
    const shouldLeave = window.confirm('Are you sure you want to end this conversation?');
    if (shouldLeave) {
      router.push('/roleplay');
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBackClick}
            className="text-blue-600 hover:text-blue-800"
          >
            ←
          </button>
          <h2 className="font-medium text-gray-800">{scenario.name}</h2>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {scenario.topic} • {scenario.level}
        </span>
      </div>
      
      {/* Context */}
      <div className="px-4 py-2 bg-blue-50 text-sm text-gray-600">
        <strong>Context:</strong> {scenario.context}
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map(message => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            roleName={message.sender === 'bot' ? scenario.role1 : 'You'}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-xs">
              {scenario.role1.charAt(0).toUpperCase()}
            </div>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 flex items-center justify-center p-0"
            disabled={isLoading || !inputValue.trim()}
          >
            →
          </Button>
        </div>
      </form>
    </div>
  );
}

// The generateBotResponse function is no longer needed as we're using the webhook service