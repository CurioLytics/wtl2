'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, BookOpen, PenLine, MessageSquare } from 'lucide-react';
import { DailyGoalStatus } from '@/types/analytics';
import { cn } from '@/utils/ui';
import { useUserProfileStore } from '@/stores/user-profile-store';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DailyGoalCardProps {
  data: DailyGoalStatus | null;
  isLoading?: boolean;
}

export function DailyGoalCard({ data, isLoading }: DailyGoalCardProps) {
  const profile = useUserProfileStore(state => state.profile);

  // Use cached profile goals or fallback to API data targets
  const goals = [
    {
      key: 'vocab_created' as const,
      label: 'Add Vocabulary',
      icon: BookOpen,
      target: profile?.daily_vocab_goal || data?.vocab_created.target || 10,
      link: '/vocab'
    },
    {
      key: 'journal_created' as const,
      label: 'Write Journal',
      icon: PenLine,
      target: profile?.daily_journal_goal || data?.journal_created.target || 3,
      link: '/journal/new'
    },
    {
      key: 'roleplay_completed' as const,
      label: 'Complete Roleplay',
      icon: MessageSquare,
      target: profile?.daily_roleplay_goal || data?.roleplay_completed.target || 2,
      link: '/roleplay'
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner text="Đang tải mục tiêu..." />
        </div>
      </Card>
    );
  }

  // Calculate percentage based on goal completion (33% per goal reached)
  // Each goal contributes equally regardless of target numbers
  const goalsReached = data
    ? goals.reduce((count, goal) => {
      const goalData = data[goal.key];
      const isReached = goalData.completed >= goal.target;
      return count + (isReached ? 1 : 0);
    }, 0)
    : 0;

  const totalCompleted = data
    ? goals.reduce((sum, goal) => {
      const goalData = data[goal.key];
      return sum + goalData.completed;
    }, 0)
    : 0;

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);

  // Max is 100%, each goal contributes 33%
  const progressPercentage = Math.min(100, Math.round((goalsReached / goals.length) * 100));

  // Dynamic color based on progress
  const getProgressColor = () => {
    if (progressPercentage >= 100) return '#10B981'; // Green
    if (progressPercentage >= 50) return '#F59E0B'; // Yellow/Orange
    return '#EF4444'; // Red
  };

  const progressColor = getProgressColor();


  return (
    <Card className="p-6 bg-white shadow rounded-2xl h-full flex flex-col">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Plan</h3>
      </div>

      {/* Circular progress indicator - Centered and larger */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#E5E7EB"
              strokeWidth="10"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={progressColor}
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{progressPercentage}%</span>
            <span className="text-xs text-gray-500 mt-1">{totalCompleted} / {totalTarget} tasks</span>
          </div>
        </div>
      </div>

      {/* Goal items */}
      <div className="space-y-1 flex-1">
        {goals.map(goal => {
          const completed = data?.[goal.key]?.completed || 0;
          const target = goal.target;
          const Icon = goal.icon;

          return (
            <Link key={goal.key} href={goal.link}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 flex-1">
                  {/* Minimalistic icon */}
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>

                  {/* Goal name */}
                  <span className="text-sm font-medium text-gray-700">
                    {goal.label}
                  </span>
                </div>

                {/* Count and arrow */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {completed} / {target}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom label */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400">Daily progress</p>
      </div>
    </Card>
  );
}
