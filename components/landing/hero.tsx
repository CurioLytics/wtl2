'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: React.ReactNode;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

/**
 * Hero component for the landing page's main banner section
 */
export function Hero({ title, subtitle, description, buttonText, buttonLink }: HeroProps) {
  const router = useRouter();

  return (
    <section className="flex-1 bg-white px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-medium text-gray-700 mb-8">
            {subtitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            {description}
          </p>
          <button
            onClick={() => router.push(buttonLink)}
            className="btn-black-primary px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              {buttonText}
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
        </div>
      </div>
    </section>
  );
}