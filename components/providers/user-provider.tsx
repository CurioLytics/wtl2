'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useUserProfileStore, UserProfileData } from '@/stores/user-profile-store';
import { useAuth } from '@/hooks/auth/use-auth';

// Define the context type
interface UserContextType {
  profile: UserProfileData | null;
  isLoadingProfile: boolean;
  profileError: string | null;
}

// Create the context with default values
export const UserContext = createContext<UserContextType>({
  profile: null,
  isLoadingProfile: false,
  profileError: null,
});

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider component that connects auth with profile data
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile, error: profileError, fetchProfile, clearProfile } = useUserProfileStore();

  // Fetch profile when user is authenticated
  useEffect(() => {
    if (user && user.id && !profile) {
      fetchProfile(user.id);
    } else if (!user && profile) {
      // Clear profile when user is logged out
      clearProfile();
    }
  }, [user, profile, fetchProfile, clearProfile]);

  // Prepare context value
  const value = {
    profile,
    isLoadingProfile,
    profileError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}