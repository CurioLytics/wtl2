'use client';

import Link from 'next/link';

interface FooterLink {
  text: string;
  href: string;
}

interface FooterProps {
  brandName: string;
  links: FooterLink[];
}

/**
 * Footer component for the landing page
 * Minimalist design with brand name, links, and copyright
 */
export function Footer({ brandName, links }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 px-4 py-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-lg font-semibold text-foreground">{brandName}</span>

          <div className="flex gap-6 items-center">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          © {currentYear}
        </div>
      </div>
    </footer>
  );
}
