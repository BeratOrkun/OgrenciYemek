// =====================================================
// ÖğrenciYemek — GoatCounter + Umami Çift Yönlü Olay Takibi
//
// Sayfa görüntülemeleri index.html'deki GoatCounter ve Umami
// script'leri tarafından birbirinden bağımsız otomatik sayılır.
//
// Bu dosya özel olayları (kurulum, uygulamadan açılış, seçilen
// ve aktif üniversite) iki ayrı kuyrukla hem GoatCounter'a hem
// Umami'ye gönderir. İki sayaç birbirinden tamamen izoledir;
// biri yavaşlasa veya engellense bile diğeri çalışmaya devam eder.
// =====================================================

(function () {
    'use strict';

    var kuyrukGC = [];
    var kuyrukUmami = [];
    var denemeGC = 0;
    var denemeUmami = 0;
    var BEKLEME_ADIMI = 250;   // ms
    var EN_FAZLA_DENEME = 40;  // ~10 saniye

    // 1) GoatCounter Kuyruğu (Bağımsız)
    function bosaltGC() {
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            while (kuyrukGC.length) {
                try {
                    window.goatcounter.count(kuyrukGC.shift());
                } catch (e) {
                    /* sayaç asla uygulamayı bozmamalı */
                }
            }
            return;
        }
        if (denemeGC++ < EN_FAZLA_DENEME) {
            setTimeout(bosaltGC, BEKLEME_ADIMI);
        }
    }

    // 2) Umami Kuyruğu (Bağımsız)
    function bosaltUmami() {
        if (window.umami && typeof window.umami.track === 'function') {
            while (kuyrukUmami.length) {
                try {
                    var oge = kuyrukUmami.shift();
                    if (oge.veri) {
                        window.umami.track(oge.ad, oge.veri);
                    } else {
                        window.umami.track(oge.ad);
                    }
                } catch (e) {
                    /* sayaç asla uygulamayı bozmamalı */
                }
            }
            return;
        }
        if (denemeUmami++ < EN_FAZLA_DENEME) {
            setTimeout(bosaltUmami, BEKLEME_ADIMI);
        }
    }

    // Her iki sayaca aynı anda, birbirini etkilemeden gönderir
    function olay(ad, baslik, ekVeri) {
        // GoatCounter'a gönder
        kuyrukGC.push({ path: ad, title: baslik, event: true });
        bosaltGC();

        // Umami'ye gönder
        kuyrukUmami.push({ ad: ad, veri: ekVeri || { baslik: baslik } });
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

    var UNI_ANAHTAR = 'oy_university';      // app.js ile aynı anahtar
    var GUNLUK_ANAHTAR = 'oy_gc_uni_gun';   // "2026-11-08|odtu" — günde bir kez

    // storage.js'teki güvenli katman (Instagram içi tarayıcıda localStorage kapalı olabilir)
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

    // Kullanıcı üniversitesini seçtiğinde / değiştirdiğinde
    function universiteSecildi(ad) {
        if (!ad) return;
        olay('uni-secim/' + kisaAd(ad), 'Üniversite seçildi: ' + ad, { universite: ad });
    }

    // Üniversite Yemekleri ekranında bir üniversitenin menü kartına tıklandığında
    function universiteMenuTiklandi(ad) {
        if (!ad) return;
        olay('uni-menu/' + kisaAd(ad), 'Üniversite menüsü tıklandı: ' + ad, { universite: ad });
    }

    // Ana menü sayfalarına (Üniversite, KYK, Gençlik, Millet) girildiğinde
    var SAYFA_HARITASI = {
        universities: { yol: 'sayfa/universite-yemekleri', baslik: 'Sayfa: Üniversite Yemekleri', ad: 'Üniversite Yemekleri' },
        kyk:          { yol: 'sayfa/kyk-yemekleri',        baslik: 'Sayfa: KYK Yemekleri',        ad: 'KYK Yemekleri' },
        genclik:      { yol: 'sayfa/genclik-sofrasi',      baslik: 'Sayfa: Gençlik Sofrası',      ad: 'Gençlik Sofrası' },
        millet:       { yol: 'sayfa/millet-kutuphanesi',   baslik: 'Sayfa: Millet Kütüphanesi',   ad: 'Millet Kütüphanesi' }
    };

    function sayfaAcildi(ekranKodu) {
        var bilgi = SAYFA_HARITASI[ekranKodu];
        if (!bilgi) return;
        olay(bilgi.yol, bilgi.baslik, { sayfa: bilgi.ad });
    }

    // Instagram takip kartına tıklandığında
    function instagramTiklandi() {
        olay('instagram-tiklama', 'Instagram takip kartına tıklandı', { hesap: '@ogrenciyemek.com_' });
    }

    // Seçili üniversitesiyle siteyi kullanan kişi — cihaz başına günde bir kez.
    // Sayaç eklenmeden önce seçim yapmış kullanıcılar da böylece görünür.
    function gunlukAktifUniversite() {
        var ad = depodanOku(UNI_ANAHTAR);
        if (!ad || typeof ad !== 'string') return;

        var isaret = bugun() + '|' + kisaAd(ad);
        if (depodanOku(GUNLUK_ANAHTAR) === isaret) return;

        olay('uni-aktif/' + kisaAd(ad), 'Aktif kullanıcı: ' + ad, { universite: ad });
        depoyaYaz(GUNLUK_ANAHTAR, isaret);
    }

    window.OYAnalytics = {
        universiteSecildi: universiteSecildi,
        universiteMenuTiklandi: universiteMenuTiklandi,
        sayfaAcildi: sayfaAcildi,
        instagramTiklandi: instagramTiklandi
    };

    function baslat() {
        if (uygulamadanMiAcildi()) {
            olay('uygulamadan-acilis', 'Kurulu uygulamadan açıldı');
        }

        gunlukAktifUniversite();

        // Kurulum tamamlandığı an (iOS bu olayı tetiklemez)
        window.addEventListener('appinstalled', function () {
            olay('kurulum', 'Uygulama telefona kuruldu');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', baslat);
    } else {
        baslat();
    }
})();
