const cacheName = 'v2';
const urlsToCache = [
    '/',
    '/pages/fallback.html',
    'css/styles.css',
    'videos/offline-animation.mp4',
    'videos/cover-screen-animation.mp4',
    '/images/logo.svg',
];

self.addEventListener('install', (e) => {
    console.log('install done');
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                return cache.addAll(urlsToCache);
            }).then(() => { self.skipWaiting() })
    );
});



self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(cache => {
                    if (cache !== cacheName) {
                        return caches.delete(cache)
                    }
                })
            );
        })
    );
});


// cache first strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request);
    }).catch(() => caches.match('/pages/fallback.html'))
    )
});


