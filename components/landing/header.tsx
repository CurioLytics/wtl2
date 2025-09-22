'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  logoSrc: string;
  logoText: string;
  buttonText: string;
  buttonLink: string;
}

/**
 * Header component for the landing page
 * Contains logo, navigation links and CTA button
 */
export function Header({ logoSrc, logoText, buttonText, buttonLink }: HeaderProps) {
  const router = useRouter();
  
  return (
    <header className="px-4 py-4 flex justify-between items-center bg-white">
      <div className="flex items-center">
        <div className="relative w-8 h-8 mr-2">
          <Image
            src={logoSrc}
            alt={logoText}
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-lg font-semibold">{logoText}</span>
      </div>
      <div className="flex gap-4 items-center">
        <Link href="/auth" className="text-gray-600 hover:text-blue-600">
          Log In
        </Link>
        <Button 
          onClick={() => router.push(buttonLink)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {buttonText}
        </Button>
      </div>
    </header>
  );
}