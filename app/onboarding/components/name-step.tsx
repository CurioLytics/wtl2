'use client';

import React from 'react';
import { OnboardingHeader } from './onboarding-header';

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

export function NameStep({ name, onNameChange }: NameStepProps) {
  return (
    <div>
      <OnboardingHeader 
        title="Chào mừng bạn đến với W2L"
        description="Thiết lập kế hoạch học tập chỉ trong vài phút."
        tip="Thông tin này giúp chúng tôi cá nhân hóa trải nghiệm học tập của bạn."
      />
      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Tên của bạn
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nhập tên của bạn"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
}