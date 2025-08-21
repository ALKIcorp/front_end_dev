// UI utilities and generic nav/header wiring
export const $ = (sel) => document.querySelector(sel);
export const $all = (sel) => [...document.querySelectorAll(sel)];

export function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

export function wireHeaderDropdown() {
  const menuBtn = document.getElementById('user-menu-btn');
  const menu = document.getElementById('user-dropdown');
  document.addEventListener('click', (e) => {
    if (e.target === menuBtn) {
      e.preventDefault();
      menu?.classList.toggle('open');
      return;
    }
    if (!menu?.contains(e.target)) menu?.classList.remove('open');
  });
}

export function wireNav() {
  document.addEventListener('click', (e) => {
    const home = e.target.closest('#home-btn, #home-link');
    const profile = e.target.closest('#profile-btn');
    if (home) { e.preventDefault(); window.location.hash = ''; return; }
    if (profile) { e.preventDefault(); window.location.hash = '#/me'; return; }
  });
}
