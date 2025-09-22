'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useResponsive } from '@/hooks/common/use-responsive';
import { useTransitionStyles } from '@/hooks/common/use-transition-styles';
import { useSidebar } from '@/hooks/common/use-sidebar';
import { zIndex } from '@/utils/z-index';
import { cn } from '@/utils/ui';
import styles from './navigation.module.css';
import { LucideIcon } from 'lucide-react';

type NavigationItem = {
  name: string;
  href: string;
  icon: string;
  activeIcon?: string;
  iconComponent: LucideIcon;
};

import { Home, BookOpen, MessageCircle, BookOpenCheck, LogIn, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: '/icons/home.svg',
    iconComponent: Home
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: '/icons/book.svg',
    activeIcon: '/icons/book-filled.svg',
    iconComponent: BookOpen
  },
  {
    name: 'Role-play',
    href: '/roleplay',
    icon: '/icons/message-circle.svg',
    iconComponent: MessageCircle
  },
  {
    name: 'Vocab Hub',
    href: '/vocab',
    icon: '/icons/flashcard.svg',
    iconComponent: BookOpenCheck
  },
];

interface NavigationProps {
  isDesktopSidebar?: boolean;
}

export function Navigation({ isDesktopSidebar = false }: NavigationProps) {
  const pathname = usePathname();
  const { isMobile, isTablet, isDesktop, useBottomNav, useCollapsibleSidebar, useFixedSidebar } = useResponsive();
  const { navigationStyles, getContainerTransition } = useTransitionStyles();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  // Auto-collapse sidebar on tablet but keep it expanded on desktop
  useEffect(() => {
    if (useCollapsibleSidebar && isDesktopSidebar) {
      // On tablet, default to collapsed sidebar
      toggleSidebar();
    }
  }, [useCollapsibleSidebar, isDesktopSidebar]);

  // Don't render if this is a desktop sidebar and we're on mobile
  if (isDesktopSidebar && useBottomNav) return null;
  
  // Don't render if this is not a desktop sidebar but we are on desktop/tablet
  if (!isDesktopSidebar && !useBottomNav) return null;
  
  return (
    <nav 
      className={cn(
        "bg-white",
        isDesktopSidebar ? 
          cn(styles.desktopSidebar, sidebarOpen ? styles.expanded : styles.collapsed) :
          styles.mobileNav
      )}
      style={{ 
        zIndex: isDesktopSidebar ? zIndex.desktopNavigation : zIndex.mobileNavigation,
      }}
    >
      <div 
        className={cn(
          isDesktopSidebar ? "flex flex-col h-full p-4" : "flex justify-around items-center py-2 px-1"
        )}
      >
        {/* Logo and toggle - only show on desktop/tablet */}
        {isDesktopSidebar && (
          <div className="flex items-center justify-between w-full mb-6">
            {sidebarOpen ? (
              <>
                <Link href="/dashboard">
                  <div className="flex items-center justify-center">
                    <div className="relative w-10 h-10">
                      <Image
                        src="/images/logo.svg"
                        alt="Write2Learn"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </Link>
                
                {/* Toggle Button - Collapse sidebar (show on tablet only) */}
                {useCollapsibleSidebar && (
                  <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mobile-btn tap-highlight-none"
                    aria-label="Collapse sidebar"
                    style={{ minWidth: '44px', minHeight: '44px' }} /* Touch-friendly size */
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
              </>
            ) : (
              /* Toggle Button - Expand sidebar */
              <button 
                onClick={toggleSidebar}
                className="p-2 mx-auto rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mobile-btn tap-highlight-none"
                aria-label="Expand sidebar"
                style={{ minWidth: '44px', minHeight: '44px' }} /* Touch-friendly size */
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div 
          className={cn(
            styles.navItemsContainer,
            isDesktopSidebar ? styles.desktop : styles.mobile,
            isDesktopSidebar && "flex-grow"
          )}
        >
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  styles.navItem,
                  isActive ? styles.active : styles.inactive,
                  isDesktopSidebar && sidebarOpen ? "flex-row justify-start gap-3 px-3 w-full" : "flex-col"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div 
                  className={styles.navIcon} 
                  aria-hidden="true"
                >
                  <item.iconComponent 
                    size={24} 
                    className={cn(
                      "stroke-current", 
                      isActive ? "stroke-primary fill-primary/10" : "stroke-gray-500"
                    )}
                  />
                </div>
                {/* Always render text for screen readers, visually hide it when sidebar is closed */}
                <span 
                  className={cn(
                    styles.navLabel,
                    isDesktopSidebar && "text-sm",
                    isDesktopSidebar && !sidebarOpen && "sr-only"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User Menu - only on desktop/tablet sidebar */}
        {isDesktopSidebar && (
          <div className="mt-auto border-t border-gray-200 pt-4 w-full">
            <Link
              href="/profile"
              className={cn(
                styles.navItem,
                styles.inactive,
                sidebarOpen ? "flex-row justify-start gap-3 px-3" : "flex-col",
                "w-full"
              )}
            >
              <div 
                className={styles.navIcon}
                aria-hidden="true"
              >
                <LogOut 
                  size={24} 
                  className="stroke-gray-500" 
                />
              </div>
              <span 
                className={cn(
                  styles.navLabel,
                  sidebarOpen ? "text-sm font-medium" : "sr-only"
                )}
              >
                Profile
              </span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}