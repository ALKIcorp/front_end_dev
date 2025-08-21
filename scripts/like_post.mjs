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

// 2) toggle like atomically on the server and get the truth back
const { data: toggled, error: rpcErr } = await supabase.rpc('toggle_like', { p_post_id: latest.id });
if (rpcErr) {
  console.error('❌ toggle_like failed:', rpcErr.message);
  process.exit(1);
}
const row = Array.isArray(toggled) ? toggled[0] : toggled;
console.log(`❤️ Toggled. liked=${row.liked} | likes_count=${row.likes_count}`);

// 3) show post summary from posts.likes_count (server truth)
const { data: summary, error: sumErr } = await supabase
  .from('posts')
  .select('id, caption, likes_count, author:profiles(username)')
  .eq('id', latest.id)
  .single();

if (sumErr) {
  console.error('⚠️ Could not read updated post:', sumErr.message);
  process.exit(1);
}
console.log('✅ Post summary:', summary);

