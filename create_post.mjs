import { supabase } from './supabaseClient.mjs';

const USER_ID = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9'; // your profile id

// make one text-only post
const { data: inserted, error } = await supabase
  .from('posts')
  .insert({ author: USER_ID, caption: 'Hello from OnlyCats 🐾', media_type: 'none' })
  .select('id, caption, created_at')
  .limit(1);

if (error) {
  console.error('❌ Insert failed:', error.message);
  process.exit(1);
}

console.log('✅ Inserted post:', inserted[0]);
