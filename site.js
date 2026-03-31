(() => {
  const root = document.documentElement;
  root.dataset.theme = 'dark';

  try {
    localStorage.removeItem('srmgrade-theme');
  } catch {
    // Ignore storage failures and keep the site in dark mode for this session.
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  function loadScript(src, options = {}) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;
    if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
    document.head.appendChild(script);
  }

  function loadNonCriticalScripts() {
    if (window.__srmPerfScriptsLoaded) return;
    window.__srmPerfScriptsLoaded = true;

    gtag('js', new Date());
    gtag('config', 'G-GV9P7TSW8P');

    loadScript('https://www.googletagmanager.com/gtag/js?id=G-GV9P7TSW8P', { async: true });
    loadScript('/_vercel/insights/script.js', { async: false, defer: true });

    if (document.querySelector('.adsbygoogle')) {
      loadScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7895007334839209', {
        async: true,
        crossOrigin: 'anonymous',
      });
    }
  }

  window.addEventListener('pointerdown', loadNonCriticalScripts, { once: true, passive: true });
  window.addEventListener('keydown', loadNonCriticalScripts, { once: true });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadNonCriticalScripts, { timeout: 2000 });
  } else {
    window.addEventListener('load', () => {
      window.setTimeout(loadNonCriticalScripts, 1200);
    }, { once: true });
  }
})();
