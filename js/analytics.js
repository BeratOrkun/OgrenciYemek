// =====================================================
// ÖğrenciYemek — GoatCounter olay takibi
//
// Sayfa görüntülemeleri index.html'deki GoatCounter script'i
// tarafından otomatik sayılır. Bu dosya yalnızca iki özel olayı
// ekler: uygulama kurulumu ve kurulu uygulamadan açılış.
//
// GoatCounter çerez kullanmaz, ziyaretçide hiçbir şey saklamaz.
// Script async yüklendiği için olaylar hazır olana kadar
// kuyrukta bekletilir.
// =====================================================

(function () {
    'use strict';

    var kuyruk = [];
    var deneme = 0;
    var BEKLEME_ADIMI = 250;   // ms
    var EN_FAZLA_DENEME = 40;  // ~10 saniye

    function bosalt() {
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            while (kuyruk.length) {
                try {
                    window.goatcounter.count(kuyruk.shift());
                } catch (e) {
                    /* sayaç asla uygulamayı bozmamalı */
                }
            }
            return;
        }
        // Script engellenmişse veya yüklenemediyse sessizce vazgeç
        if (deneme++ < EN_FAZLA_DENEME) {
            setTimeout(bosalt, BEKLEME_ADIMI);
        }
    }

    function olay(ad, baslik) {
        // path olay adı olarak kullanılır; başında "/" olamaz
        kuyruk.push({ path: ad, title: baslik, event: true });
        bosalt();
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
        olay('uni-secim/' + kisaAd(ad), 'Üniversite seçildi: ' + ad);
    }

    // Seçili üniversitesiyle siteyi kullanan kişi — cihaz başına günde bir kez.
    // Sayaç eklenmeden önce seçim yapmış kullanıcılar da böylece görünür.
    function gunlukAktifUniversite() {
        var ad = depodanOku(UNI_ANAHTAR);
        if (!ad || typeof ad !== 'string') return;

        var isaret = bugun() + '|' + kisaAd(ad);
        if (depodanOku(GUNLUK_ANAHTAR) === isaret) return;

        olay('uni-aktif/' + kisaAd(ad), 'Aktif kullanıcı: ' + ad);
        depoyaYaz(GUNLUK_ANAHTAR, isaret);
    }

    window.OYAnalytics = {
        universiteSecildi: universiteSecildi
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
