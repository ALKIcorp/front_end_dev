// public/js/auth.js
import { supabase } from './supabaseClient.js';
import { $, $all } from './ui.js';
import { renderHomePage, initSidebarCurrentUser } from './posts.js';

// ---------- Modal helpers (A11y-safe) ----------
let _lastActive = null;
let _escHandler = null;

function setInert(enable) {
  ['header', 'main', '#guest-login-screen'].forEach(sel => {
    const el = sel.startsWith('#') ? document.querySelector(sel) : document.querySelector(sel);
    if (!el) return;
    if (enable) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}

function ensureAriaSync(modal) {
  // Guard: whenever .active is present, aria-hidden must be false
  const sync = () => {
    if (modal.classList.contains('active')) modal.setAttribute('aria-hidden', 'false');
  };
  sync();
  const mo = new MutationObserver(sync);
  mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
  // store on element so we could disconnect later if needed
  modal._ariaMo = mo;
}

export function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (!modal) return;

  _lastActive = document.activeElement;

  modal.classList.add('active');
  // Be explicit: the modal is not hidden while open
  modal.removeAttribute('aria-hidden');           // remove stale value
  modal.setAttribute('aria-hidden', 'false');     // assert correct value
  setInert(true);
  ensureAriaSync(modal);

  // Focus first field
  document.getElementById('login-email')?.focus();

  // ESC to close
  if (!_escHandler) {
    _escHandler = (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeLoginModal();
    };
    document.addEventListener('keydown', _escHandler);
  }
}

export function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true'); // hidden again
  setInert(false);

  if (modal._ariaMo) modal._ariaMo.disconnect();

  if (_lastActive && document.body.contains(_lastActive)) {
    try { _lastActive.focus(); } catch {}
  }
}

// ---------- Supabase calls ----------
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---------- Guest gate ----------
export function showGuestLogin() { const el = $('#guest-login-screen'); if (el) el.style.display = 'flex'; }
export function hideGuestLogin() { const el = $('#guest-login-screen'); if (el) el.style.display = 'none'; }

// ---------- Wire UI (one-time) ----------
let wired = false;
export function wireAuthUI() {
  if (wired) return; wired = true;

  // Openers
  $('#guest-open-login')?.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
  $('#switch-account-btn')?.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });

  // Closers
  $('#login-cancel')?.addEventListener('click', () => closeLoginModal());
  $('#close-login-modal')?.addEventListener('click', () => closeLoginModal());
  $('#login-modal')?.addEventListener('click', (e) => { if (e.target === $('#login-modal')) closeLoginModal(); });

  // Submit login
  $('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email')?.value?.trim() || '';
    const password = $('#login-password')?.value || '';
    const btn = $('#login-submit');
    try {
      if (btn) btn.disabled = true;
      await signIn(email, password);
      // optional: clear fields
      if ($('#login-email')) $('#login-email').value = '';
      if ($('#login-password')) $('#login-password').value = '';
      closeLoginModal();
    } catch (err) {
      alert('Login failed: ' + err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // Sign out
  $('#signout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await signOut(); } catch (err) { alert('Sign out failed: ' + err.message); }
  });
}

// ---------- Session → UI ----------
export async function updateUIFromSession(session) {
  await initSidebarCurrentUser();
  if (session?.user) {
    hideGuestLogin();
    await renderHomePage();
  } else {
    showGuestLogin();
  }
}

// (placeholder)
export function wireSignupModal() {}
