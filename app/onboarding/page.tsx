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

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setError(null);
      try {
        console.log('Submitting profile:', profile);
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Profile save error:', data);
          setError(data.error || 'Failed to save profile');
          return;
        }

        console.log('Profile save result:', data);

        if (data.success) {
          // Redirect to journal templates page instead of dashboard
          router.push('/journal/templates');
        } else {
          setError('Failed to save profile. Please try again.');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        setError('An unexpected error occurred. Please try again.');
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
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="ml-auto"
          >
            {step === 4 ? 'Complete' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}