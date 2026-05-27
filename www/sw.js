/*const CACHE_NAME = 'flash-emu-pro-v1';
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
// Inside sw.js
self.addEventListener('fetch', (event) => {
    // Only attempt to cache files from YOUR domain or game assets
    if (event.request.url.includes('google-analytics') || event.request.url.includes('serving-sys')) {
        return; // Skip tracking scripts
    }
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Only cache if the response is valid (status 200)
                if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }
                let responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return fetchResponse;
            });
        }).catch(() => {
            // Offline fallback
        })
    );
});*/