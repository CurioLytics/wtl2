'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/ui';

interface BreathingLoaderProps {
  message?: string;        // Optional custom message to show alongside breathing instructions
  className?: string;      // Optional additional classes
  bubbleColor?: string;    // Optional bubble color override
  textColor?: string;      // Optional text color override
}

/**
 * A calming breathing animation loader component
 * Shows alternating "breathe in" and "breathe out" text with a bubble that expands and contracts
 * Continuous smooth animation with 5 seconds for each phase (in/out)
 * Helps users stay calm and mindful during loading periods
 */
export function BreathingLoader({
  message = 'Loading...',
  className,
  bubbleColor = 'bg-primary/20', // Semi-transparent primary color by default
  textColor = 'text-primary'     // Primary text color by default
}: BreathingLoaderProps) {
  // Track breathing state (in or out)
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  
  // Use refs to track animation progress
  const animationRef = useRef<number>(0);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  
  // Animation duration (ms) for each phase
  const animationDuration = 5000;
  
  // Set up the smooth continuous animation
  useEffect(() => {
    // Animation function that runs every frame
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // Update progress (0 to 1 for each cycle)
      progressRef.current += deltaTime / animationDuration;
      if (progressRef.current >= 1) {
        progressRef.current = 0;
        setIsBreathingIn(prev => !prev);
      }
      
      // Apply smooth animation to bubble if ref exists
      if (bubbleRef.current) {
        const bubbleElement = bubbleRef.current;
        
        // Calculate current size based on breathing state and progress
        let progress = isBreathingIn ? progressRef.current : 1 - progressRef.current;
        
        // Smooth easing function (sine wave)
        const easedProgress = Math.sin(progress * Math.PI / 2);
        
        // Min size: 24px (1.5rem), Max size: 96px (6rem)
        const size = 24 + (easedProgress * 72);
        bubbleElement.style.width = `${size}px`;
        bubbleElement.style.height = `${size}px`;
        bubbleElement.style.opacity = `${0.5 + (easedProgress * 0.5)}`;
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
    
    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isBreathingIn, animationDuration]);
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-8', className)}>
      {/* Main message */}
      <p className="text-base text-gray-600 mb-2">{message}</p>
      
      {/* Breathing instruction text above bubble */}
      <p 
        className={cn(
          'font-medium transition-opacity duration-500 mb-2',
          textColor
        )}
        aria-live="polite"
      >
        {isBreathingIn ? 'breathe in' : 'breathe out'}
      </p>
      
      {/* Breathing bubble with smooth transition */}
      <div 
        className="flex items-center justify-center"
        style={{
          height: '96px', // Fixed container height to accommodate max bubble size
          width: '96px',  // Fixed container width to accommodate max bubble size
        }}
      >
        <div
          ref={bubbleRef}
          className={cn(
            'rounded-full transition-transform', 
            bubbleColor
          )}
          style={{
            width: '24px',  // Start smaller (half of previous min size)
            height: '24px', // Start smaller (half of previous min size)
          }}
          aria-hidden="true"
        />
      </div>
      
      {/* Mindfulness message */}
      <p className="text-sm text-gray-500 mt-4 italic">
        appreciate each moment
      </p>
    </div>
  );
}