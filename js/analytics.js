// =====================================================
// ÖğrenciYemek — GoatCounter + Umami Çift Yönlü Analitik
//
// İlk açılış sayfa görüntülemesi (/) index.html'deki GoatCounter
// ve Umami script'leri tarafından otomatik sayılır.
//
// Bu modül:
// 1) Alt menü ekranlarını (/universite-yemekleri, /kyk-yemekleri,
//    /genclik-sofrasi, /millet-kutuphanesi) her iki sayaca birebir
//    Sayfa Görüntülemesi (Pageview) olarak gönderir.
// 2) Özel olayları (uygulamadan-acilis, kurulum, uni-secim/*,
//    uni-aktif/*, uni-menu/*, instagram-tiklama) her iki sayaca
//    birebir Olay (Event) olarak gönderir.
// 3) İki sayacı iki bağımsız kuyrukla (kuyrukGC, kuyrukUmami)
//    birbirinden tamamen izole çalıştırır; dış yönlendirmelerin
//    (referrer) alt sayfa ve olaylarda tekrar sayılmasını önler.
// =====================================================

(function () {
    'use strict';

    var ANA_BASLIK = 'ÖğrenciYemek — Öğrenci Yemek Rehberi';
    var aktifYol = '/';
    var aktifBaslik = ANA_BASLIK;

    var kuyrukGC = [];
    var kuyrukUmami = [];
    var denemeGC = 0;
    var denemeUmami = 0;
    var zamanlayiciGC = null;
    var zamanlayiciUmami = null;
    var acilisHazir = false;
    var gcGorunurlukBekliyor = false;  // GoatCounter gorunurluk kuyrugu aktif mi
    var gcGorunurlukDeneme = 0;        // sonsuz donguye karsi ust sinir

    var BEKLEME_ADIMI = 250;   // ms (script yüklenme kontrol aralığı)
    var ACILIS_GECIKMESI = 450; // ms (ilk '/' sayfa kaydının önce gitmesini garantiler)
    var EN_FAZLA_DENEME = 40;  // ~10 saniye

    var UNI_ANAHTAR = 'oy_university';       // app.js ile aynı anahtar
    var GUNLUK_GC_ANAHTAR = 'oy_gc_uni_gun'; // GoatCounter günlük aktif üniversite kilidi
    var GUNLUK_UM_ANAHTAR = 'oy_um_uni_gun'; // Umami günlük aktif üniversite kilidi

    function depodanOku(anahtar) {
        try {
            return window.Store ? window.Store.get(anahtar) : localStorage.getItem(anahtar);
        } catch (e) {
            return null;
        }
    }

    function depoyaYaz(anahtar, deger) {
        try {
            if (window.Store) window.Store.set(anahtar, deger);
            else localStorage.setItem(anahtar, deger);
        } catch (e) { /* yoksay */ }
    }

    function bugun() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    // 1) GoatCounter Kuyruğu (Bağımsız)
    function bosaltGC() {
        if (!acilisHazir) return;
        if (zamanlayiciGC) {
            clearTimeout(zamanlayiciGC);
            zamanlayiciGC = null;
        }

        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            // Sayfa görünür değilse (arka plan sekmesi / PWA ön-yüklemesi)
            // GoatCounter saymaz. ESKİDEN burada sadece return ediliyordu:
            // kuyruktaki olaylar bir daha hiç denenmiyor ve sessizce
            // kayboluyordu. Umami'de aynı kontrol olmadığı için olaylar
            // orada görünüp GoatCounter'da görünmüyordu. Artık sayfa
            // görünür olunca tekrar deneniyor.
            if (typeof window.goatcounter.filter === 'function'
                && window.goatcounter.filter() === 'visibilityState') {
                if (!gcGorunurlukBekliyor) {
                    gcGorunurlukBekliyor = true;
                    document.addEventListener('visibilitychange', function tekrarDene() {
                        if (document.visibilityState === 'visible') {
                            document.removeEventListener('visibilitychange', tekrarDene);
                            gcGorunurlukBekliyor = false;
                            bosaltGC();
                        }
                    });
                }
                // Yedek: görünürlük olayı hiç gelmezse zamanlayıcıyla dene
                if (gcGorunurlukDeneme++ < 60) {
                    zamanlayiciGC = setTimeout(bosaltGC, 1000);
                }
                return;
            }
            while (kuyrukGC.length) {
                var oge = kuyrukGC.shift();
                try {
                    window.goatcounter.count({
                        path: oge.yol,
                        title: oge.baslik,
                        event: !!oge.olayMi,
                        referrer: '' // Dış referrer yalnızca ilk '/' açılışında sayılır
                    });
                    if (oge.gunlukIsaret) {
                        depoyaYaz(GUNLUK_GC_ANAHTAR, oge.gunlukIsaret);
                    }
                } catch (e) {
                    /* sayaç asla uygulamayı bozmamalı */
                }
            }
            return;
        }

        if (denemeGC++ < EN_FAZLA_DENEME) {
            zamanlayiciGC = setTimeout(bosaltGC, BEKLEME_ADIMI);
        }
    }

    // 2) Umami Kuyruğu (Bağımsız)
    function bosaltUmami() {
        if (!acilisHazir) return;
        if (zamanlayiciUmami) {
            clearTimeout(zamanlayiciUmami);
            zamanlayiciUmami = null;
        }

        if (window.umami && typeof window.umami.track === 'function') {
            while (kuyrukUmami.length) {
                var oge = kuyrukUmami.shift();
                try {
                    if (oge.tip === 'sayfa') {
                        (function (hedefYol, hedefBaslik) {
                            window.umami.track(function (props) {
                                return Object.assign({}, props, {
                                    url: hedefYol,
                                    title: hedefBaslik,
                                    referrer: ''
                                });
                            });
                        })(oge.yol, oge.baslik);
                    } else {
                        (function (olayAdi, olayVerisi, olayYolu, olayBasligi) {
                            window.umami.track(function (props) {
                                var temel = Object.assign({}, props, {
                                    url: olayYolu,
                                    title: olayBasligi,
                                    referrer: '',
                                    name: olayAdi
                                });
                                if (olayVerisi) temel.data = olayVerisi;
                                return temel;
                            });
                        })(oge.ad, oge.veri, oge.sayfaYolu || aktifYol, oge.sayfaBasligi || aktifBaslik);
                    }
                    if (oge.gunlukIsaret) {
                        depoyaYaz(GUNLUK_UM_ANAHTAR, oge.gunlukIsaret);
                    }
                } catch (e) {
                    /* sayaç asla uygulamayı bozmamalı */
                }
            }
            return;
        }

        if (denemeUmami++ < EN_FAZLA_DENEME) {
            zamanlayiciUmami = setTimeout(bosaltUmami, BEKLEME_ADIMI);
        }
    }

    // Umami olay adını 50 karakterde keser; GoatCounter kesmez. Uzun adlı
    // üniversitelerde iki panelde farklı ad oluşmasın diye ikisine de aynı
    // (kırpılmış) ad gönderilir.
    var EN_UZUN_OLAY_ADI = 50;
    function olayAdiKirp(ad) {
        return String(ad).slice(0, EN_UZUN_OLAY_ADI);
    }

    // Her iki sayaca birebir aynı anda Özel Olay (Event) gönderir
    function olay(ad, baslik, ekVeri) {
        ad = olayAdiKirp(ad);
        kuyrukGC.push({
            yol: ad,
            baslik: baslik,
            olayMi: true
        });
        bosaltGC();

        kuyrukUmami.push({
            tip: 'olay',
            ad: ad,
            veri: ekVeri || { baslik: baslik },
            sayfaYolu: aktifYol,
            sayfaBasligi: aktifBaslik
        });
        bosaltUmami();
    }

    // Her iki sayaca birebir aynı anda Sayfa Görüntülemesi (Pageview) gönderir
    function sayfaGoruntuleme(yol, baslik) {
        aktifYol = yol;
        aktifBaslik = baslik;

        kuyrukGC.push({
            yol: yol,
            baslik: baslik,
            olayMi: false
        });
        bosaltGC();

        kuyrukUmami.push({
            tip: 'sayfa',
            yol: yol,
            baslik: baslik
        });
        bosaltUmami();
    }

    function uygulamadanMiAcildi() {
        try {
            if (window.matchMedia
                && window.matchMedia('(display-mode: standalone)').matches) {
                return true;
            }
            if (window.navigator.standalone === true) {
                return true;
            }
            // manifest start_url "/?mod=app" olduğu için bu parametre gelir
            return /[?&]mod=app\b/.test(window.location.search);
        } catch (e) {
            return false;
        }
    }

    // Üniversite adı -> URL güvenli kısa ad
    // "Orta Doğu Teknik Üniversitesi" -> "orta-dogu-teknik-universitesi"
    function kisaAd(ad) {
        return String(ad)
            .toLocaleLowerCase('tr')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
            .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Seçili üniversitesiyle siteyi kullanan kişi — cihaz başına günde 1 kez.
    // İki sayaç kendi günlük anahtarını bağımsız tutar; çevrimdışı açılışta
    // anahtar yazılmaz, internet geldiğinde kayıp yaşanmaz.
    function gunlukAktifUniversite() {
        var ad = depodanOku(UNI_ANAHTAR);
        if (!ad || typeof ad !== 'string') return;

        var tarih = bugun();
        var olayAdi = olayAdiKirp('uni-aktif/' + kisaAd(ad));
        var olayBasligi = 'Aktif kullanıcı: ' + ad;

        if (depodanOku(GUNLUK_GC_ANAHTAR) !== tarih) {
            kuyrukGC.push({
                yol: olayAdi,
                baslik: olayBasligi,
                olayMi: true,
                gunlukIsaret: tarih
            });
            bosaltGC();
        }

        if (depodanOku(GUNLUK_UM_ANAHTAR) !== tarih) {
            kuyrukUmami.push({
                tip: 'olay',
                ad: olayAdi,
                veri: { universite: ad },
                sayfaYolu: aktifYol,
                sayfaBasligi: aktifBaslik,
                gunlukIsaret: tarih
            });
            bosaltUmami();
        }
    }

    // Kullanıcı üniversitesini seçtiğinde / değiştirdiğinde
    function universiteSecildi(ad) {
        if (!ad) return;
        olay('uni-secim/' + kisaAd(ad), 'Üniversite seçildi: ' + ad, { universite: ad });
        // İlk kez bugün seçim yapan öğrenci de bugünün aktif öğrencileri arasında sayılsın
        gunlukAktifUniversite();
    }

    // Üniversite Yemekleri ekranında bir üniversitenin menü kartına tıklandığında
    function universiteMenuTiklandi(ad) {
        if (!ad) return;
        olay('uni-menu/' + kisaAd(ad), 'Üniversite menüsü tıklandı: ' + ad, { universite: ad });
    }

    // Ana menü sayfalarına (Üniversite, KYK, Gençlik, Millet) girildiğinde
    // Her iki sayaca da 1 adet gerçek Pageview gönderilir (çift sayım yapılmaz).
    var SAYFA_HARITASI = {
        universities: { sayfaYolu: '/universite-yemekleri', baslik: 'Üniversite Yemekleri' },
        kyk:          { sayfaYolu: '/kyk-yemekleri',        baslik: 'KYK Yemekleri' },
        genclik:      { sayfaYolu: '/genclik-sofrasi',      baslik: 'Gençlik Sofrası' },
        millet:       { sayfaYolu: '/millet-kutuphanesi',   baslik: 'Millet Kütüphanesi' }
    };

    function sayfaAcildi(ekranKodu) {
        if (ekranKodu === 'home') {
            aktifYol = '/';
            aktifBaslik = ANA_BASLIK;
            return;
        }
        var bilgi = SAYFA_HARITASI[ekranKodu];
        if (!bilgi) return;
        sayfaGoruntuleme(bilgi.sayfaYolu, bilgi.baslik);
    }

    // Instagram takip kartına tıklandığında
    function instagramTiklandi() {
        olay('instagram-tiklama', 'Instagram takip kartına tıklandı', { hesap: '@ogrenciyemek.com_' });
    }

    // =====================================================
    // KURULUM SAYIMI
    //
    //   kurulum                → her yeni kurulum (tüm platformların toplamı)
    //   kurulum/ios            → aynı kurulumun platform kırılımı
    //   kurulum/android
    //   kurulum/masaustu
    //   kurulum-eski/<platform>→ bu sayım eklenmeden ÖNCE kurulmuş cihaz;
    //                            güncellemeden sonraki ilk açılışta 1 kez.
    //                            Yeni kurulum DEĞİLDİR, 'kurulum'a katılmaz.
    //
    // İki sinyal kullanılır:
    //  a) appinstalled — Chrome/Edge (Android + masaüstü) kurulum anında verir.
    //  b) Uygulama penceresinden ilk açılış — iOS appinstalled göndermediği
    //     için iPhone'da tek yol budur; Android'de (a) kaçarsa yedektir.
    //
    // Cihaz başına tek sayım 'oy_kurulum' anahtarıyla sağlanır:
    //   "bekliyor|yeni|ios|ilk-acilis" → karar verildi, henüz gönderilmedi
    //   "1731400000000"                → gönderildi (zaman damgası)
    // =====================================================
    var KURULUM_ANAHTAR = 'oy_kurulum';
    var SURUM_ANAHTAR = 'oy_kurulum_takip'; // bu sayımı içeren sürüm bu depoda ilk ne zaman çalıştı

    var PLATFORM_ETIKET = { ios: 'iPhone/iPad', android: 'Android', masaustu: 'Masaüstü' };

    function platform() {
        try {
            var ua = navigator.userAgent || '';
            if (/iPad|iPhone|iPod/.test(ua)
                || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
                return 'ios';
            }
            if (/Android/i.test(ua)) return 'android';
        } catch (e) { /* yoksay */ }
        return 'masaustu';
    }

    // Kurulu uygulamanın deposu tarayıcınınkinden AYRI mı?
    // Safari ailesinde (iOS'taki tüm tarayıcılar + macOS Safari) ayrıdır;
    // Chrome/Edge/Firefox'ta uygulama tarayıcıyla aynı depoyu kullanır.
    function depoAyriMi() {
        if (platform() === 'ios') return true;
        try {
            var ua = navigator.userAgent || '';
            return /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android/.test(ua);
        } catch (e) {
            return false;
        }
    }

    // Yalnızca gerçek uygulama penceresi. (?mod=app burada bilerek sayılmaz:
    // o adres paylaşılıp tarayıcıda açılabilir, kurulum kanıtı değildir.)
    function uygulamaPenceresi() {
        try {
            return (window.matchMedia
                    && window.matchMedia('(display-mode: standalone)').matches)
                || window.navigator.standalone === true;
        } catch (e) {
            return false;
        }
    }

    function depoKalici() {
        try {
            return !!(window.Store && window.Store.available());
        } catch (e) {
            return false;
        }
    }

    function kurulumKaydet(tur, yontem) {
        depoyaYaz(KURULUM_ANAHTAR, ['bekliyor', tur, platform(), yontem].join('|'));
        kurulumGonder();
    }

    // Bekleyen kurulum kaydını gönderir. Çevrimdışıysa bağlantıyı bekler;
    // o da olmazsa kayıt depoda durur ve sonraki açılışta gönderilir.
    function kurulumGonder() {
        var durum = depodanOku(KURULUM_ANAHTAR);
        if (!durum || String(durum).indexOf('bekliyor|') !== 0) return;

        if (navigator.onLine === false) {
            window.addEventListener('online', function cevrimici() {
                window.removeEventListener('online', cevrimici);
                kurulumGonder();
            });
            return;
        }

        var parca = String(durum).split('|');
        var tur = parca[1];
        var plt = PLATFORM_ETIKET[parca[2]] ? parca[2] : platform();
        var yontem = parca[3] || '';
        var veri = { platform: PLATFORM_ETIKET[plt], yontem: yontem };

        // Önce işaretle: olay kuyruğa girdikten sonra tekrar sayılmasın
        depoyaYaz(KURULUM_ANAHTAR, String(Date.now()));

        if (tur === 'yeni') {
            olay('kurulum', 'Uygulama telefona kuruldu', veri);
            olay('kurulum/' + plt, 'Kurulum: ' + PLATFORM_ETIKET[plt], veri);
        } else {
            olay('kurulum-eski/' + plt, 'Önceden kurulmuş cihaz: ' + PLATFORM_ETIKET[plt], veri);
        }
    }

    // (a) Tarayıcının kurulum sinyali. Dinleyici dosya yüklenir yüklenmez
    // bağlanır; olay kuyrukta bekler, açılış kaydından sonra gönderilir.
    window.addEventListener('appinstalled', function () {
        var son = parseInt(depodanOku(KURULUM_ANAHTAR), 10);
        // Aynı kurulum az önce (b) yoluyla sayıldıysa tekrar sayma.
        // Daha eski bir damga varsa bu bir yeniden kurulumdur, sayılır.
        if (son && Date.now() - son < 120000) return;
        kurulumKaydet('yeni', 'appinstalled');
    });

    // (b) Kurulu olduğu görülen ama henüz sayılmamış cihaz.
    function kurulumSiniflandir(yontem, oncedenGoruldu) {
        if (depodanOku(KURULUM_ANAHTAR)) return;
        var yeni = depoAyriMi()
            // Ayrı depo: uygulama ilk kez açılıyorsa depo boştur → yeni kurulum.
            // Depoda eski veri varsa uygulama bu sayımdan önce kurulmuştur.
            ? (window.Store && window.Store.ilkAcilis === true)
            // Ortak depo: bu sürüm tarayıcıda daha önce çalıştıysa ve kurulum
            // hâlâ sayılmadıysa appinstalled kaçmıştır → yeni kurulum.
            // Bu sürüm ilk kez çalışıyorsa uygulama zaten kuruluydu.
            : oncedenGoruldu;
        kurulumKaydet(yeni ? 'yeni' : 'eski', yontem);
    }

    function kurulumTespit() {
        var oncedenGoruldu = depodanOku(SURUM_ANAHTAR) !== null;
        if (!oncedenGoruldu) depoyaYaz(SURUM_ANAHTAR, bugun());

        // Depo kalıcı değilse (gizli mod vb.) "ilk açılış" her seferinde
        // doğru çıkar ve her açılış kurulum sayılırdı — hiç deneme.
        if (!depoKalici()) return;

        if (depodanOku(KURULUM_ANAHTAR)) {
            kurulumGonder(); // önceki açılıştan bekleyen kayıt varsa
            return;
        }

        if (uygulamaPenceresi()) {
            kurulumSiniflandir('ilk-acilis', oncedenGoruldu);
            return;
        }

        // Tarayıcıdayız: destekleyen tarayıcıda (Android Chrome) kurulu mu sor
        try {
            if (navigator.getInstalledRelatedApps) {
                navigator.getInstalledRelatedApps().then(function (uygulamalar) {
                    if (uygulamalar && uygulamalar.length) {
                        kurulumSiniflandir('tarayici-tespit', oncedenGoruldu);
                    }
                }).catch(function () { /* desteklenmiyor */ });
            }
        } catch (e) { /* yoksay */ }
    }

    window.OYAnalytics = {
        universiteSecildi: universiteSecildi,
        universiteMenuTiklandi: universiteMenuTiklandi,
        sayfaAcildi: sayfaAcildi,
        instagramTiklandi: instagramTiklandi
    };

    var baslatildi = false;
    function baslat() {
        if (baslatildi) return;
        if ('visibilityState' in document && (document.visibilityState === 'hidden' || document.visibilityState === 'prerender')) {
            return;
        }
        baslatildi = true;

        if (uygulamadanMiAcildi()) {
            olay('uygulamadan-acilis', 'Kurulu uygulamadan açıldı', { ortam: 'Uygulama (PWA)' });
        } else {
            olay('webden-acilis', 'Web tarayıcıdan açıldı', { ortam: 'Web Tarayıcı' });
        }

        gunlukAktifUniversite();

        // Kurulum: iPhone dahil, appinstalled gelmeyen durumları yakalar
        kurulumTespit();

        // İlk '/' ana sayfa görüntülemesinin her iki sayaçta da önce kaydolması için kısa gecikme
        setTimeout(function () {
            acilisHazir = true;
            bosaltGC();
            bosaltUmami();
        }, ACILIS_GECIKMESI);
    }

    function gorunurOldugundaBaslat() {
        if ('visibilityState' in document && (document.visibilityState === 'hidden' || document.visibilityState === 'prerender')) {
            var gorunurDinleyici = function () {
                if (document.visibilityState === 'visible') {
                    document.removeEventListener('visibilitychange', gorunurDinleyici);
                    baslat();
                }
            };
            document.addEventListener('visibilitychange', gorunurDinleyici);
        } else {
            baslat();
        }
    }

    if (document.readyState === 'complete') {
        gorunurOldugundaBaslat();
    } else {
        window.addEventListener('load', gorunurOldugundaBaslat);
    }
})();
