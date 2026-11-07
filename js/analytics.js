// =====================================================
// ÖğrenciYemek — sayaç istemcisi
//
// Kendi sunucumuzdaki count.php'ye ping atar. Dış servis yok,
// çerez yok, kişisel veri gönderilmez — sadece olay adı.
//
// <img> kullanılıyor: fetch'in kısıtlandığı uygulama içi
// tarayıcılarda (Instagram vb.) bile çalışır ve CORS sorunu çıkmaz.
// =====================================================

(function () {
    'use strict';

    var SON_GUN_ANAHTARI = 'oy_sayac_gun';

    function ping(olay, tekilMi) {
        try {
            var url = 'count.php?e=' + encodeURIComponent(olay)
                + (tekilMi ? '&u=1' : '')
                // Önbellek kırıcı: CDN veya tarayıcı araya girip
                // isteği sunucuya ulaştırmazsa sayım eksik kalır
                + '&cb=' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
            var img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.src = url;
        } catch (e) {
            /* sayaç asla uygulamayı bozmamalı */
        }
    }

    // Bugün bu cihazdan ilk açılış mı? (kaba tekil ziyaretçi ölçümü)
    function bugunIlkMi() {
        try {
            var bugun = new Date().toISOString().slice(0, 10);
            // Store varsa onu kullan: depolama engelliyse bile patlamaz
            var depo = (typeof Store !== 'undefined' && Store) ? Store : null;
            var onceki = depo ? depo.get(SON_GUN_ANAHTARI) : null;
            if (onceki === bugun) return false;
            if (depo) depo.set(SON_GUN_ANAHTARI, bugun);
            return true;
        } catch (e) {
            return false;
        }
    }

    function baslat() {
        var tekil = bugunIlkMi();
        ping('view', tekil);

        // Kurulu uygulamadan mı açıldı?
        // manifest start_url "/?mod=app" olduğu için bu parametre gelir.
        try {
            var standalone = window.matchMedia
                && window.matchMedia('(display-mode: standalone)').matches;
            if (standalone || window.navigator.standalone === true
                || /[?&]mod=app\b/.test(window.location.search)) {
                ping('app', false);
            }
        } catch (e) { /* yoksay */ }

        // Kurulum tamamlandığı an
        window.addEventListener('appinstalled', function () {
            ping('install', false);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', baslat);
    } else {
        baslat();
    }
})();
