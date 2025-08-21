import { supabase } from './supabaseClient.mjs';

const USER_ID = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9';

try {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .eq('id', USER_ID)
    .maybeSingle();

  if (error) {
    console.error('❌ Error reading profile:', error);
  } else if (!data) {
    console.log('⚠️ No profile found for that user id.');
  } else {
    console.log('✅ Profile:', data);
  }
} catch (e) {
  console.error('❌ Network/URL/key problem:', e.message);
}
