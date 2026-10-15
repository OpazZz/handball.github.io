const CACHE_NAME = "handball-coach-v17";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  // Ne pas intercepter les requêtes non-GET ni celles des extensions
  // (chrome-extension://, etc.) ou d'autres origines.
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (
    (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") ||
    requestUrl.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
      const response = await fetch(request);

      // Ne mettre en cache que les réponses réussies. Une erreur de cache
      // ne doit jamais empêcher de retourner la réponse réseau.
      if (response.ok) {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        } catch (cacheError) {
          console.warn("Mise en cache ignorée :", cacheError);
        }
      }

      return response;
    } catch (networkError) {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
      throw networkError;
    }
  })());
});
