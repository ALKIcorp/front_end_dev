import { supabase } from './supabaseClient.mjs';

const USER_ID = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9';

// 1) get newest post
const { data: latest, error: latestErr } = await supabase
  .from('posts')
  .select('id, caption, likes_count, created_at')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (latestErr || !latest) {
  console.error('❌ No post found:', latestErr?.message || 'none');
  process.exit(1);
}
console.log('🆕 Target post:', latest.id, '-', latest.caption, '| likes_count:', latest.likes_count);

// 2) delete your like for that post (if it exists)
const { data: delRows, error: delErr } = await supabase
  .from('post_likes')
  .delete()
  .eq('post_id', latest.id)
  .eq('user_id', USER_ID)
  .select(); // return deleted rows so we know if anything changed

if (delErr) {
  console.error('❌ Unlike failed:', delErr.message);
  process.exit(1);
}
if (!delRows || delRows.length === 0) {
  console.log('ℹ️ There was no like from this user to remove.');
} else {
  console.log('🗑 Removed like rows:', delRows.length);
}

// 3) read the post again to see the trigger-updated counter
const { data: summary, error: sumErr } = await supabase
  .from('posts')
  .select('id, caption, likes_count')
  .eq('id', latest.id)
  .single();

if (sumErr) {
  console.error('⚠️ Could not read updated post:', sumErr.message);
  process.exit(1);
}
console.log('✅ Updated post:', summary);
