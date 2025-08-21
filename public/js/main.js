// Boot entrypoint
import { supabase } from './supabaseClient.js';
import { wireHeaderDropdown, wireNav } from './ui.js';
import { wireCreatePostModal } from './posts.js';
import { wireLikeClicks, startLikesRealtime, stopLikesRealtime, wireOpenLikers } from './likes.js';
import { wireAuthUI, wireSignupModal, updateUIFromSession } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  wireHeaderDropdown();
  wireNav();
  wireCreatePostModal();
  wireAuthUI();
  wireSignupModal();
  wireOpenLikers?.();
  wireLikeClicks();

  const { data: { session } } = await supabase.auth.getSession();
  await updateUIFromSession(session);
  if (session?.user) { await startLikesRealtime(); }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    await updateUIFromSession(session);
    if (session?.user) { await startLikesRealtime(); }
    else { await stopLikesRealtime(); }
  });
});
