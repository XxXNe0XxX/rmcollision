import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/** Public client — scoped to the authenticated user via RLS. */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * Admin client — uses the service_role key to bypass RLS.
 * Never expose this key to the browser; only use it in protected
 * server-side routes or internal admin dashboards.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
