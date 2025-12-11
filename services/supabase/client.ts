import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/types/database.types';

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseInstance;
};

// Singleton instance for direct imports
export const supabase = createClient();

// Backwards compatibility for code calling createFreshClient (though we recommend using the singleton)
export const createFreshClient = () => {
  console.warn('Using createFreshClient with createBrowserClient. Prefer using the singleton.');
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export default supabase;