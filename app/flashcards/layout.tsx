'use client';

import { AppLayout } from '@/components/layout/app-layout';

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}