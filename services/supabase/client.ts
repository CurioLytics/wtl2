import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from '@/types/database.types'

// Create a client for use in browser components
export const supabase = createClientComponentClient<Database>()

// Re-export the createClientComponentClient for explicit usage when needed
export { createClientComponentClient }