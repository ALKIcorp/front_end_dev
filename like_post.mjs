import { supabase } from './supabaseClient.mjs';

const USER_ID = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9'; // you

// 1) get the newest post
const { data: latest, error: latestErr } = await supabase
  .from('posts')
  .select('id, caption, likes_count, created_at')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (latestErr || !latest) {
  console.error('❌ Could not find a post:', latestErr?.message || 'no posts yet');
  process.exit(1);
}
console.log('🆕 Target post:', latest.id, '-', latest.caption);

// 2) like it (ignore if already liked)
const { error: likeErr } = await supabase
  .from('post_likes')
  .insert({ post_id: latest.id, user_id: USER_ID });

if (likeErr && likeErr.code === '23505') {
  console.log('ℹ️ Already liked by this user (skipping).');
} else if (likeErr) {
  console.error('❌ Like failed:', likeErr.message);
  process.exit(1);
}

// 3) count likes
const { count, error: countErr } = await supabase
  .from('post_likes')
  .select('*', { count: 'exact', head: true })
  .eq('post_id', latest.id);

if (countErr) {
  console.error('❌ Count failed:', countErr.message);
  process.exit(1);
}
console.log('❤️ Total likes now:', count);

// 4) sync cached counter on posts (optional but handy)
const { error: updErr } = await supabase
  .from('posts')
  .update({ likes_count: count })
  .eq('id', latest.id);

if (updErr) {
  console.error('⚠️ Counter update failed (non-fatal):', updErr.message);
}

// 5) show post summary
const { data: summary } = await supabase
  .from('posts')
  .select('id, caption, likes_count, author:profiles(username)')
  .eq('id', latest.id)
  .single();

console.log('✅ Post summary:', summary);
