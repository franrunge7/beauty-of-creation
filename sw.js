self.addEventListener("install", event => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  if (event.request.method === "GET") {
    event.respondWith(caches.open("beauty-creation-v1").then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok && new URL(event.request.url).origin === self.location.origin) cache.put(event.request, response.clone());
        return response;
      } catch { return cached || Response.error(); }
    }));
  }
});