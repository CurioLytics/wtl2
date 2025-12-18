'use client';

import { ReactNode } from 'react';

interface ProblemSectionProps {
    headline: ReactNode;
    subheadline: ReactNode;
    problems: string[];
}

/**
 * Problem Awareness Section component
 * Displays user pain points in a clean, minimalist format
 */
export function ProblemSection({ headline, subheadline, problems }: ProblemSectionProps) {
    return (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {headline}
                </h2>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                    {subheadline}
                </p>
                <ul className="space-y-4 text-left max-w-xl mx-auto">
                    {problems.map((problem, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span className="text-lg text-muted-foreground">{problem}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
