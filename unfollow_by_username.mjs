import { supabase } from './supabaseClient.mjs';

const ME = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9'; // you
const username = process.argv[2];

if (!username) {
  console.log('Usage: node unfollow_by_username.mjs <username>');
  process.exit(1);
}

// 1) find target by username (case-insensitive)
const { data: target, error: findErr } = await supabase
  .from('profiles')
  .select('id, username')
  .ilike('username', username)
  .limit(1)
  .maybeSingle();

if (findErr) {
  console.error('❌ Lookup failed:', findErr.message);
  process.exit(1);
}
if (!target) {
  console.log('⚠️ No user found with username:', username);
  process.exit(0);
}
if (target.id === ME) {
  console.log('ℹ️ You cannot unfollow yourself.');
  process.exit(0);
}

// 2) delete the follow row if it exists
const { data: delRows, error: delErr } = await supabase
  .from('follows')
  .delete()
  .eq('follower', ME)
  .eq('following', target.id)
  .select();

if (delErr) {
  console.error('❌ Unfollow failed:', delErr.message);
  process.exit(1);
}
if (!delRows || delRows.length === 0) {
  console.log(`ℹ️ You were not following ${target.username}.`);
} else {
  console.log(`✅ Unfollowed ${target.username}.`);
}

// 3) show updated following list
const { data: iFollow, error: listErr } = await supabase
  .from('follows')
  .select(`following:profiles!follows_following_fkey (username)`)
  .eq('follower', ME)
  .order('following(username)', { ascending: true });

if (listErr) {
  console.error('❌ List failed:', listErr.message);
  process.exit(1);
}

console.log('🗂 You now follow:', iFollow.map(r => r.following.username));
