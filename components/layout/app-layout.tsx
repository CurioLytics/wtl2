'use client';

import { Navigation } from './navigation';
import { useResponsive } from '@/hooks/common/use-responsive';
import { useTransitionStyles } from '@/hooks/common/use-transition-styles';
import { SidebarProvider, useSidebar } from '@/hooks/common/use-sidebar';

type AppLayoutProps = {
  children: React.ReactNode;
};

// Create an inner layout component that uses the sidebar context
function AppLayoutInner({ children }: AppLayoutProps) {
  // Use our shared responsive hooks with updated breakpoints
  const { useBottomNav, useCollapsibleSidebar, useFixedSidebar } = useResponsive();
  const { contentStyles } = useTransitionStyles();
  const { sidebarOpen } = useSidebar();
  
  // Determine if this is a processing page where we should hide navigation
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isProcessingPage = [
    '/journal/new',
    '/flashcards/create',
    '/roleplay/session'
  ].some(path => pathname.includes(path));
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Only rendered on tablet/desktop if not a processing page */}
      {!useBottomNav && !isProcessingPage && <Navigation isDesktopSidebar={true} />}
      
      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col"
        style={{
          transition: 'all 0.3s ease-in-out',
          width: '100%',
        }}
      >
        {/* Content with responsive padding based on sidebar state */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{
            ...contentStyles,
            transition: 'all 0.3s ease-in-out',
            // Add bottom padding on mobile for the navigation bar
            paddingBottom: useBottomNav && !isProcessingPage ? '4rem' : contentStyles.paddingBottom,
            // Add left padding on desktop/tablet if sidebar is visible
            paddingLeft: (!useBottomNav && !isProcessingPage) ? 
              (sidebarOpen ? '1rem' : '0.5rem') : 
              contentStyles.paddingLeft,
          }}
        >
          {children}
        </main>
      </div>
      
      {/* Bottom Navigation for mobile - hide on processing pages */}
      {useBottomNav && !isProcessingPage && <Navigation isDesktopSidebar={false} />}
    </div>
  );
}

// Main layout component that provides the sidebar context
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}