const CACHE = "atr-quiz-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./atr42.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./atr-icon-192.png",
  "./atr-icon-512.png",
  "./Banks/ATR.json",
  "./Banks/SOP.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        // Cache JSON/HTML/images for offline
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      }).catch(() => cached);
    })
  );
});
