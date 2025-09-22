'use client';

import Image from 'next/image';
import Link from 'next/link';

interface FooterLink {
  text: string;
  href: string;
}

interface FooterProps {
  logoSrc: string;
  logoText: string;
  links: FooterLink[];
}

/**
 * Footer component for the landing page
 * Contains logo, brand name, and navigation links
 */
export function Footer({ logoSrc, logoText, links }: FooterProps) {
  return (
    <footer className="bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative w-8 h-8 mr-2">
            <Image
              src={logoSrc}
              alt={logoText}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold">{logoText}</span>
        </div>
        
        <div className="flex gap-6">
          {links.map((link, index) => (
            <Link 
              key={index} 
              href={link.href}
              className="text-gray-600 hover:text-blue-600"
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}