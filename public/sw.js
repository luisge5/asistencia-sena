// Service Worker · Asistencia SENA · Fase 1
// Estrategia:
//   - Shell (HTML, CSS, fonts) → cache-first con fallback a network
//   - Endpoints backend → network-first con fallback a cache
//   - Versionado por timestamp · cambiar al hacer deploy con breaking changes

const CACHE_VERSION = "2026-05-23-v1";
const SHELL_CACHE = `asistencia-shell-${CACHE_VERSION}`;
const DATA_CACHE = `asistencia-data-${CACHE_VERSION}`;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // addAll falla todo-o-nada · usar addAll best-effort
      return Promise.all(
        SHELL_FILES.map((url) =>
          cache.add(url).catch((err) => console.warn("SW · no se pudo cachear:", url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Endpoints backend Apps Script → network-first
  if (url.hostname.includes("script.google.com") || url.hostname.includes("script.googleusercontent.com")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Shell → cache-first
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    // Sin red y sin cache → fallback a la home
    if (req.mode === "navigate") {
      return caches.match("./index.html");
    }
    throw err;
  }
}

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ ok: false, error: "offline", offline: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
