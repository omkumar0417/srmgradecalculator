(() => {
  const root = document.documentElement;
  root.dataset.theme = "dark";

  try {
    localStorage.removeItem("srmgrade-theme");
  } catch {
    // Ignore storage failures and keep the site in dark mode for this session.
  }
})();
