import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabase } from './supabaseClient.mjs';

try {
  const { data, error } = await supabase
    .from('profiles')          // this table might not exist yet
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === '42P01') {
      console.log('✅ Supabase is reachable. Table missing (expected if you haven’t run the schema SQL yet).');
    } else {
      console.error('❌ Supabase responded with an error:', error);
    }
  } else {
    console.log('✅ Connected and query worked. profiles rows:', data.length);
  }
} catch (e) {
  console.error('❌ Network/URL/key problem (check URL & anon key):', e.message);
}
