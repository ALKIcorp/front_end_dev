// Posts: fetch + render + create post modal
import { supabase } from './supabaseClient.js';
import { $, $all, escapeHtml, formatTimestamp } from './ui.js';
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
      <span class="post-timestamp" data-timestamp="${created_at}">${formatTimestamp(created_at)}</span>
    </div>`;

  const media = isImage
    ? `<div class="post-image-container"><img class="post-image" src="${media_url}" alt="Post image"/></div>`
    : '';

  const actions = `
    <div class="post-actions" data-postid="${id}">
      <button class="like-btn" data-postid="${id}" aria-pressed="false">♡ Like</button>
      <span class="like-count" data-postid="${id}" data-count="0">0</span>
    </div>`;

  const captionBlock = isImage
    ? `<div class="post-caption"><p><strong>${escapeHtml(username)}</strong> ${escapeHtml(caption || '')}</p></div>`
    : `<div class="post-caption text-only-post"><p>${escapeHtml(caption || '')}</p></div>`;

  const postClass = isImage ? 'post' : 'post text-only-post';

  return `<article class="${postClass}" data-postid="${id}">
    ${postHeader}
    ${media}
    ${captionBlock}
    ${actions}
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
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const u = a.getAttribute('data-username');
      if (u) {
        window.location.hash = `#/@${u}`;
        await renderProfilePageByUsername(u);
      }
    });
  });
}

export async function initSidebarCurrentUser() {
  const card = $('#current-user-card');
  const { user, profile } = await getCurrentUserAndProfile();
  const headerPfp = $('#header-profile-pic'); // Added for dropdown profile pic
  if (!user) {
    card.innerHTML = `<div class="guest-card">Not signed in</div>`;
    headerPfp && (headerPfp.src = PLACEHOLDER_AVATAR); // Set placeholder for dropdown pic
    return;
  }
  const avatar = profile?.avatar_url || PLACEHOLDER_AVATAR;
  const username = profile?.username || 'me';
  card.innerHTML = `
    <div class="sidebar-profile">
      <img id="current-user-pfp" src="${escapeHtml(avatar)}" alt="${escapeHtml(username)}" class="profile-pic"/>
      <div class="sidebar-profile-info">
        <div id="current-user-username" class="username">@${escapeHtml(username)}</div>
        <div id="current-user-fullname" class="name">${escapeHtml(profile?.display_name || '')}</div>
      </div>
      <div class="switch-button" id="switch-account-btn">Switch</div>
    </div>`;
  headerPfp && (headerPfp.src = profile.avatar_url || PLACEHOLDER_AVATAR); // Set actual profile pic for dropdown
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
  const imageUrlGroup = document.getElementById('image-url-group');
  const textInputGroup = document.getElementById('text-input-group'); // Added this line
  let currentPostType = 'post';

  typeBtns?.forEach(btn => btn.addEventListener('click', (e) => {
    typeBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentPostType = e.currentTarget.dataset.type;
    imageUrlGroup.style.display = currentPostType === 'post' ? 'flex' : 'none';
    textInputGroup.style.display = currentPostType === 'text-only' ? 'flex' : 'none'; // Added this line
  }));

  // submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postCaption = document.getElementById('post-caption').value.trim();
    const postText = document.getElementById('post-text').value.trim(); // Added this line
    const imageUrl = document.getElementById('post-image-url').value.trim();

    const caption = currentPostType === 'text-only' ? postText : postCaption; // Modified this line

    if (!caption && currentPostType === 'text-only') { // Modified this line
      alert('Text content cannot be empty for a text-only post.'); // Modified this line
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please log in before posting.'); return; }

    try {
      const payload = {
        author: user.id,
        caption,
        media_url: currentPostType === 'post' && imageUrl ? imageUrl : null,
        media_type: currentPostType === 'post' && imageUrl ? 'image' : currentPostType, // Modified this line
      };
      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      await renderHomePage();
      form.reset();
      modal?.classList.remove('active');
    } catch (err) {
      alert(`Failed to create post: ${err.message}`);
    }
  });
}
