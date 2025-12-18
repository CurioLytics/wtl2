'use client';

import { ReactNode } from 'react';

interface TestimonialCardProps {
    quote: ReactNode;
    className?: string;
}

/**
 * Testimonial Card component
 * Displays user testimonials in a clean quote format
 */
export function TestimonialCard({ quote, className = '' }: TestimonialCardProps) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="text-3xl text-muted-foreground mb-4">"</div>
            <p className="text-lg text-foreground italic leading-relaxed">
                {quote}
            </p>
        </div>
    );
}
