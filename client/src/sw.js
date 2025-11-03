const SHELL_CACHE = 'fs-shell-v1';
const DATA_CACHE = 'fs-data-v1';
const IS_DEV = self.location && (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1');

// Minimal IndexedDB helper for SW context
const DB_NAME = 'floodsense';
const STORE = 'kv';
function idbSet(key, value) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ key, value });
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
    req.onerror = () => reject(req.error);
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(['/', '/index.html']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (url.pathname.startsWith('/api/fallbacks')) {
    event.respondWith(
      (async () => {
        try {
          const netRes = await fetch(request);
          const cache = await caches.open(DATA_CACHE);
          cache.put(request, netRes.clone());
          // Also persist into IndexedDB for robust offline reads
          try {
            const copy = netRes.clone();
            const json = await copy.json().catch(() => null);
            if (json) {
              const list = json?.data?.places || json?.places || json?.data?.fallbacks || json?.fallbacks || [];
              await idbSet('fallbacks', Array.isArray(list) ? list : []);
            }
          } catch (_) {
            // ignore IDB write errors
          }
          return netRes;
        } catch (e) {
          const cached = await caches.match(request);
          if (cached) return cached;
          throw e;
        }
      })()
    );
    return;
  }

  // Ignore Vite client/HMR and source paths
  const ignored = url.pathname.startsWith('/@') || url.pathname.startsWith('/src') || url.pathname.includes('/node_modules');
  if (!ignored && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
        );
      })
    );
  }
});
