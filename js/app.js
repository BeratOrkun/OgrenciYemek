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

            case 'cankaya':
                Screens.renderCankayaScreen(document.getElementById('sub-screen'));
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
    },

    // -------------------------------------------------------
    // Settings Modal
    // -------------------------------------------------------
    openSettings() {
        const modal = document.getElementById('settings-modal');
        const cityEl = document.getElementById('settings-city');
        const uniEl = document.getElementById('settings-uni');

        if (cityEl) cityEl.textContent = localStorage.getItem(this.KEYS.city) || '-';
        if (uniEl) uniEl.textContent = localStorage.getItem(this.KEYS.university) || '-';

        modal.classList.add('active');
    },

    closeSettings() {
        document.getElementById('settings-modal').classList.remove('active');
    },

    resetOnboarding() {
        localStorage.removeItem(this.KEYS.onboardingDone);
        localStorage.removeItem(this.KEYS.city);
        localStorage.removeItem(this.KEYS.university);
        localStorage.removeItem(this.KEYS.kykDorm);
        this.closeSettings();
        this.showScreen('onboarding');
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
        App.closeSettings();
    }
});

// Back button handler (browser)
window.addEventListener('popstate', () => {
    if (App.currentScreen !== 'home' && App.currentScreen !== 'onboarding') {
        App.showScreen('home');
    }
});
