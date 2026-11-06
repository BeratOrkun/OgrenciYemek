// =====================================================
// ÖğrenciYemek — Ekran Render Fonksiyonları
// =====================================================

const Screens = {
    // -------------------------------------------------------
    // Üniversite Yemekleri Ekranı
    // -------------------------------------------------------
    renderUniversityScreen(container) {
        const userUni = localStorage.getItem('oy_university');
        const universities = APP_DATA.universities;
        const devletCount = universities.filter(u => u.type === 'Devlet').length;
        const vakifCount = universities.filter(u => u.type === 'Vakıf').length;

        // Sort: user's uni first, then Devlet before Vakıf, then by menu availability
        const statusOrder = { available: 0, portal: 1, community: 2, pano: 3, limited: 4, unavailable: 5 };
        const sorted = [...universities].sort((a, b) => {
            if (a.name === userUni) return -1;
            if (b.name === userUni) return 1;
            // Devlet first
            if (a.type === 'Devlet' && b.type !== 'Devlet') return -1;
            if (a.type !== 'Devlet' && b.type === 'Devlet') return 1;
            // Then by menu status
            return (statusOrder[a.menuStatus] ?? 99) - (statusOrder[b.menuStatus] ?? 99);
        });

        container.innerHTML = `
            <div class="sub-header">
                <button type="button" class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🎓 Üniversite Yemekleri</h2>
            </div>

            <div class="uni-filter-tabs" id="uni-filter-tabs">
                <button type="button" class="filter-tab active" data-filter="all">Tümü (${universities.length})</button>
                <button type="button" class="filter-tab" data-filter="devlet">Devlet (${devletCount})</button>
                <button type="button" class="filter-tab" data-filter="vakif">Vakıf (${vakifCount})</button>
            </div>

            <div class="search-input-wrapper mb-md">
                <span class="search-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg></span>
                <input type="text" id="uni-search" placeholder="Üniversite ara..." autocomplete="off">
            </div>

            <div class="uni-list" id="uni-list">
                ${sorted.map(uni => this._renderUniCard(uni, userUni)).join('')}
            </div>
        `;

        // Filter tabs
        container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._filterUniversities(container, tab.dataset.filter);
            });
        });

        // Search
        const searchInput = container.querySelector('#uni-search');
        searchInput.addEventListener('input', () => {
            this._filterUniversities(
                container,
                container.querySelector('.filter-tab.active').dataset.filter,
                searchInput.value
            );
        });
    },

    _renderUniCard(uni, userUni) {
        const isHighlighted = uni.name === userUni;
        const statusLabels = {
            available: '✅ Açık Menü',
            portal: '🔒 Portal Girişi',
            community: '📑 Yurt / Topluluk',
            pano: '📌 Pano / Ekran',
            limited: '⚠️ Kısıtlı',
            unavailable: '❌ Menü Yok'
        };

        return `
            <div class="uni-card ${isHighlighted ? 'highlighted' : ''}"
                 data-type="${uni.type === 'Devlet' ? 'devlet' : 'vakif'}"
                 data-status="${uni.menuStatus}"
                 data-name="${uni.name.toLowerCase()} ${uni.shortName ? uni.shortName.toLowerCase() : ''} ${uni.accessChannel ? uni.accessChannel.toLowerCase() : ''}"
                 onclick="Screens.openUniMenu('${uni.menuUrl}', '${uni.name}')">
                <span class="uni-card-icon">${uni.icon}</span>
                <div class="uni-card-info">
                    <div class="uni-card-name">${uni.name}</div>
                    <div class="uni-card-meta">
                        <span>${uni.type}</span>
                        <span class="status-badge ${uni.menuStatus}">${statusLabels[uni.menuStatus] || uni.menuStatus}</span>
                    </div>
                    ${uni.note ? `<div class="uni-card-note">${uni.note}</div>` : ''}
                </div>
                <span class="uni-card-arrow">→</span>
            </div>
        `;
    },

    _filterUniversities(container, filter, searchTerm = '') {
        const cards = container.querySelectorAll('.uni-card');
        const term = searchTerm.toLowerCase().trim();

        cards.forEach(card => {
            let show = true;

            // Type/status filter
            if (filter === 'devlet') show = card.dataset.type === 'devlet';
            else if (filter === 'vakif') show = card.dataset.type === 'vakif';
            else if (filter === 'available') show = card.dataset.status === 'available';
            else if (filter === 'portal') show = card.dataset.status === 'portal';
            else if (filter === 'community') show = card.dataset.status === 'community';
            else if (filter === 'pano') show = card.dataset.status === 'pano';

            // Search filter
            if (show && term) {
                show = card.dataset.name.includes(term);
            }

            card.style.display = show ? '' : 'none';
        });
    },

    openUniMenu(url, name) {
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert(`${name} için çevrimiçi menü bulunamadı.`);
        }
    },

    // -------------------------------------------------------
    // KYK Yemekleri Ekranı (Canlı API + Çok Katmanlı Yedekleme)
    // -------------------------------------------------------
    currentKYKDate: null,
    currentKYKMealType: 'all', // 'all', 'breakfast', 'dinner'
    kykMenuMemoryCache: {},

    renderKYKScreen(container, targetDateStr = null, mealType = null) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const defaultDate = `${year}-${month}-${day}`;

        if (targetDateStr) {
            this.currentKYKDate = targetDateStr;
        } else if (!this.currentKYKDate) {
            this.currentKYKDate = defaultDate;
        }

        if (mealType) {
            this.currentKYKMealType = mealType;
        }

        const activeDate = this.currentKYKDate;
        const activeMealType = this.currentKYKMealType;
        const city = localStorage.getItem('oy_city') || 'Ankara';
        const formattedDate = this._formatTurkishDate(activeDate);
        const isToday = activeDate === defaultDate;

        // Yarın hesabı
        const tomorrowObj = new Date(today);
        tomorrowObj.setDate(tomorrowObj.getDate() + 1);
        const tomYear = tomorrowObj.getFullYear();
        const tomMonth = String(tomorrowObj.getMonth() + 1).padStart(2, '0');
        const tomDay = String(tomorrowObj.getDate()).padStart(2, '0');
        const tomorrowStr = `${tomYear}-${tomMonth}-${tomDay}`;
        const isTomorrow = activeDate === tomorrowStr;

        container.innerHTML = `
            <div class="sub-header">
                <button type="button" class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🏠 KYK Yemek Menüsü</h2>
            </div>

            <div class="kyk-top-bar">
                <div class="kyk-city-pill">📍 ${city}</div>
                <div class="kyk-status-pill" id="kyk-status-pill">
                    <span class="status-dot"></span> <span id="kyk-status-text">Menü Yükleniyor...</span>
                </div>
            </div>

            <!-- Tarih Navigasyonu -->
            <div class="kyk-date-nav">
                <div class="kyk-date-controls">
                    <button type="button" class="kyk-date-arrow-btn" onclick="Screens.stepKYKDate(-1)" aria-label="Önceki Gün">‹</button>
                    <div class="kyk-date-display">
                        <span class="kyk-date-text">${formattedDate}</span>
                    </div>
                    <button type="button" class="kyk-date-arrow-btn" onclick="Screens.stepKYKDate(1)" aria-label="Sonraki Gün">›</button>
                </div>
                <div class="kyk-quick-dates">
                    <button type="button" class="kyk-quick-btn ${isToday ? 'active' : ''}" onclick="Screens.setKYKDate('${defaultDate}')">Bugün</button>
                    <button type="button" class="kyk-quick-btn ${isTomorrow ? 'active' : ''}" onclick="Screens.setKYKDate('${tomorrowStr}')">Yarın</button>
                </div>
            </div>

            <!-- Öğün Seçim Sekmeleri -->
            <div class="kyk-meal-tabs">
                <button type="button" class="kyk-meal-tab ${activeMealType === 'all' ? 'active' : ''}" onclick="Screens.setKYKMealType('all')">Tüm Menü</button>
                <button type="button" class="kyk-meal-tab ${activeMealType === 'breakfast' ? 'active' : ''}" onclick="Screens.setKYKMealType('breakfast')">🍳 Kahvaltı</button>
                <button type="button" class="kyk-meal-tab ${activeMealType === 'dinner' ? 'active' : ''}" onclick="Screens.setKYKMealType('dinner')">🍲 Akşam</button>
            </div>

            <!-- Menü İçerik Alanı -->
            <div id="kyk-menu-content" class="kyk-menu-content">
                <div class="kyk-loading-shimmer">
                    <p>Menü hazırlanıyor...</p>
                </div>
            </div>

            <!-- GSB Beslenme Yardımı Bilgilendirme -->
            <div class="kyk-subsidy-card">
                <div class="kyk-subsidy-header">
                    <span class="kyk-subsidy-icon">💳</span>
                    <div>
                        <strong>GSB Günlük Beslenme Yardımı</strong>
                        <p>Kahvaltı: 110 ₺ | Akşam: 190 ₺ (Toplam: 300 ₺)</p>
                    </div>
                </div>
                <div class="kyk-subsidy-footer">
                    <span>* Parmak izi ile yemekhanelerde kullanılır.</span>
                    <button type="button" class="kyk-refresh-btn" onclick="Screens.refreshKYKMenu()" title="Menüyü Yenile">🔄 Yenile</button>
                </div>
            </div>
        `;

        this._loadKYKMenu(container, activeDate, city);
    },

    stepKYKDate(offset) {
        if (!this.currentKYKDate) return;
        const [y, m, d] = this.currentKYKDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        date.setDate(date.getDate() + offset);
        const ny = date.getFullYear();
        const nm = String(date.getMonth() + 1).padStart(2, '0');
        const nd = String(date.getDate()).padStart(2, '0');
        const newDateStr = `${ny}-${nm}-${nd}`;
        this.renderKYKScreen(document.getElementById('sub-screen'), newDateStr);
    },

    setKYKDate(dateStr) {
        this.renderKYKScreen(document.getElementById('sub-screen'), dateStr);
    },

    setKYKMealType(mealType) {
        this.currentKYKMealType = mealType;
        const subScreen = document.getElementById('sub-screen');
        if (subScreen) {
            this.renderKYKScreen(subScreen, this.currentKYKDate, mealType);
        }
    },

    refreshKYKMenu() {
        if (this.currentKYKDate) {
            const city = localStorage.getItem('oy_city') || 'Ankara';
            const citySlug = this._slugifyCity(city);
            delete this.kykMenuMemoryCache[`oy_kyk_live_${citySlug}_${this.currentKYKDate}`];
        }
        this.renderKYKScreen(document.getElementById('sub-screen'), this.currentKYKDate);
    },

    _formatTurkishDate(dateStr) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        return `${d} ${months[m - 1]} ${y}, ${days[date.getDay()]}`;
    },

    _slugifyCity(city) {
        return (city || 'ankara').toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .trim();
    },

    async _loadKYKMenu(container, dateStr, city) {
        const contentEl = container.querySelector('#kyk-menu-content');
        const statusPill = container.querySelector('#kyk-status-pill');
        const statusText = container.querySelector('#kyk-status-text');

        const citySlug = this._slugifyCity(city);
        const setStatus = (cls, text) => {
            if (statusPill && statusText) {
                statusPill.className = `kyk-status-pill ${cls}`;
                statusText.textContent = text;
            }
        };

        // 1) Daha önce bu cihaza kaydedilmiş menü varsa anında göster.
        //    İnternet yoksa kullanıcı en azından son çektiği hali görür.
        const stored = this._readStoredKYKMenu(citySlug, dateStr);
        let shownSomething = false;

        if (stored && contentEl) {
            this._renderKYKMenuContent(contentEl, stored.data, this.currentKYKMealType);
            setStatus('synced', 'Kayıtlı Menü');
            shownSomething = true;
        } else {
            // 2) Kayıt yoksa uygulamayla gelen yedek menüyü göster
            const mmDd = dateStr.slice(5); // e.g. "11-05"
            const backupData = APP_DATA.kykMenuBackup && APP_DATA.kykMenuBackup[mmDd];
            if (backupData && contentEl) {
                this._renderKYKMenuContent(contentEl, JSON.parse(JSON.stringify(backupData)), this.currentKYKMealType);
                setStatus('synced', 'Güncel Menü');
                shownSomething = true;
            }
        }

        // 3) Arka planda canlı veriyi dene; gelirse üzerine yaz ve kaydet
        try {
            const liveData = await this._fetchKYKLive(dateStr, city);
            if (liveData && contentEl) {
                this._renderKYKMenuContent(contentEl, liveData, this.currentKYKMealType);
                setStatus('live', 'Canlı Menü');
                return;
            }
        } catch (e) {
            /* ağ hatası — aşağıdaki çevrimdışı durumuna düş */
        }

        // 4) Canlı veri alınamadı
        if (stored) {
            // Kaydın ne zaman alındığını göster
            const when = new Date(stored.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            setStatus('offline', `Kayıtlı Menü · ${when}`);
        } else if (shownSomething) {
            setStatus('offline', 'Çevrimdışı Menü');
        } else if (contentEl) {
            this._renderKYKMenuContent(contentEl, this._getGenericKYKMeal(dateStr), this.currentKYKMealType);
            setStatus('offline', 'Çevrimdışı Menü');
        }
    },

    // -------------------------------------------------------
    // KYK — cihazda kalıcı menü deposu
    // Bir kez başarıyla çekilen menü localStorage'a yazılır; internet
    // yokken aynı gün/şehir için bu kayıt gösterilir.
    // -------------------------------------------------------
    KYK_STORE_KEY: 'oy_kyk_store',
    KYK_STORE_LIMIT: 30, // en yeni 30 gün/şehir kaydı tutulur

    _readKYKStore() {
        try {
            const raw = localStorage.getItem(this.KYK_STORE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch {
            return {};
        }
    },

    _readStoredKYKMenu(citySlug, dateStr) {
        const store = this._readKYKStore();
        const entry = store[`${citySlug}_${dateStr}`];
        if (!entry || !entry.data) return null;
        return entry;
    },

    _writeStoredKYKMenu(citySlug, dateStr, data) {
        try {
            const store = this._readKYKStore();
            store[`${citySlug}_${dateStr}`] = { savedAt: Date.now(), data };

            // Depo şişmesin: en eski kayıtları at
            const keys = Object.keys(store);
            if (keys.length > this.KYK_STORE_LIMIT) {
                keys.sort((a, b) => (store[a].savedAt || 0) - (store[b].savedAt || 0))
                    .slice(0, keys.length - this.KYK_STORE_LIMIT)
                    .forEach(k => delete store[k]);
            }

            localStorage.setItem(this.KYK_STORE_KEY, JSON.stringify(store));
        } catch {
            /* kota dolu veya özel mod — sessizce geç */
        }
    },

    async _fetchKYKLive(dateStr, city) {
        const citySlug = this._slugifyCity(city);
        const cacheKey = `oy_kyk_live_${citySlug}_${dateStr}`;

        if (this.kykMenuMemoryCache[cacheKey]) {
            return this.kykMenuMemoryCache[cacheKey];
        }

        // Başarılı çekimi hem belleğe hem cihaza yaz
        const remember = (parsed) => {
            this.kykMenuMemoryCache[cacheKey] = parsed;
            this._writeStoredKYKMenu(citySlug, dateStr, parsed);
            return parsed;
        };

        // 1. Primary: Our Dedicated Public GitHub CDN (kyk-yemek-api - today's live menus)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch('https://raw.githubusercontent.com/BeratOrkun/kyk-yemek-api/main/data/kyk_today.json', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const todayJson = await res.json();
                if (todayJson && todayJson.date === dateStr && todayJson.menus && todayJson.menus[citySlug]) {
                    const parsed = this._parseOurApiMenu(todayJson.menus[citySlug]);
                    if (parsed) return remember(parsed);
                }
            }
        } catch (e) {}

        // 2. Secondary: Our Archive GitHub CDN (kyk-yemek-api - historical archive)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch('https://raw.githubusercontent.com/BeratOrkun/kyk-yemek-api/main/data/kyk_menus.json', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const archiveJson = await res.json();
                if (archiveJson && archiveJson.by_date && archiveJson.by_date[dateStr] && archiveJson.by_date[dateStr][citySlug]) {
                    const parsed = this._parseOurApiMenu(archiveJson.by_date[dateStr][citySlug]);
                    if (parsed) return remember(parsed);
                }
            }
        } catch (e) {}

        // 3. Fallback: Syrblo GitHub Raw Fallback (CORS is open: *)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch('https://raw.githubusercontent.com/Syrblo/telegram-kyk-menu-botu/main/kyk_yemek.json', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const rawMap = await res.json();
                const mmDd = dateStr.slice(5);
                if (rawMap && rawMap[mmDd]) {
                    const parsed = this._parseRawKykText(rawMap[mmDd], dateStr);
                    if (parsed) return remember(parsed);
                }
            }
        } catch (e) {}

        return null;
    },

    _parseOurApiMenu(cityData) {
        if (!cityData) return null;
        let breakfast = null;
        let dinner = null;
        let botCommentary = null;

        const processItems = (mealObj) => {
            if (!mealObj || !Array.isArray(mealObj.items) || mealObj.items.length === 0) return [];
            const detailsMap = {};
            if (Array.isArray(mealObj.item_details)) {
                mealObj.item_details.forEach(it => {
                    if (it && it.name) detailsMap[it.name] = it;
                });
            }

            return mealObj.items.map(name => {
                const detail = detailsMap[name] || {};
                const tags = [];
                if (detail.master_data) {
                    if (detail.master_data.is_vegan) tags.push('Vegan');
                    else if (detail.master_data.is_vegetarian) tags.push('Vejetaryen');
                    if (detail.master_data.is_celiac) tags.push('Glütensiz');
                }
                return {
                    name: name,
                    category: detail.category || this._categorizeDishName(name),
                    icon: this._categorizeDishIcon(name),
                    tags: tags,
                    calories: detail.calories ? `${detail.calories} kcal` : null
                };
            });
        };

        if (cityData.breakfast && Array.isArray(cityData.breakfast.items) && cityData.breakfast.items.length > 0) {
            const b = cityData.breakfast;
            breakfast = {
                title: 'Sabah Kahvaltısı',
                hours: '06:30 - 12:00',
                calories: b.calories ? `${b.calories} kcal` : '650 - 850 kcal',
                subsidy: '110 ₺',
                items: processItems(b)
            };
        }

        if (cityData.dinner && Array.isArray(cityData.dinner.items) && cityData.dinner.items.length > 0) {
            const d = cityData.dinner;
            dinner = {
                title: 'Akşam Yemeği',
                hours: '16:00 - 22:30',
                calories: d.calories ? `${d.calories} kcal` : '850 - 1100 kcal',
                subsidy: '190 ₺',
                items: processItems(d)
            };
            if (d.bot_commentary) {
                try {
                    const parsedComment = typeof d.bot_commentary === 'string' ? JSON.parse(d.bot_commentary) : d.bot_commentary;
                    if (parsedComment && parsedComment.yorum) {
                        botCommentary = parsedComment.yorum;
                    }
                } catch(e) {}
            }
        }

        if (!breakfast) {
            breakfast = {
                title: 'Sabah Kahvaltısı',
                hours: '06:30 - 12:00',
                calories: '650 - 850 kcal',
                subsidy: '110 ₺',
                items: [
                    { name: 'Sucuklu Omlet / Haşlanmış Yumurta', category: 'Sıcak', icon: '🍳', tags: [] },
                    { name: 'Patates Kızartması / Karışık Kızartma', category: 'Sıcak', icon: '🍟', tags: [] },
                    { name: 'Taze Simit & Açma', category: 'Unlu Mamul', icon: '🥯', tags: [] },
                    { name: 'Beyaz Peynir / Kaşar Peynir', category: 'Şarküteri', icon: '🧀', tags: [] },
                    { name: 'Siyah ve Yeşil Zeytin', category: 'Kahvaltılık', icon: '🫒', tags: [] },
                    { name: 'Süzme Bal / Çilek Reçeli', category: 'Tatlı', icon: '🍯', tags: [] },
                    { name: 'Sıcak Çay / Süt', category: 'İçecek', icon: '☕', tags: [] },
                    { name: 'Çeyrek Ekmek & 500 ml Su', category: 'Temel', icon: '🍞', tags: [] }
                ]
            };
        }

        if (!dinner) return null;
        return { breakfast, dinner, botCommentary };
    },

    _parseRawKykText(rawText, dateStr) {
        const lines = rawText.split('\n').map(s => s.trim()).filter(Boolean);
        const dayName = lines[0] || '';
        const dishes = lines.slice(1);

        const items = dishes.map(dish => ({
            name: dish,
            category: this._categorizeDishName(dish),
            icon: this._categorizeDishIcon(dish),
            isAlternative: dish.includes('/')
        }));

        return {
            dayName: dayName,
            dinner: {
                title: 'Akşam Yemeği',
                hours: '16:00 - 22:30',
                calories: '780 - 980 kcal',
                subsidy: '190 ₺',
                items: items
            },
            breakfast: {
                title: 'Sabah Kahvaltısı',
                hours: '06:30 - 12:00',
                calories: '650 - 850 kcal',
                subsidy: '110 ₺',
                items: [
                    { name: 'Sucuklu Omlet / Haşlanmış Yumurta', category: 'Sıcak', icon: '🍳' },
                    { name: 'Patates Kızartması / Karışık Kızartma', category: 'Sıcak', icon: '🍟' },
                    { name: 'Taze Simit & Açma', category: 'Unlu Mamul', icon: '🥯' },
                    { name: 'Beyaz Peynir / Kaşar Peynir', category: 'Şarküteri', icon: '🧀' },
                    { name: 'Siyah ve Yeşil Zeytin', category: 'Kahvaltılık', icon: '🫒' },
                    { name: 'Süzme Bal / Çilek Reçeli', category: 'Tatlı', icon: '🍯' },
                    { name: 'Sıcak Çay / Süt', category: 'İçecek', icon: '☕' },
                    { name: 'Çeyrek Ekmek & 500 ml Su', category: 'Temel', icon: '🍞' }
                ]
            }
        };
    },

    _categorizeDishName(dish) {
        const lower = dish.toLowerCase();
        if (lower.includes('çorba')) return 'Çorba';
        if (lower.includes('pilav') || lower.includes('makarna') || lower.includes('spagetti') || lower.includes('bulgur')) return 'Yardımcı Yemek';
        if (lower.includes('tavuk') || lower.includes('köfte') || lower.includes('et') || lower.includes('kavurma') || lower.includes('tantuni') || lower.includes('fajita') || lower.includes('rosto') || lower.includes('kebap') || lower.includes('gulaş') || lower.includes('pane') || lower.includes('şnitzel') || lower.includes('nohut') || lower.includes('fasulye') || lower.includes('balık') || lower.includes('dolma') || lower.includes('sarma') || lower.includes('yahni')) return 'Ana Yemek';
        if (lower.includes('tatlı') || lower.includes('helva') || lower.includes('baklava') || lower.includes('pasta') || lower.includes('sütlaç') || lower.includes('trileçe') || lower.includes('şekerpare') || lower.includes('supangle') || lower.includes('kadayıf') || lower.includes('kalburabastı') || lower.includes('browni')) return 'Tatlı';
        if (lower.includes('salata') || lower.includes('cacık') || lower.includes('ezme') || lower.includes('haydari') || lower.includes('yoğurt') || lower.includes('turşu')) return 'Salata / Meze';
        if (lower.includes('su') || lower.includes('ayran') || lower.includes('meyve suyu')) return 'İçecek';
        if (lower.includes('ekmek')) return 'Ekmek';
        return 'Ana Yemek';
    },

    _categorizeDishIcon(dish) {
        const lower = dish.toLowerCase();
        if (lower.includes('çorba')) return '🥣';
        if (lower.includes('pilav') || lower.includes('makarna') || lower.includes('spagetti')) return '🍚';
        if (lower.includes('tavuk') || lower.includes('külbastı') || lower.includes('şiş') || lower.includes('şnitzel') || lower.includes('kanat')) return '🍗';
        if (lower.includes('köfte') || lower.includes('rosto') || lower.includes('kavurma') || lower.includes('kebap') || lower.includes('fajita') || lower.includes('gulaş') || lower.includes('tantuni') || lower.includes('hamburger')) return '🥩';
        if (lower.includes('balık')) return '🐟';
        if (lower.includes('nohut') || lower.includes('fasulye') || lower.includes('mercimek') || lower.includes('barbunya')) return '🥘';
        if (lower.includes('dolma') || lower.includes('sarma') || lower.includes('mücver') || lower.includes('patlıcan') || lower.includes('karnabahar') || lower.includes('kabak')) return '🍆';
        if (lower.includes('salata') || lower.includes('cacık') || lower.includes('ezme') || lower.includes('haydari') || lower.includes('yoğurt') || lower.includes('turşu')) return '🥗';
        if (lower.includes('tatlı') || lower.includes('helva') || lower.includes('baklava') || lower.includes('pasta') || lower.includes('sütlaç') || lower.includes('trileçe') || lower.includes('şekerpare') || lower.includes('supangle') || lower.includes('kadayıf') || lower.includes('kalburabastı') || lower.includes('browni')) return '🍮';
        if (!lower.includes('suyu')) {
            if (lower.includes('muz')) return '🍌';
            if (lower.includes('elma')) return '🍎';
            if (lower.includes('portakal') || lower.includes('mandalina')) return '🍊';
            if (lower.includes('üzüm')) return '🍇';
            if (lower.includes('karpuz')) return '🍉';
            if (lower.includes('armut') || lower.includes('kayısı') || lower.includes('şeftali') || lower.includes('kavun')) return '🍐';
        }
        if (lower.includes('su') || lower.includes('ayran') || lower.includes('meyve suyu')) return '💧';
        if (lower.includes('ekmek')) return '🍞';
        if (lower.includes('omlet') || lower.includes('yumurta') || lower.includes('menemen')) return '🍳';
        if (lower.includes('peynir')) return '🧀';
        if (lower.includes('zeytin')) return '🫒';
        if (lower.includes('simit') || lower.includes('açma') || lower.includes('poğaça')) return '🥯';
        return '🍽️';
    },

    _getGenericKYKMeal(dateStr) {
        return {
            dinner: {
                title: 'Akşam Yemeği',
                hours: '16:00 - 22:30',
                calories: '750 - 950 kcal',
                subsidy: '190 ₺',
                items: [
                    { name: 'Mercimek Çorbası / Ezogelin Çorba', category: 'Çorba', icon: '🥣' },
                    { name: 'Tavuk Sote / İzmir Köfte', category: 'Ana Yemek', icon: '🍗' },
                    { name: 'Şehriyeli Pirinç Pilavı / Bulgur Pilavı', category: 'Yardımcı Yemek', icon: '🍚' },
                    { name: 'Mevsim Salata / Yoğurt', category: 'Salata / Meze', icon: '🥗' },
                    { name: 'Çeyrek Ekmek & 500 ml Su', category: 'Temel', icon: '🍞' }
                ]
            },
            breakfast: {
                title: 'Sabah Kahvaltısı',
                hours: '06:30 - 12:00',
                calories: '650 - 850 kcal',
                subsidy: '110 ₺',
                items: [
                    { name: 'Sucuklu Omlet / Haşlanmış Yumurta', category: 'Sıcak', icon: '🍳' },
                    { name: 'Karışık Kızartma / Sigara Böreği', category: 'Sıcak', icon: '🍟' },
                    { name: 'Taze Simit / Açma', category: 'Unlu Mamul', icon: '🥯' },
                    { name: 'Beyaz Peynir / Kaşar Peynir', category: 'Şarküteri', icon: '🧀' },
                    { name: 'Siyah ve Yeşil Zeytin', category: 'Kahvaltılık', icon: '🫒' },
                    { name: 'Süzme Bal / Reçel', category: 'Tatlı', icon: '🍯' },
                    { name: 'Sıcak Çay / Süt', category: 'İçecek', icon: '☕' },
                    { name: 'Çeyrek Ekmek & 500 ml Su', category: 'Temel', icon: '🍞' }
                ]
            }
        };
    },

    _renderKYKMenuContent(contentEl, menuData, mealType) {
        let html = '';

        // Kahvaltı Kartı
        if ((mealType === 'all' || mealType === 'breakfast') && menuData.breakfast) {
            const b = menuData.breakfast;
            html += `
                <div class="kyk-meal-section breakfast">
                    <div class="kyk-meal-header">
                        <div class="kyk-meal-title-group">
                            <h3>🍳 ${b.title || 'Sabah Kahvaltısı'}</h3>
                            <span class="kyk-meal-hours">⏰ Servis: ${b.hours || '06:30 - 12:00'}</span>
                        </div>
                        <div class="kyk-calorie-badge">🔥 ${b.calories || '650 - 850 kcal'}</div>
                    </div>
                    <div class="kyk-dish-list">
                        ${(b.items || []).map(dish => this._renderKYKDishRow(dish)).join('')}
                    </div>
                </div>
            `;
        }

        // Akşam Yemeği Kartı
        if ((mealType === 'all' || mealType === 'dinner') && menuData.dinner) {
            const d = menuData.dinner;
            html += `
                <div class="kyk-meal-section dinner">
                    <div class="kyk-meal-header">
                        <div class="kyk-meal-title-group">
                            <h3>🍲 ${d.title || 'Akşam Yemeği'}</h3>
                            <span class="kyk-meal-hours">⏰ Servis: ${d.hours || '16:00 - 22:30'}</span>
                        </div>
                        <div class="kyk-calorie-badge">🔥 ${d.calories || '780 - 980 kcal'}</div>
                    </div>
                    <div class="kyk-dish-list">
                        ${(d.items || []).map(dish => this._renderKYKDishRow(dish)).join('')}
                    </div>
                </div>
            `;
        }

        // Canlı Öğrenci Yorumu (Kepçe verisi varsa)
        if (menuData.botCommentary) {
            html += `
                <div class="kyk-commentary-card">
                    <div class="kyk-commentary-header">
                        <span>🤖</span>
                        <span>Günün Menü Yorumu</span>
                    </div>
                    <div class="kyk-commentary-text">
                        "${menuData.botCommentary}"
                    </div>
                </div>
            `;
        }

        contentEl.innerHTML = html;
    },

    _renderKYKDishRow(dish) {
        const isAlt = dish.isAlternative || (dish.name && dish.name.includes('/'));
        return `
            <div class="kyk-dish-item">
                <div class="kyk-dish-icon">${dish.icon || '🍽️'}</div>
                <div class="kyk-dish-info">
                    <div class="kyk-dish-name">
                        ${dish.name}
                        ${isAlt ? '<span class="kyk-dish-alt-pill">Seçenekli</span>' : ''}
                    </div>
                    <div class="kyk-dish-meta">
                        <span>${dish.category || 'Tabldot'}</span>
                        ${(dish.tags || []).map(t => `<span class="kyk-dish-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // -------------------------------------------------------
    // Gençlik Sofrası Ekranı
    // -------------------------------------------------------
    renderGenclikSofrasiScreen(container) {
        const data = APP_DATA.genclikSofrasi;

        container.innerHTML = `
            <div class="sub-header">
                <button type="button" class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🍲 Gençlik Sofrası</h2>
            </div>

            <div class="info-hero">
                <span class="info-hero-icon">🍲</span>
                <h3 class="info-hero-title">ABB Gençlik Sofrası</h3>
                <p class="info-hero-subtitle">${data.description}</p>
                <div class="time-badge" id="genclik-hours">🕕 ${data.hours}</div>
            </div>

            <div class="section-title">Günün Menüsü</div>
            <div id="genclik-menu-content" class="gs-menu-loading mb-lg">
                <span class="gs-menu-loading-icon">⏳</span>
                <p>Menü yükleniyor...</p>
            </div>

            <a href="${data.pageUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full mb-lg">
                📋 Gençlik Sofraları Sayfasını Aç
            </a>

            <div class="section-title">Hizmet Noktaları</div>
            ${data.locations.map(loc => `
                <div class="location-card">
                    <span class="location-card-icon">${loc.icon}</span>
                    <div>
                        <div class="location-card-name">${loc.name}</div>
                        <div class="location-card-address">${loc.address}</div>
                    </div>
                </div>
            `).join('')}

            <div class="divider"></div>
            <p class="text-muted text-center" style="font-size: 0.8rem;">
                Kayıt için TC kimlik kartı veya öğrenci kimliği ile karekod sistemi üzerinden başvuru yapılması gerekmektedir.
            </p>
        `;

        // Try to fetch menu from the API
        this._fetchGenclikMenu(container);
    },

    _esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    },

    _renderGenclikDishRow(dish) {
        return `
            <div class="gs-dish-item">
                <span class="gs-dish-icon">${this._categorizeDishIcon(dish)}</span>
                <span class="gs-dish-name">${this._esc(dish)}</span>
            </div>
        `;
    },

    _renderGenclikSourceNote(data) {
        if (data.stale) {
            const when = data.cachedAt
                ? new Date(data.cachedAt).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                : null;
            return `
                <div class="gs-source-note warn">
                    <span>📴</span>
                    <span>Siteye ulaşılamadı, kayıtlı menü gösteriliyor${when ? ` (${this._esc(when)})` : ''}.</span>
                </div>
            `;
        }
        return `
            <div class="gs-source-note">
                <span>${data.viaProxy ? '⚠️' : '🟢'}</span>
                <span>Kaynak: ${this._esc(data.source || 'Sosyal Hizmetler sayfası')}</span>
            </div>
        `;
    },

    // Birincil: ABB Sosyal Hizmetler Gençlik Sofraları sayfası
    _renderGenclikPageMenu(menuContainer, data) {
        let html = '';

        if (data.today && data.today.items.length) {
            html += `
                <div class="gs-board">
                    <div class="gs-board-head">
                        <h3 class="gs-board-title">Bugünün Menüsü</h3>
                        ${data.today.dateText ? `<span class="gs-board-date">${this._esc(data.today.dateText)}</span>` : ''}
                    </div>
                    <div class="gs-dish-list">
                        ${data.today.items.map(d => this._renderGenclikDishRow(d)).join('')}
                    </div>
                    <div class="gs-board-foot">Afiyet olsun!</div>
                </div>
            `;
        }

        if (data.week && data.week.days.length) {
            html += `
                <div class="gs-week">
                    <div class="gs-week-head">
                        <h3 class="gs-week-title">Bu Haftanın Menüsü</h3>
                        ${data.week.range ? `<span class="gs-week-range">${this._esc(data.week.range)}</span>` : ''}
                    </div>
                    ${data.week.days.map(day => `
                        <div class="gs-week-row${day.isToday ? ' today' : ''}">
                            <div class="gs-week-day">
                                <span class="gs-week-day-name">${this._esc(day.gun || '-')}</span>
                                ${day.tarih ? `<span class="gs-week-day-date">${this._esc(day.tarih)}</span>` : ''}
                            </div>
                            <div class="gs-week-dishes">
                                ${day.dishes.map(d => `<span class="gs-week-dish">${this._esc(d)}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Metin yoksa görsel yedeği
        if (!html && data.image) {
            html += `
                <div class="gs-board">
                    <div class="gs-board-head">
                        <h3 class="gs-board-title">Menü Görseli</h3>
                    </div>
                    <a href="${this._esc(data.image.src)}" target="_blank" rel="noopener noreferrer" class="gs-menu-image-link">
                        <img src="${this._esc(data.image.src)}" alt="${this._esc(data.image.alt || 'Gençlik Sofraları menüsü')}" class="gs-menu-image" loading="lazy">
                    </a>
                    <div class="gs-board-foot">Büyütmek için görsele dokun</div>
                </div>
            `;
        }

        if (!html) return false;

        html += this._renderGenclikSourceNote(data);
        menuContainer.className = 'gs-menu-wrap mb-lg';
        menuContainer.innerHTML = html;
        return true;
    },

    async _fetchGenclikMenu(container) {
        const menuContainer = container.querySelector('#genclik-menu-content');
        if (!menuContainer) return;

        const applyHours = (hours) => {
            if (!hours) return;
            const hoursEl = container.querySelector('#genclik-hours');
            if (hoursEl) hoursEl.textContent = `🕕 ${hours}`;
        };

        // 1) Cihazda kayıt varsa ANINDA göster — ağ beklenmez.
        //    (Açılışta arka planda önden çekildiği için genelde burası dolu.)
        let shownFromCache = false;
        const cached = GenclikSofralariAPI.readCache();
        if (cached && cached.data) {
            const ok = this._renderGenclikPageMenu(menuContainer, {
                ...cached.data,
                stale: false,
                fromCache: true
            });
            if (ok) {
                applyHours(cached.data.hours);
                shownFromCache = true;
            }
        }

        // 2) Arka planda taze veriyi dene; gelirse sessizce üzerine yaz
        try {
            const pageData = await GenclikSofralariAPI.loadMenu();
            if (pageData && this._renderGenclikPageMenu(menuContainer, pageData)) {
                applyHours(pageData.hours);
                return;
            }
        } catch {
            /* ağ hatası */
        }

        // 3) Taze veri yoksa ve ekranda kayıtlı menü duruyorsa ona dokunma
        if (shownFromCache) {
            this._renderGenclikPageMenu(menuContainer, {
                ...cached.data,
                stale: true,
                cachedAt: cached.savedAt
            });
            return;
        }

        // 4) Hiçbir şey yoksa eski menü formunu dene
        await this._fetchGenclikMenuLegacy(menuContainer);
    },

    async _fetchGenclikMenuLegacy(menuContainer) {
        try {
            const data = await GenclikAPI.loadMenuData();

            if (data && data.rows && data.rows.length > 0) {
                const rowsToShow = data.rows.slice(0, 7);
                let tableHTML = `
                    <div style="overflow-x: auto; border-radius: var(--radius-md);">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <th style="padding: 10px 8px; text-align: left; color: var(--accent-orange); font-weight: 600;">Tarih</th>
                                <th style="padding: 10px 8px; text-align: left; color: var(--text-secondary);">Çorba</th>
                                <th style="padding: 10px 8px; text-align: left; color: var(--text-secondary);">Ana</th>
                                <th style="padding: 10px 8px; text-align: left; color: var(--text-secondary);">Yrd.</th>
                                <th style="padding: 10px 8px; text-align: left; color: var(--text-secondary);">Salata</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                rowsToShow.forEach(row => {
                    const tarih = row.tarih || '-';
                    const yemek1 = row.corba || '-';
                    const yemek2 = row.anaYemek || '-';
                    const yemek3 = row.yrdYemek || '-';
                    const yemek4 = row.salata || '-';

                    tableHTML += `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 10px 8px; font-weight: 600; color: var(--text-primary); white-space: nowrap;">${this._esc(tarih)}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${this._esc(yemek1)}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${this._esc(yemek2)}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${this._esc(yemek3)}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${this._esc(yemek4)}</td>
                        </tr>
                    `;
                });

                tableHTML += '</tbody></table></div>';

                if (data.viaProxy) {
                    tableHTML += `
                        <div class="gs-source-note">
                            <span>⚠️</span>
                            <span>Veriler ${this._esc(data.source)} ile yüklendi.</span>
                        </div>
                    `;
                }

                menuContainer.className = 'gs-menu-wrap mb-lg';
                menuContainer.innerHTML = tableHTML;
            } else {
                throw new Error('No data');
            }
        } catch {
            // Son çare: kullanıcıyı resmi Gençlik Sofraları sayfasına yönlendir
            this._renderGenclikMenuFallback(menuContainer);
        }
    },

    _renderGenclikMenuFallback(menuContainer) {
        const pageUrl = APP_DATA.genclikSofrasi.pageUrl;
        menuContainer.className = 'gs-menu-fallback mb-lg';
        menuContainer.innerHTML = `
            <span class="gs-menu-fallback-icon">📋</span>
            <p class="gs-menu-fallback-title">Menü şu an yüklenemedi</p>
            <p class="gs-menu-fallback-desc">
                Güncel günün ve haftanın menüsünü ABB Sosyal Hizmetler sayfasından görebilirsin.
            </p>
            <a href="${pageUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full">
                🔗 Gençlik Sofraları Sayfasına Git
            </a>
            <button type="button" class="gs-menu-retry" onclick="Screens.retryGenclikMenu(this)">
                🔄 Tekrar Dene
            </button>
        `;
    },

    retryGenclikMenu(btn) {
        const screen = btn.closest('#sub-screen') || document.getElementById('sub-screen');
        const menuContainer = screen?.querySelector('#genclik-menu-content');
        if (!menuContainer) return;
        menuContainer.className = 'gs-menu-loading mb-lg';
        menuContainer.innerHTML = `
            <span class="gs-menu-loading-icon">⏳</span>
            <p>Menü yükleniyor...</p>
        `;
        try {
            localStorage.removeItem(GenclikSofralariAPI.CACHE_KEY);
        } catch {}
        this._fetchGenclikMenu(screen);
    },

    // -------------------------------------------------------
    // Millet Kütüphanesi Ekranı
    // -------------------------------------------------------
    renderMilletKutuphanesiScreen(container) {
        const data = APP_DATA.milletKutuphanesi;

        container.innerHTML = `
            <div class="sub-header">
                <button type="button" class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🏛️ Millet Kütüphanesi</h2>
            </div>

            <div class="info-hero">
                <span class="info-hero-icon">🏛️</span>
                <h3 class="info-hero-title">${data.title}</h3>
                <p class="info-hero-subtitle">${data.subtitle}</p>
            </div>

            <div class="section-title">İkram Hizmetleri</div>

            ${data.services.map(service => `
                <div class="service-card">
                    <span class="service-card-icon">${service.icon}</span>
                    <h4 class="service-card-name">${service.name}</h4>
                    <div class="service-card-hours">🕐 ${service.hours}</div>
                    <div class="service-card-schedule">${service.schedule}</div>
                    <p class="service-card-desc">${service.description}</p>
                </div>
            `).join('')}

            <div class="divider"></div>

            <div class="kyk-menu-placeholder">
                <span class="kyk-menu-placeholder-icon">📍</span>
                <p style="font-weight: 600;">Cumhurbaşkanlığı Millet Kütüphanesi</p>
                <p class="mt-sm text-muted" style="font-size: 0.8rem;">Zemin Kat Restoran — Ücretsiz ikram hizmeti</p>
            </div>
        `;
    }
};

