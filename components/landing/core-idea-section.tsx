'use client';

interface CoreIdeaSectionProps {
    headline: string;
    subheadline: string;
    points: string[];
}

/**
 * Core Idea Section component
 * Highlights the main value proposition of Write2Learn
 */
export function CoreIdeaSection({ headline, subheadline, points }: CoreIdeaSectionProps) {
    return (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {headline}
                </h2>
                <p className="text-xl sm:text-2xl font-medium text-foreground mb-10 italic">
                    {subheadline}
                </p>
                <ul className="space-y-3 text-left max-w-xl mx-auto">
                    {points.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span className="text-lg text-foreground">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
