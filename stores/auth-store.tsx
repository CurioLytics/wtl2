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
    // Track mounted state to prevent state updates after unmount
    let mounted = true;
    
    const checkUser = async () => {
      try {
        const { user, error } = await getCurrentUser();
        
        // Only continue if component is still mounted
        if (!mounted) return;
        
        if (user) {
          const supabase = createClientComponentClient();
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (mounted) {
            setOnboardingCompleted(Boolean(profile?.onboarding_completed));
          }
        }

        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Initial auth check
    checkUser();
    
    // Set up auth state subscription
    const supabase = createClientComponentClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        // Update user state when auth state changes
        setUser(session?.user || null);
        
        // Check onboarding status if user exists
        if (session?.user) {
          (async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();
              
            if (mounted) {
              setOnboardingCompleted(Boolean(profile?.onboarding_completed));
            }
          })();
        }
      }
    );

    // Cleanup subscription when component unmounts
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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