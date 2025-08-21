// Likes: hydrate, toggle, realtime, likers modal
import { supabase } from './supabaseClient.js';
import { $, $all } from './ui.js';

const likeLocks = new Set();
let likeClicksWired = false;
let likesRtChannel = null;

// UI helpers
export function setButtonDisabled(postId, disabled) {
  const btn = document.querySelector(`.like-btn[data-postid="${postId}"]`);
  if (btn) btn.disabled = !!disabled;
}

export function setLikeButtonState(postId, liked) {
  const btn = document.querySelector(`.like-btn[data-postid="${postId}"]`);
  if (btn) btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
}

export function setLikeCount(postId, count) {
  const el = document.querySelector(`.like-count[data-postid="${postId}"]`);
  if (el) { el.textContent = String(count); el.setAttribute('data-count', String(count)); }
}

// Delegate clicks (wire once)
export function wireLikeClicks() {
  if (likeClicksWired) return;
  likeClicksWired = true;
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;
    const postId = btn.dataset.postid;
    await toggleLike(postId);
  });
}

// Optimistic toggle + server reconcile
export async function toggleLike(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { alert('Log in to like.'); return; }
  if (likeLocks.has(postId)) return;

  const wasLiked = (document.querySelector(`.like-btn[data-postid="${postId}"]`)?.getAttribute('aria-pressed') === 'true');

  likeLocks.add(postId);
  setButtonDisabled(postId, true);

  try {
    // optimistic UI
    setLikeButtonState(postId, !wasLiked);
    const cur = Number(document.querySelector(`.like-count[data-postid="${postId}"]`)?.getAttribute('data-count') || '0');
    setLikeCount(postId, wasLiked ? cur - 1 : cur + 1);

    // RPC (server will upsert/delete + update counter trigger)
    const { error } = await supabase.rpc('toggle_like', { p_post_id: postId });
    if (error) throw error;

    // re-check server truth (one post)
    await rehydrateOneLike(postId);
  } catch (e) {
    // rollback on error
    setLikeButtonState(postId, wasLiked);
    await rehydrateOneLike(postId);
    alert('Like failed: ' + e.message);
  } finally {
    setButtonDisabled(postId, false);
    likeLocks.delete(postId);
  }
}

export async function hydrateLikes(posts) {
  for (const p of posts) {
    setLikeCount(p.id, Number(p.likes_count) || 0);
  }
  const ids = posts.map(p => p.id);
  // did I like? batch fetch per visible posts
  await Promise.all(ids.map(async (postId) => {
    const [{ data: likedData }, { data: countRow }] = await Promise.all([
      supabase.rpc('did_i_like', { p_post_id: postId }),
      supabase.from('posts').select('likes_count').eq('id', postId).single()
    ]);
    const liked = !!(Array.isArray(likedData) ? likedData[0] : likedData);
    setLikeButtonState(postId, liked);
    setLikeCount(postId, Number(countRow?.likes_count ?? 0));
  }));
}

export async function rehydrateOneLike(postId) {
  const [{ data: likedData }, { data: row }] = await Promise.all([
    supabase.rpc('did_i_like', { p_post_id: postId }),
    supabase.from('posts').select('likes_count').eq('id', postId).single()
  ]);
  const liked = !!(Array.isArray(likedData) ? likedData[0] : likedData);
  setLikeButtonState(postId, liked);
  setLikeCount(postId, Number(row?.likes_count ?? 0));
}

export function resyncLikesForVisiblePosts() {
  const ids = [...document.querySelectorAll('.post-actions[data-postid]')].map(el => el.dataset.postid);
  ids.forEach(rehydrateOneLike);
}

// visibility/pagehide guards (never abort in-flight, just resync on visible)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    document.querySelectorAll('.like-btn[disabled]').forEach(btn => (btn.disabled = false));
    resyncLikesForVisiblePosts();
  }
});
window.addEventListener('pagehide', () => {
  document.querySelectorAll('.like-btn[disabled]').forEach(btn => (btn.disabled = false));
});

// Realtime reconciliation (posts.likes_count)
export async function startLikesRealtime() {
  if (likesRtChannel) await supabase.removeChannel(likesRtChannel);
  likesRtChannel = supabase
    .channel('rt-posts-likes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
      const pid = payload.new?.id;
      const count = Number(payload.new?.likes_count ?? 0);
      const el = document.querySelector(`.like-count[data-postid="${pid}"]`);
      if (el) {
        el.textContent = String(count);
        el.setAttribute('data-count', String(count));
      }
    })
    .subscribe();
}

export async function stopLikesRealtime() {
  if (likesRtChannel) {
    await supabase.removeChannel(likesRtChannel);
    likesRtChannel = null;
  }
}

// Likers modal
export async function fetchLikers(postId) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('user_id, profiles!inner(username, avatar_url)')
    .eq('post_id', postId)
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export function wireOpenLikers() {
  const modal = document.getElementById('likers-modal');
  const closeBtn = document.getElementById('close-likers-modal');
  document.addEventListener('click', async (e) => {
    const countEl = e.target.closest('.like-count');
    if (!countEl) return;
    const postId = countEl.dataset.postid;
    const list = await fetchLikers(postId);
    const listEl = document.getElementById('likers-list');
    listEl.innerHTML = list.map(x => `<div class="liker">
      <img class="user-avatar" src="${x.profiles?.avatar_url || ''}" alt=""/>
      <span>@${x.profiles?.username || 'user'}</span>
    </div>`).join('');
    modal?.classList.add('active');
  });
  closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
}
