import { supabase } from './supabaseClient.mjs';

// latest 10 posts with author info (disambiguate the join)
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    caption,
    media_url,
    created_at,
    author:profiles!posts_author_fkey (
      id,
      username,
      avatar_url
    )
  `)
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('❌ Read failed:', error.message || error);
  process.exit(1);
}

console.log('🗂 Feed:', data);
