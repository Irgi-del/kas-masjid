import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://vviakvrwcnffcyrsokiz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GaQUtG-5q6pBDhWng53hlQ_Q7YsXCCG';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (envUrl && !envUrl.includes('your-supabase-project-id') && envUrl.startsWith('http')) 
  ? envUrl 
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConnected = () => Boolean(supabase);
