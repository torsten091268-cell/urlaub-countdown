const CACHE_NAME = "vacapp-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./bg.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // ✅ Statt addAll: einzeln cachen, damit 1 fehlende Datei nicht alles killt
    for (const url of ASSETS) {
      try {
        await cache.add(url);
      } catch (err) {
        console.warn("SW: Konnte nicht cachen:", url, err);
      }
    }

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const resp = await fetch(event.request);
      const copy = resp.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, copy);
      return resp;
    } catch (e) {
      return cached; // falls doch noch was da ist
    }
  })());
});
