import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY?.trim());

if (!rawUrl) {
  throw new Error('[Supabase] VITE_SUPABASE_URL is missing or empty. Please define it in your .env and in the Vercel project settings.');
}
if (!rawKey) {
  throw new Error('[Supabase] VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is missing or empty.');
}

export const supabase = createClient(rawUrl, rawKey);
