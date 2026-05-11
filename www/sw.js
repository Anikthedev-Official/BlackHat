const CACHE_NAME = 'flash-emu-pro-v1';
const PRECACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/games.json',
    '/layout-library.js',
    '/editor.html',
    '/engines/v2026/ruffle.js',
    '/engines/v2021/ruffle.js',
];

// Install — cache everything
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                PRECACHE.map(url => cache.add(url).catch(() => {}))
            );
        })
    );
    self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — cache first for engine files, network first for everything else
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Cache-first for Ruffle engine (huge file, never changes)
    if (url.pathname.includes('/engines/')) {
        e.respondWith(
            caches.match(e.request).then(cached => {
                if (cached) return cached;
                return fetch(e.request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Network-first for everything else (so updates work)
    e.respondWith(
        fetch(e.request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});