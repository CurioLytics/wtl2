'use client';

import React from 'react';
import { OnboardingHeader } from './onboarding-header';
import { ENGLISH_LEVELS, ENGLISH_LEVELS_VI, type EnglishLevel } from '@/types/onboarding';

interface EnglishLevelStepProps {
  selectedLevel: EnglishLevel | null;
  onSelect: (level: EnglishLevel) => void;
}

export function EnglishLevelStep({ selectedLevel, onSelect }: EnglishLevelStepProps) {
  return (
    <div>
      <OnboardingHeader 
        title="Trình độ tiếng Anh của bạn"
        tip="Mức độ này sẽ giúp chúng tôi điều chỉnh nội dung học phù hợp với bạn."
      />
      <div className="grid gap-4">
        {ENGLISH_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedLevel === level
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            {ENGLISH_LEVELS_VI[level]}
          </button>
        ))}
      </div>
    </div>
  );
}