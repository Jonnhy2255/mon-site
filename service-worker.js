/* STARKY-ECO — service worker
   Met uniquement les IMAGES en cache. L'application (HTML, CSS, JS, API, polices)
   passe toujours par le réseau : aucune version hors-ligne. */
const VERSION = 'v3';
const IMG_CACHE = 'starky-eco-img-' + VERSION;
const ICONS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(IMG_CACHE).then((c) => c.addAll(ICONS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // supprime les anciens caches (dont l'ancien cache qui contenait index.html)
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('starky-eco-') && k !== IMG_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Seules les images GET sont interceptées ; tout le reste va directement au réseau.
  if (req.method !== 'GET' || req.destination !== 'image') return;

  e.respondWith(
    caches.open(IMG_CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        });
      })
    )
  );
});