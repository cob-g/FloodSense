export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  // Do NOT register SW in Vite dev unless explicitly enabled
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_SW_DEV !== 'true') {
    // Clean up any previously registered SW and caches to fix stale module issues
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const hadRegs = regs && regs.length > 0;
      regs.forEach((r) => r.unregister());
      const clearCaches = 'caches' in window ? caches.keys().then((keys) => {
        const del = keys.filter((k) => k.startsWith('fs-')).map((k) => caches.delete(k));
        return Promise.all(del);
      }) : Promise.resolve();
      Promise.resolve(clearCaches).then(() => {
        // One-time reload to drop SW control if it was active
        if (hadRegs && !sessionStorage.getItem('sw-cleaned')) {
          sessionStorage.setItem('sw-cleaned', '1');
          location.reload();
        }
      });
    });
    return;
  }

  // Production registration
  window.addEventListener('load', () => {
    // Prefer root-level sw.js for widest scope (controls entire origin)
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // Fallback for environments bundling sw from src
        const url = new URL('./sw.js', import.meta.url);
        return navigator.serviceWorker.register(url, { scope: '/' });
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}
