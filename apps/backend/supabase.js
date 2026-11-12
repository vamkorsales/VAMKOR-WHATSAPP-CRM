// Polyfill WebSocket globally for Node.js environments < 22
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = require('ws');
}

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Preconfigured default Supabase project details.
// To bypass Row Level Security (RLS) for admin actions (like listing/creating agents),
// configure your actual secret service_role key in apps/backend/.env.
const supabaseUrl = process.env.SUPABASE_URL || 'https://vdfvtjyqmqvipknkcfvj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_H2bPeQFKaiH63mVQPpFhKw_TepztRIA';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('========================================================================');
  console.warn('[Supabase Warning] Running using default public publishable anon key.');
  console.warn('For full admin privileges (such as managing agency agents), please');
  console.warn('provide your secret service_role key inside apps/backend/.env.');
  console.warn('========================================================================');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

module.exports = { supabase };
