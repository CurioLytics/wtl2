import { type Provider } from '@supabase/supabase-js';
// Use only one Supabase client instance to avoid auth conflicts
import { supabase } from '../supabase/client';
import { type Database } from '@/types/database.types';

export type AuthError = {
  message: string;
};

import { User } from '@supabase/supabase-js';

// Add caching mechanism for auth operations
let cachedUser: User | null = null;
let cachedUserTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message } as AuthError };
  }

  return { data, error: null };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: { message: error.message } as AuthError };
  }

  return { data, error: null };
}

export async function signInWithProvider(provider: Provider) {
  try {
    // Clear any cached user data before starting new auth flow
    cachedUser = null;
    cachedUserTimestamp = 0;
    
    // Track the login attempt in localStorage for persistence through redirects
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_in_progress', provider);
    }
    
    // Include queryParams to pass additional info (useful for redirects after auth)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Add scopes for additional permissions if needed
        scopes: provider === 'google' ? 'email profile' : undefined,
        // Pass query params to help with redirect logic
        queryParams: provider === 'google' ? {
          // For refresh token (allows for longer sessions)
          access_type: 'offline',
          // Force consent screen to ensure we get refresh token
          prompt: 'consent',
          // Include provider name in redirect for better error handling
          provider: 'google'
        } : undefined
      },
    });

    if (error) {
      console.error(`OAuth error with ${provider}:`, error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_in_progress');
      }
      return { error: { message: error.message } as AuthError };
    }

    return { data, error: null };
  } catch (err) {
    console.error(`Unexpected error during ${provider} sign in:`, err);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_in_progress');
    }
    return { 
      error: { 
        message: `Failed to connect to ${provider}. Please check your internet connection and try again.` 
      } as AuthError 
    };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  // Clear any stored user data from localStorage/sessionStorage
  if (typeof window !== 'undefined') {
    // We'll rely on the provider's useEffect to clear the profile state
    // This is just a safety measure for any other stored auth data
    sessionStorage.removeItem('user-profile-storage');
  }
  
  if (error) {
    return { error: { message: error.message } as AuthError };
  }

  return { error: null };
}

export async function getCurrentUser() {
  // Use cache if available and recent
  const now = Date.now();
  if (cachedUser && now - cachedUserTimestamp < CACHE_DURATION) {
    return { user: cachedUser, error: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: { message: error.message } as AuthError };
  }

  // Update cache
  cachedUser = user;
  cachedUserTimestamp = now;

  return { user, error: null };
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: { message: error.message } as AuthError };
  }

  return { error: null };
}