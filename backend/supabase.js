const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Replace these with your actual Supabase project URL and Service Role Key
// They should ideally be stored in backend/.env as SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.SUPABASE_URL || 'https://vdfvtjyqmqvipknkcfvj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'AQZutJ+ZoRV5p8iDF6diFa6M3z7jg1VL4atHxVTIoSoy3x7m4QLT+LHERh/ioPaFylFij11ZA5ncBuOjl9SzQQ==';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
