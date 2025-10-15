'use client';

import React from 'react';
import { OnboardingHeader } from './onboarding-header';
import { WRITING_TYPES, WRITING_TYPES_VI, type WritingType } from '@/types/onboarding';

interface WritingTypesStepProps {
  selectedTypes: WritingType[];
  onToggleType: (type: WritingType) => void;
}

export function WritingTypesStep({ selectedTypes, onToggleType }: WritingTypesStepProps) {
  return (
    <div>
      <OnboardingHeader 
        title="Bạn muốn viết về chủ đề gì?"
        description="Chọn tất cả chủ đề bạn quan tâm"
        tip="Các loại nội dung này sẽ được đề xuất cho bạn khi bạn bắt đầu viết nhật ký."
      />
      <div className="grid grid-cols-2 gap-4">
        {WRITING_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedTypes.includes(type)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            {WRITING_TYPES_VI[type]}
          </button>
        ))}
      </div>
    </div>
  );
}