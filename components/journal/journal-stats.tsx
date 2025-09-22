'use client';

import React from 'react';
import { JournalStats } from '@/types/journal';

interface JournalStatsProps {
  stats: JournalStats;
  isLoading?: boolean;
}

export function JournalStatsDisplay({ stats, isLoading = false }: JournalStatsProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm animate-pulse">
        <div className="h-5 w-24 bg-gray-200 mb-4 rounded"></div>
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-medium text-gray-700 mb-3">Your Journal Stats</h3>
      
      <div className="flex justify-between">
        <div className="text-center">
          <div className="text-2xl font-semibold text-blue-600">{stats.total_journals}</div>
          <div className="text-xs text-gray-500">Total Entries</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-600">
            {stats.current_streak}
          </div>
          <div className="text-xs text-gray-500">Day Streak</div>
        </div>
      </div>
      
      {stats.current_streak > 0 && (
        <div className="mt-3 text-center text-xs text-gray-600">
          <span className="font-medium text-green-600">Great job!</span> Keep your writing streak going.
        </div>
      )}
      
      {stats.current_streak === 0 && stats.total_journals > 0 && (
        <div className="mt-3 text-center text-xs text-gray-600">
          Create a journal entry today to start a new streak!
        </div>
      )}
      
      {stats.total_journals === 0 && (
        <div className="mt-3 text-center text-xs text-gray-600">
          Start your journal journey by creating your first entry!
        </div>
      )}
    </div>
  );
}