import { supabase } from './supabaseClient.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const USER_ID = '91dfc61f-f303-4fb1-b232-3d554d3a2ce9'; // your profile id

// 🔁 PNG version
const localPath = path.resolve('assets/cat_post1.png'); // your file
const bytes = await fs.readFile(localPath);

const objectPath = `posts/${randomUUID()}.png`;

const { data: up, error: upErr } = await supabase.storage
  .from('cats')
  .upload(objectPath, bytes, { contentType: 'image/png', upsert: false });

if (upErr) {
  console.error('❌ Upload failed:', upErr.message);
  process.exit(1);
}
console.log('📦 Uploaded to:', objectPath);

const { data: pub } = supabase.storage.from('cats').getPublicUrl(objectPath);
const mediaUrl = pub.publicUrl;
console.log('🔗 Public URL:', mediaUrl);

const { data: post, error: postErr } = await supabase
  .from('posts')
  .insert({
    author: USER_ID,
    caption: 'First image post 🐱 (png)',
    media_type: 'image',
    media_url: mediaUrl
  })
  .select('id, caption, media_url, created_at')
  .single();

if (postErr) {
  console.error('❌ Post insert failed:', postErr.message);
  process.exit(1);
}
console.log('✅ Created post:', post);
