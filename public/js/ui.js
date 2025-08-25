// UI utilities and generic nav/header wiring
import { getCurrentUserAndProfile, renderHomePage, renderProfilePageByUsername } from './posts.js';

export const $ = (sel) => document.querySelector(sel);
export const $all = (sel) => [...document.querySelectorAll(sel)];

export function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}
export function formatTimestamp(timestamp) {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffSeconds = Math.floor((now - postDate) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else {
    return `${diffWeeks}w`;
  }
}

export function updateTimestamps() {
  $all('.post-timestamp').forEach(el => {
    const timestamp = el.dataset.timestamp;
    if (timestamp) {
      el.textContent = formatTimestamp(timestamp);
    }
  });
}

export function wireHeaderDropdown() {
  const profilePicBtn = document.getElementById('profile-pic-btn');
  const profileDropdownMenu = document.getElementById('profile-dropdown-menu');

  profilePicBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    profileDropdownMenu?.classList.toggle('active');
  });
  document.addEventListener('click', (e) => {
    if (!profileDropdownMenu?.contains(e.target) && !profilePicBtn?.contains(e.target)) {
      profileDropdownMenu?.classList.remove('active');
    }
  });
  profileDropdownMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => profileDropdownMenu?.classList.remove('active'));
  });
}

export async function wireNav() {
  document.addEventListener('click', async (e) => {
    const home = e.target.closest('#home-btn, #home-link');
    const profileBtn = e.target.closest('#profile-btn');
    const myProfileLink = e.target.closest('#my-profile-link');
    const settingsLink = e.target.closest('#settings-link, #settings-btn');

    if (home) {
      e.preventDefault();
      window.location.hash = '';
      renderHomePage();
      return;
    }
    if (profileBtn || myProfileLink) {
      e.preventDefault();
      const { profile } = await getCurrentUserAndProfile();
      if (profile?.username) {
        window.location.hash = `#/@${profile.username}`;
        renderProfilePageByUsername(profile.username);
      } else {
        alert('Please log in to view your profile.');
      }
      return;
    }
    if (settingsLink) {
      e.preventDefault();
      window.location.href = './settings.html';
      return;
    }
  });
}
