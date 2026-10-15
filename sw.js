
const C = "handball-coach-v13";

const F = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(C).then(cache => cache.addAll(F))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== C)
          .map(key => caches.delete(key))
      )
    )
  );
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  const req = e.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Ignorer les extensions et les autres sites.
  if (url.origin !== self.location.origin) return;

  // Toujours essayer de récupérer la dernière page HTML.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.open(C).then(async cache => {
      const cached = await cache.match(req);

      if (cached) return cached;

      try {
        const response = await fetch(req);

        if (response.ok && response.type === "basic") {
          await cache.put(req, response.clone());
        }

        return response;
      } catch (error) {
        return cache.match("./index.html");
      }
    })
  );
});
