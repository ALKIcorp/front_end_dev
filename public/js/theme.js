const KEY = 'oc_theme';
const isMode = (m) => m === 'light' || m === 'dark';

export function initTheme() {
  // Read saved theme; default to light
  let saved = 'light';
  try { saved = localStorage.getItem(KEY) || 'light'; } catch {}
  if (!isMode(saved)) saved = 'light';
  document.documentElement.setAttribute('data-theme', saved);
  // Optional hint for debugging:
  console.log('[theme] init:', saved);
  return saved;
}

export function setTheme(mode) {
  if (!isMode(mode)) mode = 'light';
  document.documentElement.setAttribute('data-theme', mode);
  try { localStorage.setItem(KEY, mode); } catch {}
  console.log('[theme] set:', mode);
  return mode;
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export function toggleTheme() {
  const cur = getTheme();
  const next = cur === 'dark' ? 'light' : 'dark';
  return setTheme(next);
}