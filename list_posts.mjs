import { supabase } from './supabaseClient.mjs';

// get latest posts and the author's public info
const { data, error } = await supabase
  .from('posts')
  .select('id, caption, created_at, author:profiles(id, username, avatar_url)')
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('❌ Read failed:', error.message);
  process.exit(1);
}

console.log('🗂 Recent posts:', data);
