import { createClient } from '@supabase/supabase-js'

// ⬇️ Replace these with your real values from Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://tvpmccbcotzdgoffkfsz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cG1jY2Jjb3R6ZGdvZmZrZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg2MDcsImV4cCI6MjA3MDg3NDYwN30.aXV6rDyZIelh3jgxOA70Xej-RVeUhnnvoQKQ1gRNmQA'
// Note: Keep your keys secret and never expose them in client-side code'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
