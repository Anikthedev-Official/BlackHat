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
    '/Client.js',
    '/baser.html',
    '/favicon.ico',
    '/icon-192.png',
    '/icon-512.png'

];

// Install — cac            hing
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
    // 1. CRITICAL: Block non-web requests immediately
    if (!e.request.url.startsWith('http')) return;

    // 2. Block non-GET requests (submissions)
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (!res || res.status !== 200 || res.type === 'opaque') return res;
                
                // Don't cache API calls
                const url = new URL(e.request.url);
                if (url.hostname.includes('hf.space')) return res;

                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => {
                    // Double check URL before putting in cache
                    if (e.request.url.startsWith('http')) {
                        cache.put(e.request, clone);
                    }
                });
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});