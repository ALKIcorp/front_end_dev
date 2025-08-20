import { supabase } from './supabaseClient.mjs';

const ME = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9'; // you

// 1) get who I follow → array of profile IDs
const { data: follows, error: fErr } = await supabase
  .from('follows')
  .select('following')
  .eq('follower', ME);

if (fErr) {
  console.error('❌ Could not read follows:', fErr.message);
  process.exit(1);
}

const authorIds = (follows || []).map(r => r.following);
if (authorIds.length === 0) {
  console.log('ℹ️ You do not follow anyone yet. Home feed is empty.');
  process.exit(0);
}

// 2) fetch latest posts from those authors, with author info
const { data: feed, error: pErr } = await supabase
  .from('posts')
  .select(`
    id,
    caption,
    media_url,
    created_at,
    likes_count,
    author:profiles!posts_author_fkey (
      id, username, avatar_url
    )
  `)
  .in('author', authorIds)
  .order('created_at', { ascending: false })
  .limit(10);


if (pErr) {
  console.error('❌ Could not read posts:', pErr.message);
  process.exit(1);
}

console.log('🏠 Home feed:', feed);
