'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading templates...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary/30 absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-4xl mb-4">❌</div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  onAction, 
  icon = '📝' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-gray-50/50 border border-dashed border-gray-300 rounded-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}