import { initTheme, getTheme, toggleTheme, setTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  // Make sure the page starts in the saved theme
  initTheme();

  const chk = document.getElementById('dark-mode-slider');
  const label = document.getElementById('dark-mode-label');

  if (chk) {
    // Reflect current theme in the switch
    chk.checked = getTheme() === 'dark';
    label && (label.textContent = chk.checked ? 'Dark' : 'Light');

    // Toggle on change
    chk.addEventListener('change', () => {
      toggleTheme();
      const isDark = getTheme() === 'dark';
      label && (label.textContent = isDark ? 'Dark' : 'Light');
    });
  }

  // Optional: explicit buttons if you ever add them
  document.getElementById('btn-light')?.addEventListener('click', () => {
    setTheme('light'); if (chk) chk.checked = false; if (label) label.textContent = 'Light';
  });
  document.getElementById('btn-dark')?.addEventListener('click', () => {
    setTheme('dark');  if (chk) chk.checked = true;  if (label) label.textContent = 'Dark';
  });
});