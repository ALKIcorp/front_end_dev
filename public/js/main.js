// public/js/main.js
import { supabase } from './supabaseClient.js';
import { wireHeaderDropdown, wireNav } from './ui.js';
import { wireCreatePostModal } from './posts.js';
import { wireLikeClicks, startLikesRealtime, stopLikesRealtime, wireOpenLikers } from './likes.js';
import { wireAuthUI, updateUIFromSession } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    wireHeaderDropdown();
    wireNav();
    wireCreatePostModal();
    wireAuthUI();
    wireOpenLikers?.();
    wireLikeClicks();

    // Initial session check
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[boot] session:', session ? 'present' : 'none');
    await updateUIFromSession(session);
    if (session?.user) {
      await startLikesRealtime();
    }

    // React to future auth changes
    supabase.auth.onAuthStateChange(async (event, sessionNow) => {
      console.log('[auth change]', event, sessionNow?.user ? 'user' : 'no user');
      await updateUIFromSession(sessionNow);
      if (sessionNow?.user) {
        await startLikesRealtime();
      } else {
        await stopLikesRealtime();
      }
    });
  } catch (err) {
    console.error('[boot error]', err);
    alert('A boot error occurred. Check the console for details.');
  }
});
