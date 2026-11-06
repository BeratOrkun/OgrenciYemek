// =====================================================
// ÖğrenciYemek — Ana Uygulama Mantığı
// Yonlendirme, localStorage, PWA
// =====================================================

const App = {
    // LocalStorage keys
    KEYS: {
        city: 'oy_city',
        university: 'oy_university',
        kykDorm: 'oy_kyk_dorm'
    },

    currentScreen: null,

    // Uygulamanın geçmişe eklediği girdi sayısı (geri tuşu yönetimi)
    _historyDepth: 0,

    // PWA kurulum istemi (Chrome/Edge/Android tarafindan saglanir)
    deferredInstallPrompt: null,

    // -------------------------------------------------------
    // Init
    // -------------------------------------------------------
    init() {
        // Register PWA service worker
        this.registerSW();

        // "Telefonuna yükle" kartını hazırla
        this.initInstallPrompt();

        // Şehir sabit: Ankara
        if (!Store.get(this.KEYS.city)) {
            Store.set(this.KEYS.city, 'Ankara');
        }

        // Geçmişin tabanı: buradan geri basmak uygulamayı kapatır
        this._historyDepth = 0;
        history.replaceState({ oyScreen: 'home', oyDepth: 0 }, '');

        // Karşılama ekranı yok; doğrudan ana ekran açılır
        this.showScreen('home');

        // Menüleri arka planda hazırla (ilk açılışta da)
        this.prefetchMenus();
    },

    // -------------------------------------------------------
    // Menüleri arka planda önden çek
    // Ana ekran boyanır boyanmaz KYK ve Gençlik Sofrası verisi
    // sessizce indirilip cihaza yazılır; kullanıcı o ekranlara
    // girdiğinde menü anında hazır olur.
    // -------------------------------------------------------
    prefetchMenus() {
        const run = () => {
            const city = Store.get(this.KEYS.city) || 'Ankara';
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            // KYK — başarılı olursa hem belleğe hem localStorage'a yazılır
            try {
                Screens._fetchKYKLive(dateStr, city).catch(() => {});
            } catch { /* yoksay */ }

            // Gençlik Sofrası — loadMenu kendi önbelleğine yazar
            try {
                GenclikSofralariAPI.loadMenu().catch(() => {});
            } catch { /* yoksay */ }
        };

        // İlk boyamayı geciktirmemek için boşta çalıştır
        if ('requestIdleCallback' in window) {
            requestIdleCallback(run, { timeout: 2500 });
        } else {
            setTimeout(run, 1200);
        }
    },

    // -------------------------------------------------------
    // Service Worker Registration
    // -------------------------------------------------------
    registerSW() {
        if ('serviceWorker' in navigator) {
            // Göreceli yol: hem alan adı kökünde hem de GitHub Pages
            // proje alt dizininde (/OgrenciYemek/) doğru çözümlenir
            navigator.serviceWorker.register('sw.js').catch(() => {
                // SW registration failed (probably file:// protocol), ignore
            });
        }
    },

    // -------------------------------------------------------
    // PWA — "Telefonuna Yükle" kartı
    // -------------------------------------------------------
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true;
    },

    isIOS() {
        const ua = navigator.userAgent;
        // iPadOS 13+ kendini Mac gibi tanıtıyor; dokunma desteğiyle ayırt ediliyor
        return /iPad|iPhone|iPod/.test(ua)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },

    // Kurulu olup olmadığı localStorage'a YAZILMAZ. Kullanıcı uygulamayı
    // silerse kart tekrar görünsün diye her açılışta canlı olarak tespit
    // edilir: Chrome kuruluyken beforeinstallprompt'u hiç tetiklemez.
    relatedAppInstalled: false,

    initInstallPrompt() {
        // Chrome/Edge: yalnızca kurulu DEĞİLSE tetiklenir
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredInstallPrompt = e;
            this.relatedAppInstalled = false;
            this.refreshInstallCard();
        });

        // Kurulum tamamlandığı anda kartı kaldır
        window.addEventListener('appinstalled', () => {
            this.deferredInstallPrompt = null;
            this.relatedAppInstalled = true;
            this.refreshInstallCard();
        });

        // Destekleyen tarayıcılarda kurulu olup olmadığını doğrudan sor
        this.checkInstalledApp();

        this.refreshInstallCard();
    },

    async checkInstalledApp() {
        if (!navigator.getInstalledRelatedApps) return;
        try {
            const apps = await navigator.getInstalledRelatedApps();
            this.relatedAppInstalled = apps.length > 0;
            this.refreshInstallCard();
        } catch {
            /* desteklenmiyor veya izin yok — diğer sinyallere güven */
        }
    },

    refreshInstallCard() {
        const card = document.getElementById('install-card');
        if (!card) return;

        // Uygulama olarak açıldıysa ya da kurulu olduğu doğrulandıysa gizle
        if (this.isStandalone() || this.relatedAppInstalled) {
            card.hidden = true;
            return;
        }

        const btn = document.getElementById('install-card-btn');
        const steps = document.getElementById('install-steps');
        const desc = document.getElementById('install-card-desc');

        if (this.deferredInstallPrompt) {
            // Tek dokunuşla kurulabilir (ve kurulu değil)
            card.hidden = false;
            if (btn) btn.hidden = false;
            if (steps) steps.hidden = true;
        } else if (this.isIOS()) {
            // iOS Safari beforeinstallprompt desteklemiyor — elle adımlar
            card.hidden = false;
            if (btn) btn.hidden = true;
            if (steps) steps.hidden = false;
            if (desc) {
                desc.textContent = "ÖğrenciYemek'i ana ekranına ekle, uygulama gibi tek dokunuşla aç. "
                    + "İndirme boyutu yalnızca ~100 KB.";
            }
        } else {
            // Kurulum bu tarayıcıda desteklenmiyor
            card.hidden = true;
        }
    },

    async triggerInstall() {
        if (!this.deferredInstallPrompt) {
            this.refreshInstallCard();
            return;
        }

        const promptEvent = this.deferredInstallPrompt;
        // Tek kullanımlık: aynı olay tekrar kullanılamaz
        this.deferredInstallPrompt = null;

        try {
            promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === 'accepted') {
                this.relatedAppInstalled = true;
            }
        } catch {
            /* istem gösterilemedi */
        }

        this.refreshInstallCard();
    },

    // -------------------------------------------------------
    // Screen Navigation
    // -------------------------------------------------------
    // fromHistory: popstate'ten geliyorsa yeni geçmiş girdisi eklenmez,
    // yoksa geri tuşu sonsuz döngüye girer.
    showScreen(screenId, fromHistory = false) {
        // Ekran değişiyorsa açık modalı kapat
        if (screenId !== this.currentScreen) {
            this.closeUniPicker(true);
        }

        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        const previous = this.currentScreen;
        this.currentScreen = screenId;

        // Alt ekrana girerken geçmişe bir giriş ekle ki cihazın geri
        // tuşu uygulamadan çıkmak yerine ana ekrana dönsün.
        if (!fromHistory) {
            const isSub = screenId !== 'home';
            if (isSub && previous !== screenId) {
                this._historyDepth += 1;
                history.pushState({ oyScreen: screenId, oyDepth: this._historyDepth }, '');
            } else if (screenId === 'home' && this._historyDepth > 0) {
                // Uygulama içi "←": kaç girdi eklediysek hepsini geri al,
                // böylece derinlik ne olursa olsun ana ekrana dönülür.
                history.go(-this._historyDepth);
                return;
            }
        }

        switch (screenId) {
            case 'home':
                document.getElementById('home-screen').classList.add('active');
                this.renderHome();
                break;

            case 'universities':
                document.getElementById('sub-screen').classList.add('active');
                Screens.renderUniversityScreen(document.getElementById('sub-screen'));
                break;

            case 'kyk':
                document.getElementById('sub-screen').classList.add('active');
                Screens.renderKYKScreen(document.getElementById('sub-screen'));
                break;

            case 'genclik':
                document.getElementById('sub-screen').classList.add('active');
                Screens.renderGenclikSofrasiScreen(document.getElementById('sub-screen'));
                break;

            case 'millet':
                document.getElementById('sub-screen').classList.add('active');
                Screens.renderMilletKutuphanesiScreen(document.getElementById('sub-screen'));
                break;
        }
        // Always lock body scroll - screens manage their own internal scrolling
        document.body.classList.add('no-scroll');

        // Scroll sub-screen container to top when navigating
        if (screenId !== 'home') {
            const subScreen = document.getElementById('sub-screen');
            if (subScreen) subScreen.scrollTop = 0;
        }
    },

    // -------------------------------------------------------
    // Home Screen
    // -------------------------------------------------------
    renderHome() {
        const storedUni = Store.get(this.KEYS.university);
        const city = Store.get(this.KEYS.city) || 'Ankara';

        // Henüz seçim yapılmamış olabilir — uygulama yine de çalışır
        const uniData = storedUni
            ? APP_DATA.universities.find(u => u.name === storedUni)
            : null;
        const shortName = uniData ? uniData.shortName : (storedUni || 'Öğrenci');

        const greetingEl = document.getElementById('home-greeting');
        const titleEl = document.getElementById('home-title');

        if (greetingEl) {
            const hour = new Date().getHours();
            let greeting = 'Merhaba';
            if (hour < 12) greeting = 'Günaydın';
            else if (hour < 18) greeting = 'İyi günler';
            else greeting = 'İyi akşamlar';
            greetingEl.textContent = `${greeting} 👋`;
        }

        if (titleEl) {
            // Seçim yoksa "Öğrenci öğrencisi" gibi tuhaf bir metin çıkmasın
            titleEl.textContent = '';
            if (storedUni) {
                const accent = document.createElement('span');
                accent.textContent = shortName;
                titleEl.append(accent, ' öğrencisi, bugün ne yiyelim?');
            } else {
                const accent = document.createElement('span');
                accent.textContent = 'Bugün';
                titleEl.append(accent, ' ne yiyelim?');
            }
        }

        // Update quick info
        const quickInfoEl = document.getElementById('quick-info-text');
        if (quickInfoEl) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            quickInfoEl.innerHTML = `<strong>${today.toLocaleDateString('tr-TR', options)}</strong> ${city}`;
        }

        // Üstteki üniversite seçim butonu
        const bar = document.getElementById('uni-select-bar');
        const valueEl = document.getElementById('uni-select-value');
        if (valueEl) {
            valueEl.textContent = storedUni ? (uniData ? uniData.name : storedUni) : 'Üniversiteni seç';
        }
        if (bar) {
            // Seçim yapılmadıysa butonu vurgula
            bar.classList.toggle('empty', !storedUni);
        }
    },

    // -------------------------------------------------------
    // Üniversite Seçici (selamlamanın sağındaki buton)
    // -------------------------------------------------------
    uniPickerOpen: false,

    openUniPicker() {
        const modal = document.getElementById('uni-picker-modal');
        if (!modal || this.uniPickerOpen) return;

        this._renderUniPickerList();

        const search = document.getElementById('uni-picker-search');
        if (search) {
            search.value = '';
            search.oninput = () => this._renderUniPickerList(search.value);
        }

        modal.classList.add('active');
        this.uniPickerOpen = true;
        // Geri tuşu önce modalı kapatsın, uygulamadan çıkmasın.
        // Derinlik artmaz: modal bir ekran değil.
        history.pushState({ oyModal: 'uni-picker', oyDepth: this._historyDepth }, '');
    },

    // silent: geçmişe dokunmadan kapat (popstate veya ekran değişimi)
    closeUniPicker(silent = false) {
        const modal = document.getElementById('uni-picker-modal');
        if (!modal || !this.uniPickerOpen) return;

        modal.classList.remove('active');
        this.uniPickerOpen = false;

        if (!silent) {
            // Modal için eklenen geçmiş girdisini geri al
            history.back();
        }
    },

    _renderUniPickerList(term = '') {
        const listEl = document.getElementById('uni-picker-list');
        if (!listEl) return;

        const current = Store.get(this.KEYS.university);
        const q = term.toLocaleLowerCase('tr').trim();

        const matches = APP_DATA.universities.filter(uni => {
            if (!q) return true;
            const haystack = `${uni.name} ${uni.shortName || ''}`.toLocaleLowerCase('tr');
            return haystack.includes(q);
        });

        if (!matches.length) {
            listEl.innerHTML = `<p class="uni-picker-empty">Eşleşen üniversite bulunamadı.</p>`;
            return;
        }

        listEl.innerHTML = matches.map(uni => `
            <button type="button"
                    class="uni-picker-item${uni.name === current ? ' selected' : ''}"
                    onclick="App.pickUniversity('${uni.name.replace(/'/g, "\\'")}')">
                <span class="uni-picker-item-icon" aria-hidden="true">${uni.icon}</span>
                <span class="uni-picker-item-text">
                    <span class="uni-picker-item-name">${uni.name}</span>
                    <span class="uni-picker-item-meta">${uni.type}</span>
                </span>
                ${uni.name === current ? '<span class="uni-picker-item-check" aria-hidden="true">✓</span>' : ''}
            </button>
        `).join('');
    },

    pickUniversity(uniName) {
        Store.set(this.KEYS.university, uniName);
        this.closeUniPicker();
        this.renderHome();
    }
};

// -------------------------------------------------------
// Boot
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        App.closeUniPicker();
    }
});

// Esc ile seçiciyi kapat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') App.closeUniPicker();
});

// Cihaz/tarayıcı geri tuşu
// Sıra: açık modal varsa önce o kapanır, sonra alt ekrandan ana ekrana
// dönülür. Ana ekranda geri basmak uygulamayı kapatır (beklenen davranış).
window.addEventListener('popstate', (e) => {
    // Derinliği her zaman geçmiş girdisinden tazele
    App._historyDepth = (e.state && e.state.oyDepth) || 0;

    // Modal açıksa onu kapat ve burada dur
    if (App.uniPickerOpen) {
        App.closeUniPicker(true);
        return;
    }

    const target = e.state && e.state.oyScreen ? e.state.oyScreen : 'home';
    App.showScreen(target, true);
});
