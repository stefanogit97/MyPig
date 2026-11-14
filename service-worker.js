const CACHE_NAME = "patrimonio-app-v34";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chiavi) => Promise.all(
        chiavi
          .filter((chiave) => chiave.startsWith("patrimonio-app-") && chiave !== CACHE_NAME)
          .map((chiave) => caches.delete(chiave))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET" || new URL(evento.request.url).origin !== self.location.origin) {
    return;
  }

  evento.respondWith(
    fetch(evento.request)
      .then((risposta) => {
        if (risposta.ok) {
          const copia = risposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, copia));
        }
        return risposta;
      })
      .catch(() => caches.match(evento.request).then((risposta) => {
        if (risposta) return risposta;
        if (evento.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      }))
  );
});
