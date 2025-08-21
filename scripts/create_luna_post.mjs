import { supabase } from './supabaseClient.mjs';

const LUNA_ID = '7b02531a-7c3d-4038-b3fe-567717b748f5';

const { data, error } = await supabase
  .from('posts')
  .insert({
    author: LUNA_ID,
    caption: "Meow! Luna's first post 🐾",
    media_type: 'none'
  })
  .select('id, caption, created_at')
  .single();

if (error) {
  console.error('❌ Insert failed:', error.message);
  process.exit(1);
}
console.log('✅ Luna posted:', data);
