'use client';

import React from 'react';

interface EmptyStateProps {
  onCreateCollection: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateCollection }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <svg
          className="mx-auto h-16 w-16 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No vocabulary collections</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first vocabulary collection. Collections help you organize words from 
          your learning sessions, journal entries, or by topics.
        </p>
        <div className="mt-6">
          <button
            onClick={onCreateCollection}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Collection
          </button>
        </div>
      </div>
    </div>
  );
};