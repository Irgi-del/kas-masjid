import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    if (!url || url.includes('your-supabase-project-id') || !url.startsWith('http')) return false;
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const isConfigured = isValidUrl(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConnected = () => Boolean(supabase);
