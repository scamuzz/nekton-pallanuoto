const CACHE_NAME = 'nekton-v1';
const urlsToCache = [
  '/nekton-pallanuoto/',
  '/nekton-pallanuoto/index.html',
  '/nekton-pallanuoto/acquagol.html',
  '/nekton-pallanuoto/calendario.html',
  '/nekton-pallanuoto/giocatori.html',
  '/nekton-pallanuoto/news.html',
  '/nekton-pallanuoto/orari.html',
  '/nekton-pallanuoto/pagamenti.html',
  '/nekton-pallanuoto/senior.html',
  '/nekton-pallanuoto/sondaggi.html',
  '/nekton-pallanuoto/u13.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => caches.match('/nekton-pallanuoto/index.html'))
  );
});
