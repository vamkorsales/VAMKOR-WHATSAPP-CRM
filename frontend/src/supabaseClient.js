import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and Anon Key
// They should ideally be stored in frontend/.env as REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vdfvtjyqmqvipknkcfvj.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_H2bPeQFKaiH63mVQPpFhKw_TepztRIA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);