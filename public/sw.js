const STATIC_CACHE = "spark-static-v1";
const DOCUMENT_CACHE = "spark-documents-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

const PUBLIC_DOCUMENT_PATTERNS = [
  /^\/$/,
  /^\/about\/?$/,
  /^\/contact\/?$/,
  /^\/issues\/?$/,
  /^\/issues\/[^/]+\/?$/,
  /^\/articles\/[^/]+\/?$/,
  /^\/slow-talk\/?$/,
  /^\/slow-talk\/[^/]+\/?$/,
  /^\/theater\/?$/,
  /^\/theater\/[^/]+\/?$/,
  /^\/nonsense\/?$/,
  /^\/nonsense\/[^/]+\/?$/,
  /^\/poems\/?$/,
  /^\/letters\/?$/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => ![STATIC_CACHE, DOCUMENT_CACHE].includes(cacheName))
          .map((cacheName) => caches.delete(cacheName))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname === "/sw.js") {
    return;
  }

  if (request.mode === "navigate" && isPublicDocumentPath(url.pathname)) {
    event.respondWith(handleDocumentRequest(request));
    return;
  }

  if (isStaticAssetRequest(request, url.pathname)) {
    event.respondWith(handleStaticAssetRequest(event, request));
  }
});

function isPublicDocumentPath(pathname) {
  return PUBLIC_DOCUMENT_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isStaticAssetRequest(request, pathname) {
  if (pathname.startsWith("/_next/static/")) {
    return true;
  }

  const destination = request.destination;

  if (["style", "script", "font", "image", "manifest"].includes(destination)) {
    return true;
  }

  return /^\/icons\/.+/.test(pathname);
}

async function handleDocumentRequest(request) {
  const cache = await caches.open(DOCUMENT_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
    });
  }
}

async function handleStaticAssetRequest(event, request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        void cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => null);

  if (cachedResponse) {
    event.waitUntil(networkResponsePromise);
    return cachedResponse;
  }

  const networkResponse = await networkResponsePromise;

  if (networkResponse) {
    return networkResponse;
  }

  return new Response("", {
    status: 504,
    statusText: "Gateway Timeout",
  });
}
