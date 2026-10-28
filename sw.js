// Rang de Séance — service worker : l'appli marche même sans connexion.
const CACHE = "rang-seance-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./fonts/fonts.css",
  ...["barlow-condensed-latin-600", "barlow-condensed-latin-700", "barlow-condensed-latin-800", "barlow-latin-400", "barlow-latin-500", "barlow-latin-600", "barlow-latin-700"].map(f => "./fonts/" + f + "-normal.woff2")];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Pages de l'appli : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

});
