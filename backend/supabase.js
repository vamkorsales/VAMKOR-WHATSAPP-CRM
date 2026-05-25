const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Replace these with your actual Supabase project URL and Service Role Key
// They should ideally be stored in backend/.env as SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
