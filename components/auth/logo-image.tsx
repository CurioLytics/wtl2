'use client';

import Image from 'next/image';
import { useState } from 'react';

export function LogoImage() {
  const [errorLoading, setErrorLoading] = useState(false);
  
  return (
    <div className="relative h-16 sm:h-12 mx-auto w-48">
      <Image
        src="/images/logo.svg"
        alt="Write2Learn Logo"
        fill
        priority
        className="object-contain"
        onError={(e) => {
          console.error('Logo failed to load');
          e.currentTarget.src = '/images/logo.svg'; // Retry loading the image
          e.currentTarget.onerror = null; // Prevent infinite loop
          setErrorLoading(true);
        }}
      />
      {errorLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-semibold text-lg">Write2Learn</span>
        </div>
      )}
    </div>
  );
}