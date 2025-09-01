/* Simple cache-first SW for GitHub Pages */
const CACHE_NAME = "hedo-lockers-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  // Icons (assure-toi qu'ils existent)
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Stratégie réseau-d'abord pour index (mise à jour) ; cache-d'abord pour le reste
  if (new URL(req.url).pathname.endsWith("/") || new URL(req.url).pathname.endsWith("/index.html")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }))
    );
  }
});