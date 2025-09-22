export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  tables: {
    profiles: 'profiles',
    journals: 'journals',
    templates: 'journal_template',
    vocabulary: 'vocabulary'
  }
};