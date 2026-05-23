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
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // only cache valid responses
                if (!res || res.status !== 200 || res.type === 'opaque') return res;
                const clone = res.clone();
                caches.open('flash-emu-pro-v1').then(cache => cache.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});