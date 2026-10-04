// Service worker minimal — rend la PWA installable et garde le shell hors-ligne.
// L'application elle-même (Apps Script) reste servie en ligne via l'iframe.
const CACHE = 'vdc-shell-v1';
const SHELL = [
  '.',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // On ne met en cache que le shell local (même origine). Tout le reste
  // (Apps Script, Google Drive, photos) passe directement par le réseau.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
});
