'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for responsive design that provides viewport size information.
 * Follows mobile-first approach with consistent breakpoints:
 * - Mobile: < 768px (Bottom navigation or overlay sidebar)
 * - Tablet: 768px - 1024px (Collapsible sidebar)
 * - Desktop: > 1024px (Fixed sidebar)
 * 
 * @returns Object containing boolean flags for different screen sizes
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(true);  // Default to mobile for SSR
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Function to check screen size and update state
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Updated from 640px to 768px
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  return { 
    isMobile, 
    isTablet, 
    isDesktop,
    // Convenience methods
    isLargerThanMobile: !isMobile, // width >= 768px
    isLargerThanTablet: isDesktop, // width >= 1024px
    // Helper methods for specific layout decisions
    useBottomNav: isMobile, // Use bottom nav for < 768px
    useCollapsibleSidebar: isTablet, // Use collapsible sidebar for 768px-1024px
    useFixedSidebar: isDesktop // Use fixed sidebar for > 1024px
  };
}