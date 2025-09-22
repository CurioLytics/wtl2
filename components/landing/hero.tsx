'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
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
          <Button
            onClick={() => router.push(buttonLink)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-md"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}