// Import Workbox from Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "sempchat-cache-v1";
const offlineFallbackPage = "offline.html";

// ⚡️ Install: cache offline page + static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        offlineFallbackPage,
        "/",                                // Root page
        "/index.html",                      // Main entry
        "/css/style.css",                   // Your CSS file
        "/images/sempchat-icon.png",        // App icon
        "/images/fav.ico",                  // Favicon
        "https://hackersm9.github.io/Fonts/fonts.css" // External font
      ]);
    })
  );
});

// ⚡️ Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// ⚡️ Fetch: serve cached content, fallback to offline page
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Navigation requests (HTML pages)
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE);
        return cache.match(offlineFallbackPage);
      })
    );
  } else {
    // Other requests (CSS, JS, images, etc.)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((resp) => {
            return caches.open(CACHE).then((cache) => {
              cache.put(event.request, resp.clone());
              return resp;
            });
          })
        );
      })
    );
  }
});
