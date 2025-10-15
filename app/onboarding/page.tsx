'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StepIndicator } from './components/step-indicator';
import { NameStep } from './components/name-step';
import { EnglishLevelStep } from './components/english-level-step';
import { GoalsStep } from './components/goals-step';
import { WritingTypesStep } from './components/writing-types-step';
import type { EnglishLevel, LearningGoal, WritingType, UserProfile } from '@/types/onboarding';
import { TemplateSelectionStep } from './components/template-selection-step';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    goals: [],
    writingTypes: [],
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Prevent multiple submissions
      if (isSubmitting) {
        console.log('Already submitting, ignoring duplicate request');
        return;
      }
      
      setError(null);
      setIsSubmitting(true);
      
      try {
        console.log('Saving profile in session storage:', profile);
        
        try {
          // Lưu thông tin profile vào sessionStorage để sử dụng sau khi đăng ký
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('onboardingProfile', JSON.stringify(profile));
          }
          
          // Đánh dấu là đã hoàn thành onboarding
          console.log('Onboarding completed, redirecting to auth page');
          
          // Chuyển hướng đến trang đăng ký với param để hiển thị thông báo
          router.replace('/auth?onboardingComplete=true');
        } catch (storageError) {
          console.error('Error saving to session storage:', storageError);
          setError('Không thể lưu thông tin. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.name && profile.name.length > 0;
      case 2:
        return profile.englishLevel !== null;
      case 3:
        return profile.goals && profile.goals.length > 0;
      case 4:
        return profile.writingTypes && profile.writingTypes.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <StepIndicator currentStep={step} totalSteps={4} />
        
        {step === 1 && (
          <NameStep
            name={profile.name || ''}
            onNameChange={(name) => updateProfile({ name })}
          />
        )}

        {step === 2 && (
          <EnglishLevelStep
            selectedLevel={profile.englishLevel || null}
            onSelect={(level) => updateProfile({ englishLevel: level })}
          />
        )}

        {step === 3 && (
          <GoalsStep
            selectedGoals={profile.goals || []}
            onToggleGoal={(goal) => {
              const goals = profile.goals || [];
              updateProfile({
                goals: goals.includes(goal)
                  ? goals.filter((g) => g !== goal)
                  : [...goals, goal],
              });
            }}
          />
        )}

        {step === 4 && (
          <WritingTypesStep
            selectedTypes={profile.writingTypes || []}
            onToggleType={(type) => {
              const types = profile.writingTypes || [];
              updateProfile({
                writingTypes: types.includes(type)
                  ? types.filter((t) => t !== type)
                  : [...types, type],
              });
            }}
          />
        )}

        {error && (
          <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between pt-8">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="ml-auto relative"
          >
            {step === 4 ? 
              (isSubmitting ? 
                <>
                  <span className="opacity-0">Hoàn thành</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </> 
                : 'Hoàn thành')
              : 'Tiếp tục'}
          </Button>
        </div>
      </div>
    </div>
  );
}