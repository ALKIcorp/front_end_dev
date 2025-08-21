// Supabase client (shared)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const SUPABASE_URL = 'https://tvpmccbcotzdgoffkfsz.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cG1jY2Jjb3R6ZGdvZmZrZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg2MDcsImV4cCI6MjA3MDg3NDYwN30.aXV6rDyZIelh3jgxOA70Xej-RVeUhnnvoQKQ1gRNmQA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
