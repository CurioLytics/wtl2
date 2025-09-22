'use client';

import { useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthContext } from '@/stores/auth-store';

// A custom hook to get access to the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  onboardingCompleted: boolean;
}