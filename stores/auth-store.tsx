'use client'

import { createContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getCurrentUser, signOut as authSignOut } from '@/services/api/auth-service';
import { AuthContextType } from '@/hooks/auth/use-auth';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  onboardingCompleted: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { user, error } = await getCurrentUser();
      
      if (user) {
        const supabase = createClientComponentClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        setOnboardingCompleted(Boolean(profile?.onboarding_completed));
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  const signOut = async () => {
    await authSignOut();
  };

  const value = {
    user,
    loading,
    signOut,
    onboardingCompleted,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};