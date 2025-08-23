// public/js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ USE YOUR REAL PROJECT URL + ANON KEY HERE
export const SUPABASE_URL = 'https://tvpmccbcotzdgoffkfsz.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cG1jY2Jjb3R6ZGdvZmZrZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg2MDcsImV4cCI6MjA3MDg3NDYwN30.aXV6rDyZIelh3jgxOA70Xej-RVeUhnnvoQKQ1gRNmQA'; // ← replace me

// Runtime sanity check so we don't "freeze" quietly
if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  /PASTE_YOUR|YOUR_ANON|^$/.test(String(SUPABASE_ANON_KEY))
) {
  const msg = 'Supabase is not configured: update SUPABASE_URL and SUPABASE_ANON_KEY in public/js/supabaseClient.js';
  console.error(msg, { SUPABASE_URL, SUPABASE_ANON_KEY_present: !!SUPABASE_ANON_KEY });
  // Visible hint during dev
  alert(msg);
  // Throw so no further auth calls try to run
  throw new Error(msg);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
