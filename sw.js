const CACHE = "atr-quiz-v5"; // <-- IMPORTANT: change this every time you want to force-update

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./atr42.jpg",
  "./Banks/ATR.json",
  "./Banks/SOP.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // ✅ Always try to get newest bank JSON when online
  if (url.pathname.includes("/Banks/")) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // ✅ Cache-first for everything else (fast offline)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      });
    })
  );
});
