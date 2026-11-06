// =====================================================
// ÖğrenciYemek — Ana Uygulama Mantığı
// Onboarding, Routing, localStorage, PWA
// =====================================================

const App = {
    // LocalStorage keys
    KEYS: {
        city: 'oy_city',
        university: 'oy_university',
        kykDorm: 'oy_kyk_dorm',
        onboardingDone: 'oy_onboarding_done'
    },

    currentScreen: null,

    // -------------------------------------------------------
    // Init
    // -------------------------------------------------------
    init() {
        // Register PWA service worker
        this.registerSW();

        // Check if onboarding is done
        const onboardingDone = localStorage.getItem(this.KEYS.onboardingDone);

        if (onboardingDone) {
            this.showScreen('home');
        } else {
            this.showScreen('onboarding');
        }
    },

    // -------------------------------------------------------
    // Service Worker Registration
    // -------------------------------------------------------
    registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // SW registration failed (probably file:// protocol), ignore
            });
        }
    },

    // -------------------------------------------------------
    // Screen Navigation
    // -------------------------------------------------------
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        this.currentScreen = screenId;

        switch (screenId) {
            case 'onboarding':
                document.getElementById('onboarding-screen').classList.add('active');
                this.initOnboarding();
                break;

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
        if (screenId !== 'home' && screenId !== 'onboarding') {
            const subScreen = document.getElementById('sub-screen');
            if (subScreen) subScreen.scrollTop = 0;
        }
    },

    // -------------------------------------------------------
    // Onboarding
    // -------------------------------------------------------
    initOnboarding() {
        // Varsayılan şehri doğrudan Ankara yapıyoruz
        localStorage.setItem(this.KEYS.city, 'Ankara');
        this._populateUniversityList();
    },

    _populateUniversityList() {
        const selectEl = document.getElementById('onboarding-uni-select');
        if (!selectEl) return;

        const universities = APP_DATA.universities;
        // Mevcut optionları koruyarak (ilk baştaki disabled olanı) diğerlerini ekleyelim
        const optionsHTML = universities.map(uni => `
            <option value="${uni.name.replace(/'/g, "\\'")}">
                ${uni.icon} ${uni.name}
            </option>
        `).join('');
        
        selectEl.innerHTML = `<option value="" disabled selected>Üniversite seçin...</option>` + optionsHTML;
    },

    selectUniversity(uniName) {
        localStorage.setItem(this.KEYS.university, uniName);
        this.completeOnboarding();
    },

    completeOnboarding() {
        localStorage.setItem(this.KEYS.onboardingDone, 'true');
        this.showScreen('home');
    },

    // -------------------------------------------------------
    // Home Screen
    // -------------------------------------------------------
    renderHome() {
        const uni = localStorage.getItem(this.KEYS.university) || 'Öğrenci';
        const city = localStorage.getItem(this.KEYS.city) || 'Ankara';

        // Find short name
        const uniData = APP_DATA.universities.find(u => u.name === uni);
        const shortName = uniData ? uniData.shortName : uni;

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
            titleEl.innerHTML = `<span>${shortName}</span> öğrencisi, bugün ne yiyelim?`;
        }

        // Update quick info
        const quickInfoEl = document.getElementById('quick-info-text');
        if (quickInfoEl) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            quickInfoEl.innerHTML = `<strong>${today.toLocaleDateString('tr-TR', options)}</strong> ${city}`;
        }

        // Selamlamanın yanındaki üniversite butonu
        const chipLabel = document.getElementById('uni-chip-label');
        if (chipLabel) chipLabel.textContent = shortName;
    },

    // -------------------------------------------------------
    // Üniversite Seçici (selamlamanın sağındaki buton)
    // -------------------------------------------------------
    openUniPicker() {
        const modal = document.getElementById('uni-picker-modal');
        if (!modal) return;

        this._renderUniPickerList();

        const search = document.getElementById('uni-picker-search');
        if (search) {
            search.value = '';
            search.oninput = () => this._renderUniPickerList(search.value);
        }

        modal.classList.add('active');
    },

    closeUniPicker() {
        const modal = document.getElementById('uni-picker-modal');
        if (modal) modal.classList.remove('active');
    },

    _renderUniPickerList(term = '') {
        const listEl = document.getElementById('uni-picker-list');
        if (!listEl) return;

        const current = localStorage.getItem(this.KEYS.university);
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
        localStorage.setItem(this.KEYS.university, uniName);
        localStorage.setItem(this.KEYS.onboardingDone, 'true');
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

// Back button handler (browser)
window.addEventListener('popstate', () => {
    if (App.currentScreen !== 'home' && App.currentScreen !== 'onboarding') {
        App.showScreen('home');
    }
});
