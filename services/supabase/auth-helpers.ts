import { createClient } from '@/services/supabase/client';

export const createSupabaseClient = () => {
  return createClient();
};