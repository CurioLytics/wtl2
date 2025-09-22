import { render, screen } from '@testing-library/react';
import { AppLayout } from '@/components/layout/app-layout';
import { useResponsive } from '@/hooks/common/use-responsive';

// Mock the Navigation component
jest.mock('@/components/layout/navigation', () => ({
  Navigation: () => <div data-testid="navigation-mock">Navigation</div>,
}));

// Mock the useResponsive hook
jest.mock('@/hooks/common/use-responsive', () => ({
  useResponsive: jest.fn(),
}));

describe('AppLayout component', () => {
  it('renders main content with mobile padding on mobile devices', () => {
    // Mock mobile view
    (useResponsive as jest.Mock).mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });
    
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    // Check for main content
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent.style.paddingBottom).toBe('5rem');
    
    // Check navigation only appears once (mobile only)
    const navigationElements = screen.getAllByTestId('navigation-mock');
    expect(navigationElements).toHaveLength(1);
  });

  it('renders desktop layout with side navigation', () => {
    // Mock desktop view
    (useResponsive as jest.Mock).mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
    
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    // Check for main content
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent.style.paddingBottom).toBe('1.5rem');
    
    // Check navigation only appears once (desktop only)
    const navigationElements = screen.getAllByTestId('navigation-mock');
    expect(navigationElements).toHaveLength(1);
  });
});