'use client';

import { useState, useEffect } from 'react';

interface FeedbackLoadingScreenProps {
    isVisible: boolean;
    colorScheme?: 'purple' | 'blue';
    steps?: string[];
}

const defaultSteps = [
    'check độ rõ ràng',
    'check từ vựng',
    'check ngữ pháp',
    'gợi ý ý tưởng',
    'tạo bản final'
];

export function FeedbackLoadingScreen({
    isVisible,
    colorScheme = 'purple',
    steps = defaultSteps
}: FeedbackLoadingScreenProps) {
    const [loadingStep, setLoadingStep] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setLoadingStep(0);
            return;
        }

        // Animate loading steps
        const interval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev < steps.length - 1) return prev + 1;
                return prev; // Stay at last step, don't loop
            });
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, [isVisible, steps]);

    if (!isVisible) return null;

    const colors = {
        purple: {
            spinner: 'border-purple-600',
            text: 'text-purple-600'
        },
        blue: {
            spinner: 'border-blue-600',
            text: 'text-blue-600'
        }
    };

    const selectedColors = colors[colorScheme];

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${selectedColors.spinner} mx-auto mb-4`}></div>
                    <p className="text-lg">
                        <span className="text-gray-900">Đang </span>
                        <span
                            key={loadingStep}
                            className={`${selectedColors.text} font-medium inline-block animate-fade-in`}
                        >
                            {steps[loadingStep]}
                        </span>
                    </p>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
        </>
    );
}
