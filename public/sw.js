const CACHE_NAME = "jadeed-coconut-oil-v1";
const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static resources");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Focus only on GET requests, bypass APIs, and authenticated dashboard requests to keep data secure
  if (request.method !== "GET" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/dashboard")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache static resources (images, JS, styles) dynamically
        if (
          response &&
          response.status === 200 &&
          response.type === "basic" &&
          (url.pathname.endsWith(".js") ||
            url.pathname.endsWith(".css") ||
            url.pathname.startsWith("/_next/") ||
            url.pathname.startsWith("/icons/"))
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fetch failed -> Attempt cache, then fallback to offline HTML page
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If request is document page request, return the offline fallback
          if (request.mode === "navigate" || (request.headers.get("accept") && request.headers.get("accept").includes("text/html"))) {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
