import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/layout/navigation';
import { useResponsive } from '@/hooks/common/use-responsive';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

// Mock the next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// Mock the useResponsive hook
jest.mock('@/hooks/common/use-responsive', () => ({
  useResponsive: jest.fn(),
}));

describe('Navigation component', () => {
  it('renders bottom navigation on mobile', () => {
    // Mock mobile view
    (useResponsive as jest.Mock).mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });
    
    render(<Navigation />);
    
    // Check that the navigation has mobile styling
    const nav = screen.getByRole('navigation');
    const computedStyle = window.getComputedStyle(nav);
    
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.bottom).toBe('0px');
  });

  it('renders side navigation on desktop', () => {
    // Mock desktop view
    (useResponsive as jest.Mock).mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
    
    render(<Navigation />);
    
    // Check that the navigation has desktop styling
    const nav = screen.getByRole('navigation');
    const computedStyle = window.getComputedStyle(nav);
    
    expect(computedStyle.position).toBe('static');
    expect(computedStyle.height).toBe('100%');
  });
});