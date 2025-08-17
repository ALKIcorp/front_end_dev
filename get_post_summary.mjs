import { supabase } from './supabaseClient.mjs';

// Fetch newest post + join the author via the specific FK on posts.author
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    caption,
    likes_count,
    created_at,
    author:profiles!posts_author_fkey (
      id,
      username,
      avatar_url
    )
  `)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (error) {
  console.error('❌ Summary fetch error:', error.message || error);
  process.exit(1);
}

if (!data) {
  console.log('⚠️ No post found.');
} else {
  console.log('✅ Post summary:', data);
}
