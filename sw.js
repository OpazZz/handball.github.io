
const CACHE = "handball-coach-v3";

const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignorer les extensions Chrome et les autres origines.
  if (url.origin !== self.location.origin) return;

  // Ne pas intercepter les navigations avec des paramètres.
  // Elles pourront toujours charger la dernière version du site.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response.ok || response.type !== "basic") {
          return response;
        }

        const copy = response.clone();

        event.waitUntil(
          caches.open(CACHE).then(cache => cache.put(request, copy))
        );

        return response;
      });
    })
  );
});
