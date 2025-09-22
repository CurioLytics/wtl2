'use client';

import { useResponsive } from './use-responsive';
import { CSSProperties, useMemo } from 'react';

/**
 * A hook that provides transition styles for smooth responsive layout changes
 * following a mobile-first approach
 */
export function useTransitionStyles() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  /**
   * Generate container transition styles with customizable durations and properties
   */
  const getContainerTransition = (options?: {
    duration?: number;
    properties?: string[];
    delay?: number;
    timingFunction?: string;
  }): CSSProperties => {
    const {
      duration = 300,
      properties = ['all'],
      delay = 0,
      timingFunction = 'ease-in-out'
    } = options || {};
    
    return {
      transition: `${properties.join(', ')} ${duration}ms ${timingFunction} ${delay}ms`,
    };
  };
  
  /**
   * Mobile-first navigation styles with smooth transitions
   */
  const navigationStyles = useMemo((): CSSProperties => {
    // Start with mobile styles (mobile-first)
    const baseStyles: CSSProperties = {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '0.5rem',
      ...getContainerTransition({
        properties: ['width', 'height', 'transform', 'padding', 'position']
      })
    };
    
    // Apply tablet styles conditionally
    if (isTablet) {
      return {
        ...baseStyles,
        padding: '0.75rem',
      };
    }
    
    // Apply desktop styles conditionally
    if (isDesktop) {
      return {
        position: 'static',
        width: '16rem', // 256px
        height: '100vh',
        padding: '1rem',
      };
    }
    
    return baseStyles;
  }, [isMobile, isTablet, isDesktop]);
  
  /**
   * Mobile-first content container styles with smooth transitions
   */
  const contentStyles = useMemo((): CSSProperties => {
    // Start with mobile styles (mobile-first)
    const baseStyles: CSSProperties = {
      padding: '1rem',
      paddingBottom: '5rem', // Space for mobile nav
      ...getContainerTransition()
    };
    
    // Apply tablet styles conditionally
    if (isTablet) {
      return {
        ...baseStyles,
        padding: '1.25rem',
        paddingBottom: '5.5rem',
      };
    }
    
    // Apply desktop styles conditionally
    if (isDesktop) {
      return {
        padding: '1.5rem',
        paddingBottom: '1.5rem', // No need for extra bottom padding on desktop
      };
    }
    
    return baseStyles;
  }, [isMobile, isTablet, isDesktop]);
  
  /**
   * Button styles with smooth touch feedback
   */
  const buttonStyles = useMemo((): CSSProperties => {
    return {
      minHeight: isMobile ? '44px' : '36px',
      minWidth: isMobile ? '44px' : '36px',
      transition: 'transform 100ms ease, background-color 200ms ease',
      touchAction: 'manipulation',
    };
  }, [isMobile]);
  
  return {
    getContainerTransition,
    navigationStyles,
    contentStyles,
    buttonStyles
  };
}