// =====================================================
// Gençlik Sofrası API Helper (DataTables & Proxies)
// =====================================================
const GenclikAPI = {
    MENU_URL: 'https://forms.ankara.bel.tr/genclik-sofrasi-menu',
    COLUMN_COUNT: 7,

    isEmptyDish(value) {
        if (!value) return true;
        const v = value.trim();
        return v === '' || v === '-' || v === '—';
    },

    buildDataTablesBody(columnCount, start = 0, length = 100) {
        const params = new URLSearchParams();
        params.set('draw', '1');
        params.set('start', String(start));
        params.set('length', String(length));
        params.set('search[value]', '');
        params.set('search[regex]', 'false');

        for (let i = 0; i < columnCount; i++) {
            params.set(`columns[${i}][data]`, String(i));
            params.set(`columns[${i}][name]`, '');
            params.set(`columns[${i}][searchable]`, 'true');
            params.set(`columns[${i}][orderable]`, 'true');
            params.set(`columns[${i}][search][value]`, '');
            params.set(`columns[${i}][search][regex]`, 'false');
        }

        params.set('order[0][column]', '1');
        params.set('order[0][dir]', 'desc');

        return params.toString();
    },

    async fetchWithTimeout(url, init = {}, ms = 15000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            return await fetch(url, { ...init, signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }
    },

    async fetchViaProxy(targetUrl, init = {}) {
        const isPost = (init.method || 'GET').toUpperCase() === 'POST';
        const proxies = isPost
            ? [(u) => `https://corsproxy.io/?${encodeURIComponent(u)}`]
            : [
                (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
                (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
            ];

        let lastError = null;

        for (const build of proxies) {
            try {
                const proxyUrl = build(targetUrl);
                const response = await this.fetchWithTimeout(proxyUrl, init);
                if (!response.ok) continue;
                return { response, viaProxy: true, proxy: 'proxy' };
            } catch (err) {
                lastError = err;
            }
        }

        throw lastError || new Error('Tüm proxy denemeleri başarısız oldu.');
    },

    async fetchMenuResource(targetUrl, init = {}) {
        try {
            const direct = await this.fetchWithTimeout(targetUrl, { ...init, mode: 'cors' });
            if (direct.ok) {
                return { response: direct, viaProxy: false, method: 'direct' };
            }
        } catch {
            /* CORS veya ağ hatası — proxy dene */
        }
        return this.fetchViaProxy(targetUrl, init);
    },

    normalizeRow(row) {
        if (Array.isArray(row)) {
            if (row.length < this.COLUMN_COUNT) return null;
            return {
                id: String(row[0] ?? ''),
                tarih: String(row[1] ?? ''),
                corba: String(row[2] ?? ''),
                anaYemek: String(row[3] ?? ''),
                yrdYemek: String(row[4] ?? ''),
                salata: String(row[5] ?? ''),
                besinci: String(row[6] ?? ''),
            };
        }

        if (row && typeof row === 'object') {
            const r = row;
            return {
                id: String(r.id ?? r.ID ?? ''),
                tarih: String(r.tarih ?? r.Tarih ?? r.date ?? ''),
                corba: String(r.corbalar ?? r.Corbalar ?? r.corba ?? ''),
                anaYemek: String(r.anaYemek ?? r.ana_yemek ?? r['Ana Yemek'] ?? ''),
                yrdYemek: String(r.yrdYemek ?? r.yrd_yemek ?? r['Yrd. Yemek'] ?? ''),
                salata: String(r.salata ?? r.Salata ?? ''),
                besinci: String(r.besinci ?? r['5. Yemek'] ?? r.besinciYemek ?? ''),
            };
        }

        return null;
    },

    parseDataTablesJson(json) {
        if (!json || typeof json !== 'object') return null;
        const payload = json;
        const rawRows = payload.data;
        if (!Array.isArray(rawRows)) return null;

        const rows = rawRows.map(r => this.normalizeRow(r)).filter(Boolean);
        if (!rows.length) return null;

        return { rows: rows, source: 'DataTables API (POST)' };
    },

    async tryDataTablesApi() {
        const body = this.buildDataTablesBody(this.COLUMN_COUNT);
        const { response, viaProxy } = await this.fetchMenuResource(this.MENU_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body,
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('json')) {
            const text = await response.text();
            if (!text.trim().startsWith('{')) return null;
            const json = JSON.parse(text);
            const parsed = this.parseDataTablesJson(json);
            if (!parsed) return null;
            return { ...parsed, viaProxy };
        }

        const json = await response.json();
        const parsed = this.parseDataTablesJson(json);
        if (!parsed) return null;
        return { ...parsed, viaProxy };
    },

    parseMenuHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let todayDate = null;
        const bodyText = doc.body?.textContent || '';
        const todayMatch = bodyText.match(/Bugün:\s*(\d{2}\.\d{2}\.\d{4})/i);
        if (todayMatch) todayDate = todayMatch[1];

        const todayItems = [];
        const todayHeading = [...doc.querySelectorAll('h5, h4, h3, strong, p, span')].find((el) =>
            /günün menüsü/i.test(el.textContent || '')
        );

        if (todayHeading) {
            const container = todayHeading.closest('div') || todayHeading.parentElement;
            const list = container?.querySelector('ul, ol');
            if (list) {
                list.querySelectorAll('li').forEach((li) => {
                    todayItems.push((li.textContent || '').trim());
                });
            }
        }

        const tables = [...doc.querySelectorAll('table')];
        const menuTable = tables.find((table) => {
            const header = table.textContent || '';
            return /çorba/i.test(header) && /ana yemek/i.test(header);
        });

        if (!menuTable) {
            if (todayDate || todayItems.length) {
                return { rows: [], todayDate, todayItems };
            }
            return null;
        }

        const rows = [];
        const trs = menuTable.querySelectorAll('tbody tr');

        trs.forEach((tr) => {
            const cells = [...tr.querySelectorAll('td')].map((td) => (td.textContent || '').trim());
            if (cells.length < this.COLUMN_COUNT) return;
            const maybeId = cells[0];
            if (!/^\d+$/.test(maybeId)) return;

            rows.push({
                id: cells[0],
                tarih: cells[1],
                corba: cells[2],
                anaYemek: cells[3],
                yrdYemek: cells[4],
                salata: cells[5],
                besinci: cells[6],
            });
        });

        if (!rows.length && !todayDate && !todayItems.length) return null;
        return { rows, todayDate, todayItems };
    },

    parseJinaMarkdown(markdown) {
        const lines = markdown.split('\n');
        const rows = [];
        let todayDate = null;

        const todayMatch = markdown.match(/Bugün:\s*(\d{2}\.\d{2}\.\d{4})/i);
        if (todayMatch) todayDate = todayMatch[1];

        for (const line of lines) {
            if (!line.trim().startsWith('|')) continue;
            if (line.includes('---')) continue;

            const parts = line
                .split('|')
                .map((p) => p.trim())
                .filter((p, i, arr) => !(i === 0 && p === '') && !(i === arr.length - 1 && p === ''));

            if (parts.length < this.COLUMN_COUNT) continue;
            if (/^id$/i.test(parts[0]) || parts[0].toLowerCase() === 'id') continue;
            if (!/^\d+$/.test(parts[0])) continue;

            rows.push({
                id: parts[0],
                tarih: parts[1],
                corba: parts[2],
                anaYemek: parts[3],
                yrdYemek: parts[4],
                salata: parts[5],
                besinci: parts[6],
            });
        }

        if (!rows.length) return null;
        return { rows, todayDate, todayItems: [], source: 'Jina Reader (markdown)' };
    },

    async loadMenuData() {
        let viaProxy = false;
        let source = 'bilinmiyor';

        try {
            const api = await this.tryDataTablesApi();
            if (api?.rows?.length) {
                return {
                    rows: api.rows,
                    todayDate: null,
                    todayItems: [],
                    source: api.source,
                    viaProxy: api.viaProxy,
                };
            }
        } catch {}

        try {
            const jinaUrl = `https://r.jina.ai/${this.MENU_URL}`;
            let response;
            try {
                response = await this.fetchWithTimeout(jinaUrl, { headers: { Accept: 'text/plain' } });
            } catch {
                const proxied = await this.fetchViaProxy(jinaUrl);
                response = proxied.response;
            }
            if (!response.ok) throw new Error(`Jina Reader HTTP ${response.status}`);
            const markdown = await response.text();
            const parsed = this.parseJinaMarkdown(markdown);
            if (parsed?.rows?.length) {
                return {
                    rows: parsed.rows,
                    todayDate: parsed.todayDate,
                    todayItems: parsed.todayItems || [],
                    source: parsed.source,
                    viaProxy: false,
                };
            }
        } catch {}

        try {
            const { response, viaProxy: proxied } = await this.fetchMenuResource(this.MENU_URL, {
                headers: { Accept: 'text/html' },
            });
            viaProxy = proxied;
            const html = await response.text();
            const parsed = this.parseMenuHtml(html);
            const hasTodayItems = parsed?.todayItems?.some((x) => !this.isEmptyDish(x));
            if (parsed?.rows?.length || (parsed?.todayDate && hasTodayItems)) {
                return {
                    rows: parsed?.rows ?? [],
                    todayDate: parsed?.todayDate ?? null,
                    todayItems: parsed?.todayItems ?? [],
                    source: proxied ? 'HTML (CORS proxy)' : 'HTML (doğrudan)',
                    viaProxy: proxied,
                };
            }
        } catch {}

        throw new Error('Menü verisi alınamadı. Kaynak siteye erişilemiyor veya format değişmiş olabilir.');
    }
};

// =====================================================
// Gençlik Sofraları — ABB Sosyal Hizmetler sayfa kazıyıcı
// Birincil kaynak. Sayfa `access-control-allow-origin: *`
// gönderdiği için doğrudan fetch edilebiliyor; başarısız
// olursa GenclikAPI'nin proxy zinciri devreye giriyor.
// =====================================================
const GenclikSofralariAPI = {
    PAGE_URL: 'https://sosyalhizmetler.ankara.bel.tr/hizmetler/genclik-sofralari',
    ORIGIN: 'https://sosyalhizmetler.ankara.bel.tr',
    CACHE_KEY: 'oy_gs_menu_cache',

    absoluteUrl(src) {
        if (!src) return null;
        if (/^https?:\/\//i.test(src)) return src;
        return this.ORIGIN + (src.startsWith('/') ? src : `/${src}`);
    },

    clean(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    },

    // "EZOGELİN ÇORBA · ETLİ NOHUT" -> ["EZOGELİN ÇORBA", "ETLİ NOHUT"]
    splitDishes(text) {
        return this.clean(text)
            .split(/\s*[·•|]\s*|\s{2,}/)
            .map(s => this.clean(s))
            .filter(s => s && !GenclikAPI.isEmptyDish(s));
    },

    parseToday(doc) {
        let items = [...doc.querySelectorAll('.gs-tahta-liste li')]
            .map(li => this.clean(li.textContent))
            .filter(s => s && !GenclikAPI.isEmptyDish(s));

        const timeEl = doc.querySelector('.gs-tahta-tarih time');
        let dateISO = timeEl?.getAttribute('datetime') || null;
        let dateText = this.clean(timeEl?.textContent) || this.clean(doc.querySelector('.gs-tahta-tarih')?.textContent);

        // Sınıf adları değişirse: "BUGÜNÜN MENÜSÜ" başlığından listeyi bul
        if (!items.length) {
            const heading = [...doc.querySelectorAll('h2, h3, h4, h5, strong')]
                .find(el => /bugün(ün)?\s*men[üu]/i.test(el.textContent || ''));
            const scope = heading?.closest('div, section');
            const list = scope?.querySelector('ul, ol');
            if (list) {
                items = [...list.querySelectorAll('li')]
                    .map(li => this.clean(li.textContent))
                    .filter(s => s && !GenclikAPI.isEmptyDish(s));
            }
            if (!dateText && scope) {
                const t = scope.querySelector('time');
                dateISO = dateISO || t?.getAttribute('datetime') || null;
                dateText = this.clean(t?.textContent);
            }
        }

        if (!items.length) return null;
        return { items, dateISO, dateText: dateText || null };
    },

    parseWeek(doc) {
        const section = doc.querySelector('.hz-gs-hafta');
        if (!section) return null;

        const days = [...section.querySelectorAll('ol > li, ul > li')].map(li => {
            const dayEl = li.querySelector('.hz-gs-gun');
            const smallEl = dayEl?.querySelector('small');
            // Gün adı <small> içindeki tarihten ayrılıyor
            let gun = '';
            if (dayEl) {
                const clone = dayEl.cloneNode(true);
                clone.querySelectorAll('small').forEach(s => s.remove());
                gun = this.clean(clone.textContent);
            }
            const dishText = li.querySelector('.hz-gs-yemekler')?.textContent;
            return {
                gun: gun || null,
                tarih: this.clean(smallEl?.textContent) || null,
                dishes: this.splitDishes(dishText),
                isToday: li.classList.contains('hz-gs-bugun')
            };
        }).filter(d => d.dishes.length);

        if (!days.length) return null;
        return {
            days,
            range: this.clean(section.querySelector('.hz-gs-hafta-not')?.textContent) || null
        };
    },

    // Menü metin olarak okunamazsa, menü bölümündeki görseli yedek olarak kullan
    parseMenuImage(doc) {
        const scope = doc.querySelector('#menu') || doc.body;
        if (!scope) return null;
        const imgs = [...scope.querySelectorAll('img')]
            .map(img => ({
                src: this.absoluteUrl(img.getAttribute('src')),
                alt: this.clean(img.getAttribute('alt'))
            }))
            .filter(i => i.src);
        if (!imgs.length) return null;
        const hinted = imgs.find(i => /men[üu]|tahta|sofra/i.test(`${i.src} ${i.alt}`));
        return hinted || imgs[0];
    },

    parseHours(doc) {
        const candidates = [...doc.querySelectorAll('.hz-galeri-sayi, .time-badge, p, span')]
            .map(el => this.clean(el.textContent))
            .filter(t => t && t.length < 80);
        return candidates.find(t => /\d{1,2}[.:]\d{2}\s*[–\-—]\s*\d{1,2}[.:]\d{2}/.test(t)) || null;
    },

    parsePage(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const today = this.parseToday(doc);
        const week = this.parseWeek(doc);
        const hours = this.parseHours(doc);

        if (!today && !week) {
            const image = this.parseMenuImage(doc);
            if (image) return { today: null, week: null, hours, image };
            return null;
        }

        return { today, week, hours, image: null };
    },

    readCache() {
        try {
            const raw = localStorage.getItem(this.CACHE_KEY);
            if (!raw) return null;
            const cached = JSON.parse(raw);
            if (!cached || !cached.savedAt || !cached.data) return null;
            // Yaş kontrolü YOK: internet yokken eldeki tek veri budur,
            // eskimiş olsa bile boş ekran göstermekten iyidir. Kullanıcı
            // kaydın tarihini arayüzdeki notta görüyor.
            return cached;
        } catch {
            return null;
        }
    },

    writeCache(data) {
        try {
            localStorage.setItem(this.CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
        } catch {
            /* kota dolu veya özel mod — sessizce geç */
        }
    },

    async loadMenu() {
        try {
            const { response, viaProxy } = await GenclikAPI.fetchMenuResource(this.PAGE_URL, {
                headers: { Accept: 'text/html' }
            });
            const html = await response.text();
            const parsed = this.parsePage(html);
            if (parsed) {
                const result = {
                    ...parsed,
                    source: viaProxy ? 'Sosyal Hizmetler sayfası (CORS proxy)' : 'Sosyal Hizmetler sayfası',
                    viaProxy,
                    stale: false
                };
                this.writeCache(result);
                return result;
            }
        } catch {
            /* ağ/parse hatası — önbelleğe düş */
        }

        const cached = this.readCache();
        if (cached) {
            return { ...cached.data, stale: true, cachedAt: cached.savedAt };
        }

        throw new Error('Gençlik Sofraları menüsü okunamadı.');
    }
};
