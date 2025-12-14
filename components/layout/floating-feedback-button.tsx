'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  images?: string[];
  category?: string;
  timestamp: Date;
}

export function FloatingFeedbackButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [userInfoSaved, setUserInfoSaved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Xin chào! Bạn có thể gửi phản hồi trong khi trải nghiệm ứng dụng, chỉ cần chọn loại, và dán ảnh màn hình hoặc mô tả nhé 😊',
      timestamp: new Date()
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { value: 'bug', label: '🐛 Lỗi kỹ thuật', color: 'bg-red-100 text-red-700' },
    { value: 'feature', label: '✨ Tính năng', color: 'bg-purple-100 text-purple-700' },
    { value: 'ui', label: '🎨 Giao diện', color: 'bg-blue-100 text-blue-700' },
    { value: 'other', label: '📝 Khác', color: 'bg-gray-100 text-gray-700' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Track if we actually moved
        if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
          setHasMoved(true);
        }
        
        // Constrain to viewport - use a default size if container not available
        const containerWidth = isOpen && containerRef.current ? containerRef.current.offsetWidth : 48;
        const containerHeight = isOpen && containerRef.current ? containerRef.current.offsetHeight : 48;
        const maxX = window.innerWidth - containerWidth - 24;
        const maxY = window.innerHeight - containerHeight - 24;
        
        setPosition({
          x: Math.max(-window.innerWidth + containerWidth + 24, Math.min(newX, maxX)),
          y: Math.max(-24, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Reset hasMoved after a brief delay to allow onClick to check it
        setTimeout(() => setHasMoved(false), 100);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // For open dialog: Only start dragging if clicking on the header itself, not buttons
    if (isOpen && (e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveUserInfo = () => {
    setUserInfoSaved(true);
    setShowUserInfo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && images.length === 0) {
      return;
    }

    if (!selectedCategory) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'Vui lòng chọn loại phản hồi trước khi gửi nhé.',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      images: [...images],
      category: selectedCategory,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    const currentImages = [...images];
    const currentCategory = selectedCategory;

    setMessage('');
    setImages([]);
    setSelectedCategory('');
    setIsSubmitting(true);

    try {
      // Save to file via API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Anonymous',
          email: email || '',
          category: currentCategory,
          message: currentMessage,
          images: currentImages,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Cảm ơn bạn nhiều! Còn gì cần cân nhắc thì cứ gửi nhé 💙',
        timestamp: new Date()
      }]);

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    // Prevent opening if we just finished dragging
    if (hasMoved) {
      e.preventDefault();
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div 
          className="fixed z-50"
          style={{
            top: `${24 + position.y}px`,
            right: `${24 - position.x}px`,
            transition: isDragging ? 'none' : 'all 0.3s ease'
          }}
        >
          <Button
            onClick={handleOpen}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-12 sm:h-14 rounded-full shadow-lg hover:shadow-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center select-none"
            style={{
              width: isHovered ? 'auto' : '48px',
              paddingLeft: isHovered ? '20px' : '0',
              paddingRight: isHovered ? '20px' : '0',
              transition: 'all 0.3s ease',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            {isHovered && (
              <span className="ml-2 whitespace-nowrap text-sm sm:text-base">
                Gửi phản hồi
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed z-50 w-full max-w-[calc(100vw-3rem)] sm:w-96"
          style={{
            top: `${24 + position.y}px`,
            right: `${24 - position.x}px`,
            height: '600px',
            maxHeight: 'calc(100vh - 100px)',
            transition: isDragging ? 'none' : 'all 0.3s ease'
          }}
        >
          <div className="h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between select-none"
              onMouseDown={handleMouseDown}
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Phản hồi của bạn</h3>
                  <p className="text-blue-100 text-xs">là nguyên liệu giúp W2L hoàn thiện hơn</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <>
              {/* User Info Fields */}
              {showUserInfo && (
                <div className="px-4 py-3 bg-white border-b space-y-3">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tên của bạn (tùy chọn)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email của bạn (tùy chọn)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveUserInfo}
                      className="flex-1 h-9 text-sm"
                    >
                      Oke
                    </Button>
                    <Button
                      onClick={() => setShowUserInfo(false)}
                      variant="outline"
                      className="flex-1 h-9 text-sm"
                    >
                      Bỏ qua
                    </Button>
                  </div>
                </div>
              )}

              {/* Category Pills - Always visible for per-message selection */}
              {!showUserInfo && (
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="text-xs text-gray-600 mb-2">Chọn loại phản hồi:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${selectedCategory === category.value
                          ? `${category.color} ring-2 ring-blue-400`
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 ${msg.type === 'user'
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md'
                        }`}
                    >
                      {msg.category && msg.type === 'user' && (
                        <div className="text-xs mb-1 opacity-80">
                          {categories.find(c => c.value === msg.category)?.label}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      {msg.images && msg.images.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Uploaded ${idx + 1}`}
                              className="rounded-lg max-w-full h-auto"
                            />
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isSubmitted && (
                  <div className="flex justify-center">
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      Đã gửi thành công!
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t bg-white px-4 py-3">
                {images.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="Nhập phản hồi... (Ctrl+V để dán ảnh)"
                      rows={1}
                      className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ minHeight: '40px', maxHeight: '80px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (!message.trim() && images.length === 0)}
                    className="h-10 w-10 rounded-xl flex-shrink-0 p-0"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          </div>
        </div>
      )}
    </>
  );
}
