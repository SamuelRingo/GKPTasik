import { createClient } from '@supabase/supabase-js';

/**
 * Admin client untuk server-side operations dengan akses penuh.
 * JANGAN PERNAH expose key ini ke client-side!
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase URL atau Service Role Key tidak ditemukan. ' +
      'Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah dikonfigurasi di .env.local'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
