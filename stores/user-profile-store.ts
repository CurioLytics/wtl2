'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createClient } from '@/services/supabase/client';

// Define the user profile type based on the database schema
export interface UserProfileData {
  id: string;
  name: string | null;
  english_level: string | null;
  style: string | null;
  daily_review_goal: number | null;
  daily_vocab_goal: number | null;
  daily_journal_goal: number | null;
  daily_roleplay_goal: number | null;
  updated_at: string | null;
  onboarding_completed: boolean;
}

interface UserProfileState {
  profile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: (profile: UserProfileData | null) => void;
  clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: null as UserProfileData | null,
      isLoading: false,
      error: null,

      fetchProfile: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });

          const supabase = createClient();
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, english_level, style, daily_review_goal, daily_vocab_goal, daily_journal_goal, daily_roleplay_goal, updated_at, onboarding_completed')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          set({
            profile: data as UserProfileData,
            isLoading: false
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
          console.error('Unexpected error fetching profile:', err);
          set({ error: errorMessage, isLoading: false });
        }
      },

      setProfile: (profile: UserProfileData | null) => {
        set({ profile });
      },

      clearProfile: () => {
        set({ profile: null, error: null });
      },
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);