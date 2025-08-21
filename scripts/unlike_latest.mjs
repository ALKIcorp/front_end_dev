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

// 2) toggle like atomically via RPC (this will unlike if you already liked)
const { data: toggled, error: rpcErr } = await supabase.rpc('toggle_like', { p_post_id: latest.id });
if (rpcErr) {
  console.error('❌ toggle_like failed:', rpcErr.message);
  process.exit(1);
}
const row = Array.isArray(toggled) ? toggled[0] : toggled;
console.log(`🔁 Toggled. liked=${row.liked} | likes_count=${row.likes_count}`);


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
