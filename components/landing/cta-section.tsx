'use client';

import { useRouter } from 'next/navigation';

interface CTASectionProps {
    headline: string | React.ReactNode;
    subheadline?: string | React.ReactNode;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    className?: string;
    fullHeight?: boolean;
}

/**
 * Reusable CTA Section component for landing page
 * Supports primary and optional secondary CTA buttons
 * Can be full viewport height for hero section
 */
export function CTASection({
    headline,
    subheadline,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink,
    className = '',
    fullHeight = false,
}: CTASectionProps) {
    const router = useRouter();

    return (
        <section className={`${fullHeight ? 'min-h-screen flex items-center justify-center' : 'py-16 sm:py-24'} px-4 sm:px-6 lg:px-8 ${className}`}>
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                    {headline}
                </h1>
                {subheadline && (
                    <div className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        {subheadline}
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => router.push(primaryButtonLink)}
                        className="btn-black-primary px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <span className="flex items-center gap-2">
                            {primaryButtonText}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                    {secondaryButtonText && secondaryButtonLink && (
                        <button
                            onClick={() => router.push(secondaryButtonLink)}
                            className="btn-black-outline px-8 py-4 text-base font-semibold transition-all duration-300"
                        >
                            {secondaryButtonText}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
