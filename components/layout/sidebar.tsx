'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { signOut } from '@/services/auth/auth-service';
import { useResponsive } from '@/hooks/common/use-responsive';
import { zIndex } from '@/utils/z-index';
import { cn } from '@/utils/ui';
import { useSidebar } from '@/hooks/common/use-sidebar';

import {
  Home,
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  BookOpenCheck,
  BarChart3,
  LogIn,
  LogOut,
  User,
  Settings,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

import { UserProfileDisplay } from './user-profile-display';

import styles from './sidebar.module.css';

const navigationItems = [
  { name: 'Home', href: '/home', iconComponent: Home },
  { name: 'Journal', href: '/journal', iconComponent: BookOpen },
  { name: 'Role-play', href: '/roleplay', iconComponent: MessageCircle },
  { name: 'Vocabulary', href: '/vocab', iconComponent: BookOpenCheck },
  { name: 'Report', href: '/report', iconComponent: BarChart3 },
];

interface SidebarProps {
  isDesktopSidebar?: boolean;
}

export function Sidebar({ isDesktopSidebar = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { useBottomNav } = useResponsive();
  const { sidebarOpen } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen]);

  if (isDesktopSidebar && useBottomNav) return null;
  if (!isDesktopSidebar && !useBottomNav) return null;

  if (isDesktopSidebar) {
    return (
      <nav
        className={cn(styles.sidebar, styles.collapsed)}
        style={{
          zIndex: zIndex.desktopNavigation,
        }}
      >
        <div className="flex flex-col items-center h-full py-4 gap-2">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center justify-center mb-4"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.png"
                alt="Write2Learn"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Nav Items */}
          <div className="flex flex-col items-center gap-3 flex-grow">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.iconComponent;
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      styles.navItem,
                      isActive ? styles.active : styles.inactive
                    )}
                  >
                    <Icon
                      size={22}
                      className={cn(
                        'transition-colors duration-200',
                        isActive
                          ? 'stroke-primary fill-primary/10'
                          : 'stroke-gray-500 group-hover:stroke-primary'
                      )}
                    />
                  </Link>

                  {/* Tooltip label */}
                  <span className={styles.tooltip}>{item.name}</span>
                </div>
              );
            })}
          </div>

          {/* User section */}
          <div className="mt-auto pt-4 border-t border-gray-200 w-full flex flex-col items-center">
            {user ? (
              <div className="relative group" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(styles.navItem, styles.inactive)}
                >
                  <User
                    size={22}
                    className="stroke-gray-500 hover:stroke-primary transition-colors duration-200"
                  />
                </button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className="absolute left-14 bottom-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <UserProfileDisplay />
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        Cá nhân hóa
                      </Link>

                      <Link
                        href="/account"
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        Tài khoản
                      </Link>

                      <Link
                        href="/feedback"
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <MessageSquare size={16} />
                        Feedback
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={async () => {
                            setIsProfileOpen(false);
                            await signOut();
                            router.push('/');
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tooltip label */}
                <span className={styles.tooltip}>Profile</span>
              </div>
            ) : (
              <Link
                href="/auth"
                className={cn(styles.navItem, styles.inactive)}
              >
                <LogIn
                  size={22}
                  className="stroke-gray-500 hover:stroke-primary transition-colors duration-200"
                />
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Mobile bottom nav (giữ nguyên)
  return (
    <nav
      className={styles.mobileNav}
      style={{ zIndex: zIndex.mobileNavigation }}
    >
      <div className="flex justify-around items-center py-2 px-1">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.iconComponent;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                styles.navItem,
                isActive ? styles.active : styles.inactive,
                'flex-col'
              )}
            >
              <Icon
                size={24}
                className={cn(
                  isActive
                    ? 'stroke-primary fill-primary/10'
                    : 'stroke-gray-500'
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
