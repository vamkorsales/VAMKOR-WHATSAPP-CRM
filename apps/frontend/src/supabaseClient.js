import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and Anon Key
// They should ideally be stored in frontend/.env as REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);