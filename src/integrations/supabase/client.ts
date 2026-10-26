import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Missing backend configuration must not prevent the public site from rendering.
function initializeClient(): SupabaseClient<Database> | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  try {
    return createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch {
    return null;
  }
}

export const supabase = initializeClient();
