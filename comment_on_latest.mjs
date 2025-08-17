import { supabase } from './supabaseClient.mjs';

const USER_ID = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9'; // you

// 1) get the newest post
const { data: latest, error: latestErr } = await supabase
  .from('posts')
  .select('id, caption, created_at')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (latestErr || !latest) {
  console.error('❌ No post found to comment on:', latestErr?.message || 'none');
  process.exit(1);
}
console.log('🆕 Commenting on post:', latest.id, '-', latest.caption);

// 2) add a comment
const { data: inserted, error: insertErr } = await supabase
  .from('post_comments')
  .insert({
    post_id: latest.id,
    author: USER_ID,
    body: 'Nice cat! 😺'
  })
  .select('id, body, created_at')
  .single();

if (insertErr) {
  console.error('❌ Insert comment failed:', insertErr.message);
  process.exit(1);
}
console.log('✅ Added comment:', inserted);

// 3) list recent comments for that post (with author info)
const { data: comments, error: listErr } = await supabase
  .from('post_comments')
  .select(`
    id,
    body,
    created_at,
    author:profiles!post_comments_author_fkey (
      id,
      username,
      avatar_url
    )
  `)
  .eq('post_id', latest.id)
  .order('created_at', { ascending: false })
  .limit(10);

if (listErr) {
  console.error('❌ List comments failed:', listErr.message);
  process.exit(1);
}

console.log('🗂 Comments:', comments);
