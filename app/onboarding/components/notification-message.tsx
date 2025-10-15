'use client';

import React, { useState, useEffect } from 'react';

interface NotificationMessageProps {
  message: string;
  duration?: number; // Thời gian hiển thị tính bằng mili giây
  type?: 'info' | 'success' | 'warning'; // Loại thông báo
  onClose?: () => void; // Callback khi đóng thông báo
}

export function NotificationMessage({
  message,
  duration = 7000, // Mặc định hiển thị 7 giây
  type = 'info',
  onClose
}: NotificationMessageProps) {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  // Hiệu ứng đóng thông báo
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300); // 300ms cho hiệu ứng fade out
  };

  // Tự động đóng sau khoảng thời gian
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // Không render gì nếu đã đóng
  if (!visible) return null;

  // Xác định kiểu hiển thị dựa vào type
  let bgColor = 'bg-blue-50 border-blue-200';
  let textColor = 'text-blue-700';
  let icon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
    </svg>
  );

  if (type === 'success') {
    bgColor = 'bg-green-50 border-green-200';
    textColor = 'text-green-700';
    icon = (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
      </svg>
    );
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-50 border-yellow-200';
    textColor = 'text-yellow-700';
    icon = (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
      </svg>
    );
  }

  return (
    <div 
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm w-full p-4 mb-4 border rounded-lg shadow-sm ${bgColor} transition-opacity ${closing ? 'opacity-0' : 'opacity-100'}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className={`inline-flex flex-shrink-0 justify-center items-center w-8 h-8 ${textColor}`}>
          {icon}
        </div>
        <div className={`ml-3 text-sm font-medium ${textColor}`}>
          {message}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className={`ml-auto -mx-1.5 -my-1.5 ${textColor} rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-25 hover:bg-gray-100`}
          aria-label="Đóng"
        >
          <span className="sr-only">Đóng</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}