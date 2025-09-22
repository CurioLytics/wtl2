'use client';

import React from 'react';
import { OnboardingHeader } from './onboarding-header';
import { LEARNING_GOALS, type LearningGoal } from '@/types/onboarding';

interface GoalsStepProps {
  selectedGoals: LearningGoal[];
  onToggleGoal: (goal: LearningGoal) => void;
}

export function GoalsStep({ selectedGoals, onToggleGoal }: GoalsStepProps) {
  return (
    <div>
      <OnboardingHeader 
        title="Your goal"
        description="What do you want to achieve?"
      />
      <div className="grid grid-cols-2 gap-4">
        {LEARNING_GOALS.map((goal) => (
          <button
            key={goal}
            onClick={() => onToggleGoal(goal)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedGoals.includes(goal)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {getGoalIcon(goal)}
              {goal}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getGoalIcon(goal: LearningGoal) {
  const iconClassName = "w-5 h-5";
  
  switch (goal) {
    case 'Fluency':
      return <img src="/icons/language.svg" alt="" className={iconClassName} />;
    case 'Exam prep':
      return <img src="/icons/cap.svg" alt="" className={iconClassName} />;
    case 'Work':
      return <img src="/icons/coding.svg" alt="" className={iconClassName} />;
    case 'Travel':
      return <img src="/icons/clock.svg" alt="" className={iconClassName} />;
    case 'Speaking':
      return <img src="/icons/mic-on.svg" alt="" className={iconClassName} />;
    case 'Vocabulary':
      return <img src="/icons/bookmark.svg" alt="" className={iconClassName} />;
    default:
      return null;
  }
}