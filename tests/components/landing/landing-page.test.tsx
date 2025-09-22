import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock components
jest.mock('@/components/landing/header', () => ({
  Header: () => <div data-testid="mock-header">Header Component</div>
}));

jest.mock('@/components/landing/hero', () => ({
  Hero: () => <div data-testid="mock-hero">Hero Component</div>
}));

jest.mock('@/components/landing/section', () => ({
  Section: ({ children, title }) => (
    <div data-testid="mock-section" data-title={title}>
      {children}
    </div>
  )
}));

jest.mock('@/components/landing/footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer Component</div>
}));

// Mock hook
jest.mock('@/hooks/common/use-responsive', () => ({
  useResponsive: () => ({ isMobile: false, isDesktop: true })
}));

describe('LandingPage', () => {
  // Expected use case test
  it('renders all sections of the landing page', () => {
    render(<LandingPage />);
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hero')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-section').length).toBe(2);
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });
  
  // Edge case test
  it('renders sections with correct titles', () => {
    render(<LandingPage />);
    
    const sections = screen.getAllByTestId('mock-section');
    expect(sections[0]).toHaveAttribute('data-title', 'What Can You do?');
    expect(sections[1]).toHaveAttribute('data-title', 'How It Works');
  });
  
  // Failure case test - testing mobile responsiveness
  it('handles mobile view correctly', () => {
    // Override the mock to return mobile
    require('@/hooks/common/use-responsive').useResponsive = () => ({ 
      isMobile: true, 
      isDesktop: false 
    });
    
    render(<LandingPage />);
    
    // Even in mobile view, all sections should still be present
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hero')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-section').length).toBe(2);
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });
});