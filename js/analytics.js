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

    function baslat() {
        if (uygulamadanMiAcildi()) {
            olay('uygulamadan-acilis', 'Kurulu uygulamadan açıldı');
        }

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
