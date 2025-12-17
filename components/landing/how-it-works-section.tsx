'use client';

import { useRouter } from 'next/navigation';

interface Step {
    title: string;
    description: string;
}

interface HowItWorksSectionProps {
    headline: string;
    steps: Step[];
    ctaText?: string;
    ctaLink?: string;
}

/**
 * How It Works Section component
 * Displays the 4-step user flow in a clean, numbered format
 */
export function HowItWorksSection({ headline, steps, ctaText, ctaLink }: HowItWorksSectionProps) {
    const router = useRouter();

    return (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
                    {headline}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl">
                                    {index + 1}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {ctaText && ctaLink && (
                    <div className="text-center">
                        <button
                            onClick={() => router.push(ctaLink)}
                            className="btn-black-outline px-6 py-3 text-base font-medium"
                        >
                            <span className="flex items-center gap-2">
                                {ctaText}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
