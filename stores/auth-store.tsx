'use client'

import { createContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/services/supabase/client';
import { getCurrentUser, signOut as authSignOut } from '@/services/auth-service';
import { AuthContextType } from '@/hooks/auth/use-auth';
import { useUserProfileStore } from '@/stores/user-profile-store';

export interface UserPreferences {
  name: string | null;
  english_level: string | null;
  style: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
  onboardingCompleted: false,
  userPreferences: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const fetchProfile = useUserProfileStore(state => state.fetchProfile);

  useEffect(() => {
    // Track mounted state to prevent state updates after unmount
    let mounted = true;

    const checkUser = async () => {
      try {
        const { user, error } = await getCurrentUser();

        // Only continue if component is still mounted
        if (!mounted) return;

        if (user) {
          const supabase = createClient();
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed, name, english_level, style')
            .eq('id', user.id)
            .single();

          if (mounted) {
            setOnboardingCompleted(Boolean(profile?.onboarding_completed));
            setUserPreferences({
              name: profile?.name || null,
              english_level: profile?.english_level || null,
              style: profile?.style || null,
            });

            // Cache full profile data including goals
            await fetchProfile(user.id);
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
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Update user state when auth state changes
        setUser(session?.user || null);

        // Check onboarding status and preferences if user exists
        if (session?.user) {
          (async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed, name, english_level, style')
              .eq('id', session.user.id)
              .single();

            if (mounted) {
              setOnboardingCompleted(Boolean(profile?.onboarding_completed));
              setUserPreferences({
                name: profile?.name || null,
                english_level: profile?.english_level || null,
                style: profile?.style || null,
              });

              // Cache full profile data including goals
              await fetchProfile(session.user.id);
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
    userPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};