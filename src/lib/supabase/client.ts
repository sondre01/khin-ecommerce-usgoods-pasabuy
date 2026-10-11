import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Browser-side Supabase client using @supabase/ssr
 */
export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}

/**
 * Singleton client instance for general client-side queries
 */
export const supabase = supabaseUrl && supabaseKey 
  ? createSupabaseClient(supabaseUrl, supabaseKey)
  : null;
