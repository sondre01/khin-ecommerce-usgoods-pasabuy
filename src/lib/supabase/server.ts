import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Server-side Supabase client for Next.js App Router route handlers and server components
 */
export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Can happen in Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Can happen in Server Components
        }
      },
    },
  });
}

/**
 * Direct Supabase API client for background sync and server tasks
 */
export function getSupabaseServiceClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
}
