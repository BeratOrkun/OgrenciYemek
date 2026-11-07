// ÖğrenciYemek Service Worker
const CACHE_NAME = 'ogrenciyemek-v22';

// Göreceli yollar: SW'nin bulunduğu dizine göre çözümlenir, böylece
// hem alan adı kökünde hem de /OgrenciYemek/ alt dizininde çalışır.
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/style.css?v=15',
    './js/storage.js',
    './js/storage.js?v=15',
    './js/analytics.js',
    './js/app.js',
    './js/app.js?v=15',
    './js/data.js',
    './js/data.js?v=15',
    './js/screens.js',
    './js/screens.js?v=15',
    './manifest.json',
    './manifest.json?v=15',
    './icons/icon-192.png',
    './icons/icon-192.png?v=15',
    './icons/icon-512.png',
    './icons/icon-512.png?v=15',
    './icons/maskable-192.png',
    './icons/maskable-192.png?v=15',
    './icons/maskable-512.png',
    './icons/maskable-512.png?v=15',
    './icons/apple-touch-icon.png',
    './icons/apple-touch-icon.png?v=15',
    './icons/favicon.ico',
    './icons/favicon.ico?v=15',
    './icons/favicon-16.png',
    './icons/favicon-16.png?v=15',
    './icons/favicon-32.png',
    './icons/favicon-32.png?v=15',
    './icons/og-image.png',
    './icons/og-image.png?v=15',
    './icons/logo-full.png'
];

// -----------------------------------------------------------
// Install — tüm kabuk dosyaları önbelleğe GİRDİKTEN SONRA devral.
// skipWaiting() daha önce waitUntil dışındaydı; yeni SW önbelleği
// dolmadan aktifleşip activate'te eski önbelleği siliyordu. O aralıkta
// ağ takılırsa dosyalar hiçbir yerden gelemiyor ve sayfa boş açılıyordu.
// -----------------------------------------------------------
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            // cache: 'reload' SART: aksi halde addAll tarayicinin HTTP
            // onbelleginden okur ve max-age=3600 ile duran BAYAT govdeleri
            // on bellege yazar. Yeni surum yayinda olsa bile kullanici
            // eskisini calistirmaya devam eder.
            .then((cache) => cache.addAll(
                ASSETS_TO_CACHE.map((u) => new Request(u, { cache: 'reload' }))
            ))
            .then(() => self.skipWaiting())
    );
});

// -----------------------------------------------------------
// Activate — eski önbellekler temizlendikten sonra sayfaları devral
// -----------------------------------------------------------
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Yalnızca sağlam, kendi kaynağımızdan gelen yanıtlar saklanır.
// (404/500 önbelleğe girerse uygulama kalıcı olarak bozulurdu.)
function cachelenebilir(response) {
    return response
        && response.ok
        && (response.type === 'basic' || response.type === 'default');
}

// Arka planda tazele: yanıtı beklemeyiz, bir sonraki açılış güncel olur.
function arkaPlandaTazele(request) {
    return fetch(request)
        .then((response) => {
            if (cachelenebilir(response)) {
                const kopya = response.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, kopya))
                    .catch(() => { /* kota/izin — yoksay */ });
            }
            return response;
        })
        .catch(() => null);
}

// Önbellekte ara: birebir, sonra sorgu parametresini yok sayarak.
// Kurulu uygulama "/?mod=app" ile açıldığı için ignoreSearch şart.
async function onbellektenBul(request) {
    const birebir = await caches.match(request);
    if (birebir) return birebir;

    // ignoreSearch YALNIZCA gezinme istekleri icin.
    // Varliklarda kullanilirsa "app.js?v=18" istegi on bellekteki
    // surumsuz "app.js" govdesiyle eslesir; yeni surum yayinda olsa
    // bile kullaniciya ESKI dosya gider ve ?v= atlatmasi tamamen
    // islevsiz kalir.
    if (request.mode === 'navigate') {
        return await caches.match(request, { ignoreSearch: true });
    }
    return undefined;
}

// -----------------------------------------------------------
// Fetch — kabuk için ÖNBELLEK ÖNCE, arka planda tazeleme.
// Eski davranış "önce ağ" idi: her dosya ağı bekliyordu ve zayıf
// bağlantıda JS istekleri düşüp sayfa boş kalıyordu. Artık kabuk
// her zaman anında önbellekten geliyor, güncelleme arkada oluyor.
// -----------------------------------------------------------
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Sadece kendi dosyalarımız (same-origin GET).
    // Menü API'leri ve kazınan sayfalar doğrudan ağa gitsin: aksi halde
    // çevrimdışıyken eski menü "güncel" gibi gösterilir ve POST
    // isteklerinde cache.put hata verir.
    let url;
    try {
        url = new URL(request.url);
    } catch {
        return;
    }
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith((async () => {
        try {
            const cached = await onbellektenBul(request);

            if (cached) {
                // Anında önbellekten ver, güncellemeyi arkada yap
                event.waitUntil(arkaPlandaTazele(request));
                return cached;
            }

            // Önbellekte yoksa ağa git
            const network = await arkaPlandaTazele(request);
            if (network) return network;
        } catch {
            /* önbellek/ağ hatası — navigasyon kurtarmasına düş */
        }

        // Ağ da yoksa: gezinme isteklerinde uygulama kabuğunu döndür,
        // böylece kullanıcı boş ekran yerine uygulamayı görür.
        if (request.mode === 'navigate') {
            try {
                const shell = (await caches.match('./index.html'))
                    || (await caches.match('./'))
                    || (await caches.match('index.html'));
                if (shell) return shell;
            } catch {
                /* yoksay */
            }
        }

        return Response.error();
    })());
});
