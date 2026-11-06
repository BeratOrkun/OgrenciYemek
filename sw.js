// ÖğrenciYemek Service Worker
const CACHE_NAME = 'ogrenciyemek-v7';
// Göreceli yollar: SW'nin bulunduğu dizine göre çözümlenir, böylece
// hem alan adı kökünde hem de /OgrenciYemek/ alt dizininde çalışır.
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/data.js',
    './js/screens.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/maskable-192.png',
    './icons/maskable-512.png',
    './icons/apple-touch-icon.png',
    './icons/favicon.ico',
    './icons/favicon-16.png',
    './icons/favicon-32.png'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Sadece kendi dosyalarımızı (same-origin GET) yönet.
    // Menü API'leri ve kazınan sayfalar doğrudan ağa gitsin: aksi halde
    // çevrimdışıyken eski menü "güncel" gibi gösterilir ve POST
    // isteklerinde cache.put hata verir.
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(async () => {
                // Birebir eşleşme
                const exact = await caches.match(event.request);
                if (exact) return exact;

                // Sorgu parametresini yok sayarak dene.
                // Kurulu uygulama "/?mod=app" adresiyle açılıyor; bu
                // olmadan çevrimdışı açılışta önbellekteki "/" ile
                // eşleşmez ve uygulama boş ekran verir.
                const ignoringQuery = await caches.match(event.request, { ignoreSearch: true });
                if (ignoringQuery) return ignoringQuery;

                // Son çare: her gezinme isteği için ana sayfayı döndür
                if (event.request.mode === 'navigate') {
                    const shell = await caches.match('./index.html')
                        || await caches.match('./');
                    if (shell) return shell;
                }

                return Response.error();
            })
    );
});
