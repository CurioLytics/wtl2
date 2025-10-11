import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from '@/types/database.types'

/**
 * Create and manage a singleton Supabase client instance to avoid authentication issues.
 * This prevents multiple instances from being created which can lead to auth conflicts
 * and repeated requests to Supabase.
 */
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Use a singleton pattern to ensure only one client is created
export const supabase = typeof window !== 'undefined' 
  ? (supabaseInstance ?? (supabaseInstance = createClientComponentClient<Database>()))
  : createClientComponentClient<Database>(); // SSR requires a new instance

/**
 * WARNING: Only use this when you absolutely need a fresh instance.
 * Using multiple client instances can cause authentication issues.
 * @returns A new Supabase client instance
 * @deprecated Use the singleton `supabase` instance instead
 */
export const createFreshClient = () => {
  console.warn(
    'WARNING: Creating a fresh Supabase client instance. ' +
    'This may cause authentication issues. ' + 
    'Use the singleton instance exported as `supabase` instead.'
  );
  return createClientComponentClient<Database>();
}

// Export singleton instance for direct imports
export default supabase;