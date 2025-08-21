// Posts: fetch + render + create post modal
import { supabase } from './supabaseClient.js';
import { $, $all, escapeHtml } from './ui.js';
import { hydrateLikes } from './likes.js';

export const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/150/efefef/777?text=User';

export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      caption,
      media_url,
      media_type,
      created_at,
      likes_count,
      author:profiles!posts_author_fkey(id, username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPostsByAuthorId(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, caption, media_url, media_type, created_at, likes_count')
    .eq('author', authorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentUserAndProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: prof } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  return { user, profile: prof || null };
}

// ====== RENDER HELPERS ======
export function postCardHTML({ id, caption, media_url, media_type, created_at, author }) {
  const avatar = author?.avatar_url || PLACEHOLDER_AVATAR;
  const username = author?.username || 'unknown';
  const isImage = media_type === 'image' && !!media_url;

  const postHeader = `
    <div class="post-header">
      <img src="${escapeHtml(avatar)}" alt="${escapeHtml(username)}" class="user-avatar"/>
      <a class="user-name" data-username="${escapeHtml(username)}" href="#/@${escapeHtml(username)}">${escapeHtml(username)}</a>
    </div>`;

  const media = isImage
    ? `<div class="post-image-container"><img class="post-image" src="${escapeHtml(media_url)}" alt="Post image"/></div>`
    : `<div class="post-caption text-only-post"><p>${escapeHtml(caption || '')}</p></div>`;

  const actions = `
    <div class="post-actions" data-postid="${id}">
      <button class="like-btn" data-postid="${id}" aria-pressed="false">❤️</button>
      <span class="like-count" data-postid="${id}" data-count="0">0</span>
    </div>`;

  const captionBlock = isImage
    ? `<div class="post-caption"><p>${escapeHtml(caption || '')}</p></div>`
    : '';

  return `<article class="post" data-postid="${id}">
    ${postHeader}
    ${media}
    ${actions}
    ${captionBlock}
  </article><span class="margin-between-posts"></span>`;
}

export function profileGridHTML(posts) {
  return `<div class="profile-grid">
    ${posts.map(p => `
      <div class="profile-grid-item">
        ${p.media_type === 'image' && p.media_url
          ? `<img src="${escapeHtml(p.media_url)}" alt=""/>`
          : `<div class="profile-grid-text">${escapeHtml(p.caption || '')}</div>`}
      </div>`).join('')}
  </div>`;
}

// ====== RENDER SCREENS ======
export async function renderHomePage() {
  const contentArea = $('#content-area');
  contentArea.innerHTML = `<div id="posts-feed"></div>`;
  try {
    const feedPosts = await fetchPosts();
    $('#posts-feed').innerHTML = feedPosts.map(postCardHTML).join('');
    attachUsernameClicks();
    await hydrateLikes(feedPosts);
  } catch (e) {
    $('#posts-feed').innerHTML = `<div class="no-posts-message">Failed to load posts: ${escapeHtml(e.message)}</div>`;
  }
}

export async function renderProfilePageByUsername(username) {
  const contentArea = $('#content-area');
  contentArea.innerHTML = `<div class="profile-container">
    <div class="profile-header">
      <img class="profile-pic" id="profile-pic" src="${PLACEHOLDER_AVATAR}" alt=""/>
      <div class="profile-info">
        <h2 id="profile-username">@${escapeHtml(username)}</h2>
        <p id="profile-display"></p>
        <p id="profile-bio"></p>
      </div>
    </div>
    <div id="profile-posts"></div>
  </div>`;

  const prof = await fetchProfileByUsername(username);
  if (!prof) {
    contentArea.innerHTML = `<div class="no-posts-message">No such user.</div>`;
    return;
  }
  $('#profile-pic').src = prof.avatar_url || PLACEHOLDER_AVATAR;
  $('#profile-display').textContent = prof.display_name || '';
  $('#profile-bio').textContent = prof.bio || '';

  const posts = await fetchPostsByAuthorId(prof.id);
  $('#profile-posts').innerHTML = profileGridHTML(posts);
}

export function attachUsernameClicks() {
  document.querySelectorAll('.user-name[data-username]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const u = a.getAttribute('data-username');
      if (u) window.location.hash = `#/@${u}`;
    });
  });
}

export async function initSidebarCurrentUser() {
  const card = $('#current-user-card');
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) {
    card.innerHTML = `<div class="guest-card">Not signed in</div>`;
    return;
  }
  const avatar = profile?.avatar_url || PLACEHOLDER_AVATAR;
  const username = profile?.username || 'me';
  card.innerHTML = `
    <div class="current-user">
      <img class="user-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(username)}"/>
      <div class="user-meta">
        <div class="bold">@${escapeHtml(username)}</div>
        <div>${escapeHtml(profile?.display_name || '')}</div>
      </div>
    </div>`;
}

// ====== CREATE POST MODAL ======
export function wireCreatePostModal() {
  const modal = document.getElementById('create-post-modal');
  const openBtn = document.getElementById('create-post-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-post');
  const form = document.getElementById('create-post-form');

  // open/close
  openBtn?.addEventListener('click', (e) => { e.preventDefault(); modal?.classList.add('active'); });
  closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
  cancelBtn?.addEventListener('click', () => modal?.classList.remove('active'));
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  // type toggle
  const typeBtns = form?.querySelectorAll('.post-type-buttons button');
  const imageGroup = document.getElementById('image-input-group');
  const textGroup = document.getElementById('text-input-group');
  typeBtns?.forEach(btn => btn.addEventListener('click', () => {
    typeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const t = btn.getAttribute('data-type');
    imageGroup.style.display = (t === 'image') ? '' : 'none';
    textGroup.style.display = (t === 'text') ? '' : 'none';
  }));

  // submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = form.querySelector('.post-type-buttons .active')?.getAttribute('data-type') || 'image';
    const caption = document.getElementById('post-caption').value || '';
    const media_url = type === 'image' ? document.getElementById('post-image').value || null : null;
    const media_type = type === 'image' ? 'image' : 'text';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in'); return; }

    const { error } = await supabase.from('posts').insert({
      author: user.id, caption, media_url, media_type
    });
    if (error) { alert('Failed to create post: ' + error.message); return; }
    modal?.classList.remove('active');
    await renderHomePage();
  });
}
