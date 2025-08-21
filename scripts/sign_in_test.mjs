import { supabase } from './supabaseClient.mjs';

const EMAIL = 'alkibiades.corp@gmail.com';   // your first user’s email
const PASSWORD = '!Onlycats1';   // replace with the password you set

async function main() {
  const { data: signedIn, error: signErr } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (signErr) {
    console.error('❌ Sign-in failed:', signErr.message);
    process.exit(1);
  }
  console.log('🔐 Signed in as:', signedIn.user.email);

  const { data: me, error: meErr } = await supabase.auth.getUser();
  if (meErr || !me?.user?.id) {
    console.error('❌ Could not read user after sign-in:', meErr?.message || 'no user');
    process.exit(1);
  }
  const myId = me.user.id;
  console.log('🙋 My user id:', myId);

  const { data: post, error: postErr } = await supabase
    .from('posts')
    .insert({
      author: myId,
      caption: 'Post while signed in (RLS ✅)',
      media_type: 'none',
    })
    .select('id, caption, created_at')
    .single();

  if (postErr) {
    console.error('❌ Insert blocked:', postErr.message);
    process.exit(1);
  }

  console.log('✅ Created post:', post);
}

main();
