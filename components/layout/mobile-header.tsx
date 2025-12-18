'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { useResponsive } from '@/hooks/common/use-responsive';
import { signOut } from '@/services/auth/auth-service';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserProfileDisplay } from './user-profile-display';
import { BrandedText } from '@/components/ui/branded-text';
import { User, Settings, MessageSquare, LogOut, LogIn } from 'lucide-react';

export function MobileHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-40">
      <Link href="/home">
        <h1 className="text-lg cursor-pointer hover:opacity-80 transition-opacity">
          <BrandedText variant="full" />
        </h1>
      </Link>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {user ? (
            <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <User size={20} className="text-gray-700" />
            </button>
          ) : (
            <Link
              href="/auth"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <LogIn size={20} className="text-gray-700" />
            </Link>
          )}
        </SheetTrigger>

        {user && (
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Profile</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {/* User Info */}
              <div className="pb-4 border-b border-gray-200">
                <UserProfileDisplay />
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={20} />
                  <span>Cá nhân hóa</span>
                </Link>

                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} />
                  <span>Tài khoản</span>
                </Link>

                <Link
                  href="/feedback"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare size={20} />
                  <span>Feedback</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    setIsOpen(false);
                    await signOut();
                    router.push('/');
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
