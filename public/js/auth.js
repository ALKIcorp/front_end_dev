// public/js/auth.js
import { supabase } from './supabaseClient.js';
import { $, $all } from './ui.js';
import { renderHomePage, initSidebarCurrentUser } from './posts.js';

export async function openLoginModal() {
  $('#login-error')?.replaceChildren(); // clear errors
  $('#login-modal')?.classList.add('active');

  // Hide guest gate so it never covers the modal
  const guest = $('#guest-login-screen');
  if (guest) guest.style.display = 'none';
}

export async function closeLoginModal() {
  $('#login-modal')?.classList.remove('active');

  // If still logged out, bring the guest gate back
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const guest = $('#guest-login-screen');
    if (guest) guest.style.display = 'flex';
  }
}


function setLoginError(text) {
  const box = $('#login-error');
  if (box) {
    box.textContent = text || '';
    box.style.display = text ? 'block' : 'none';
  } else if (text) {
    // fallback
    alert(text);
  }
}

export async function signIn(email, password) {
  // Basic validation for clearer feedback
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function showGuestLogin() {
  const el = $('#guest-login-screen');
  if (el) el.style.display = 'flex';
}
export function hideGuestLogin() {
  const el = $('#guest-login-screen');
  if (el) el.style.display = 'none';
}

export function wireAuthUI() {
  // Open login modal from "Switch" and guest CTA
  document.body.addEventListener('click', (e) => {
    const switchBtn = e.target.closest('#switch-account-btn, #guest-open-login');
    if (switchBtn) {
      e.preventDefault();
      openLoginModal();
    }
  });

  // Close buttons / click outside
  $('#login-cancel')?.addEventListener('click', () => closeLoginModal());
  $('#close-login-modal')?.addEventListener('click', () => closeLoginModal());
  $('#login-modal')?.addEventListener('click', (e) => {
    if (e.target === $('#login-modal')) closeLoginModal();
  });

  // Ensure clicking the button triggers the form submit reliably
  const loginForm = $('#login-form');
  $('#login-submit')?.addEventListener('click', (e) => {
    if (loginForm) {
      e.preventDefault();
      loginForm.requestSubmit(); // forces submit event
    }
  });

  // Submit handler
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoginError(''); // clear prior

    const email = $('#login-email')?.value?.trim() || '';
    const password = $('#login-password')?.value || '';
    const btn = $('#login-submit');

    try {
      if (btn) btn.disabled = true;
      await signIn(email, password);
      // success → close; UI will refresh via onAuthStateChange
      closeLoginModal();
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError(err?.message || 'Login failed. Please try again.');
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // Sign out
  $('#signout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut();
      // UI will update via onAuthStateChange
    } catch (err) {
      console.error('Sign out failed:', err);
      alert('Sign out failed: ' + (err?.message || 'unknown error'));
    }
  });
}

export async function updateUIFromSession(session) {
  await initSidebarCurrentUser();

  if (session?.user) {
    hideGuestLogin();
    await renderHomePage();
  } else {
    showGuestLogin();
    // If modal is open and the user is not logged, keep it available
  }
}
