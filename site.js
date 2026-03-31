(() => {
  const storageKey = 'srmgrade-theme';
  const root = document.documentElement;
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch {
    savedTheme = null;
  }

  const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore storage failures and keep the current session theme only.
    }
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach((button) => {
      button.textContent = theme === 'light' ? 'Switch to dark' : 'Switch to light';
      button.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  };

  applyTheme(initialTheme);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
})();
