import { supabase } from './supabaseClient.mjs';

const ME = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9';                 // you
const TARGET = '7b02531a-7c3d-4038-b3fe-567717b748f5';            // LUNA

// 1) follow (ignore if already following)
const { error: insErr } = await supabase
  .from('follows')
  .insert({ follower: ME, following: TARGET });

if (insErr && insErr.code === '23505') {
  console.log('ℹ️ Already following this user (skipping).');
} else if (insErr) {
  console.error('❌ Follow failed:', insErr.message);
  process.exit(1);
} else {
  console.log('✅ Now following.');
}

// 2) list who I follow (with usernames)
const { data: iFollow, error: listErr } = await supabase
  .from('follows')
  .select(`
    following:profiles!follows_following_fkey (
      id, username, avatar_url
    )
  `)
  .eq('follower', ME)
  .order('following(username)', { ascending: true });

if (listErr) {
  console.error('❌ List failed:', listErr.message);
  process.exit(1);
}

console.log('🗂 I follow:', iFollow.map(r => r.following));
