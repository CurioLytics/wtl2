'use client';

import { ReactNode } from 'react';

interface TargetAudienceSectionProps {
    headline: string;
    criteria: ReactNode[];
}

/**
 * Target Audience Section component
 * Displays who the product is for with checkmark list
 */
export function TargetAudienceSection({ headline, criteria }: TargetAudienceSectionProps) {
    return (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-10">
                    {headline}
                </h2>
                <ul className="space-y-4 text-left max-w-xl mx-auto">
                    {criteria.map((criterion, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <svg
                                className="w-6 h-6 text-foreground mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="text-lg text-foreground">{criterion}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
