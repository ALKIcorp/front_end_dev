import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ⬇️ It's recommended to store these as environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Note: Keep your keys secret and never expose them in client-side code

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
