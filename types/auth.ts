import { User } from '@supabase/supabase-js';

export type AuthError = {
  message: string;
};

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export interface SignInResponse {
  data: any;
  error: AuthError | null;
}

export interface SignUpResponse {
  data: any;
  error: AuthError | null;
}