import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hvsizlpfawzdootzaink.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HFrIN03jki5AhvMt1H-DcA_Wk7NJG3F';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper for standard REST headers if needed for direct fetch
export const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};
