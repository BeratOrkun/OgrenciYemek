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
                <button class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🎓 Üniversite Yemekleri</h2>
            </div>

            <div class="uni-filter-tabs" id="uni-filter-tabs">
                <button class="filter-tab active" data-filter="all">Tümü (${universities.length})</button>
                <button class="filter-tab" data-filter="devlet">Devlet (${devletCount})</button>
                <button class="filter-tab" data-filter="vakif">Vakıf (${vakifCount})</button>
            </div>

            <div class="search-input-wrapper mb-md">
                <span class="search-icon">🔍</span>
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
                <button class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
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
                    <button class="kyk-date-arrow-btn" onclick="Screens.stepKYKDate(-1)" aria-label="Önceki Gün">‹</button>
                    <div class="kyk-date-display">
                        <span class="kyk-date-text">${formattedDate}</span>
                    </div>
                    <button class="kyk-date-arrow-btn" onclick="Screens.stepKYKDate(1)" aria-label="Sonraki Gün">›</button>
                </div>
                <div class="kyk-quick-dates">
                    <button class="kyk-quick-btn ${isToday ? 'active' : ''}" onclick="Screens.setKYKDate('${defaultDate}')">Bugün</button>
                    <button class="kyk-quick-btn ${isTomorrow ? 'active' : ''}" onclick="Screens.setKYKDate('${tomorrowStr}')">Yarın</button>
                </div>
            </div>

            <!-- Öğün Seçim Sekmeleri -->
            <div class="kyk-meal-tabs">
                <button class="kyk-meal-tab ${activeMealType === 'all' ? 'active' : ''}" onclick="Screens.setKYKMealType('all')">Tüm Menü</button>
                <button class="kyk-meal-tab ${activeMealType === 'breakfast' ? 'active' : ''}" onclick="Screens.setKYKMealType('breakfast')">🍳 Kahvaltı</button>
                <button class="kyk-meal-tab ${activeMealType === 'dinner' ? 'active' : ''}" onclick="Screens.setKYKMealType('dinner')">🍲 Akşam Yemeği</button>
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
                    <button class="kyk-refresh-btn" onclick="Screens.refreshKYKMenu()" title="Menüyü Yenile">🔄 Yenile</button>
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

        // Check offline backup first to display immediately if available
        const mmDd = dateStr.slice(5); // e.g. "11-05"
        const backupData = APP_DATA.kykMenuBackup && APP_DATA.kykMenuBackup[mmDd];
        let menuToShow = backupData ? JSON.parse(JSON.stringify(backupData)) : null;

        if (menuToShow && contentEl) {
            this._renderKYKMenuContent(contentEl, menuToShow, this.currentKYKMealType);
            if (statusPill && statusText) {
                statusPill.className = 'kyk-status-pill synced';
                statusText.textContent = 'Güncel Menü';
            }
        }

        // Try live fetch in background
        try {
            const liveData = await this._fetchKYKLive(dateStr, city);
            if (liveData && contentEl) {
                this._renderKYKMenuContent(contentEl, liveData, this.currentKYKMealType);
                if (statusPill && statusText) {
                    statusPill.className = 'kyk-status-pill live';
                    statusText.textContent = '🟢 Canlı Menü';
                }
            }
        } catch (e) {
            // Live fetch failed, ensure fallback is shown
            if (!menuToShow && contentEl) {
                const fallback = this._getGenericKYKMeal(dateStr);
                this._renderKYKMenuContent(contentEl, fallback, this.currentKYKMealType);
                if (statusPill && statusText) {
                    statusPill.className = 'kyk-status-pill offline';
                    statusText.textContent = 'Çevrimdışı Menü';
                }
            }
        }
    },

    async _fetchKYKLive(dateStr, city) {
        const citySlug = this._slugifyCity(city);
        const cacheKey = `oy_kyk_live_${citySlug}_${dateStr}`;

        if (this.kykMenuMemoryCache[cacheKey]) {
            return this.kykMenuMemoryCache[cacheKey];
        }

        // Try Kepçe API directly (timeout 2.5s)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch(`https://kepce.org/api/v1/menus?city=${citySlug}&date=${dateStr}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) {
                    const parsed = this._parseKepceResponse(json, dateStr);
                    if (parsed) {
                        this.kykMenuMemoryCache[cacheKey] = parsed;
                        return parsed;
                    }
                }
            }
        } catch (e) {}

        // Try GitHub Raw (CORS is open: *)
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
                    if (parsed) {
                        this.kykMenuMemoryCache[cacheKey] = parsed;
                        return parsed;
                    }
                }
            }
        } catch (e) {}

        return null;
    },

    _parseKepceResponse(jsonList, dateStr) {
        let breakfast = null;
        let dinner = null;
        let botCommentary = null;

        for (const entry of jsonList) {
            if (entry.bot_commentary) {
                try {
                    const parsedComment = typeof entry.bot_commentary === 'string' ? JSON.parse(entry.bot_commentary) : entry.bot_commentary;
                    if (parsedComment && parsedComment.yorum) {
                        botCommentary = parsedComment.yorum;
                    }
                } catch(e) {}
            }

            const items = (entry.items || []).map(it => {
                let cat = it.category || 'Diğer';
                let icon = this._categorizeDishIcon(it.name || it.raw_name || '');
                const tags = [];
                if (it.master_data) {
                    if (it.master_data.is_vegan) tags.push('Vegan');
                    else if (it.master_data.is_vegetarian) tags.push('Vejetaryen');
                    if (it.master_data.is_celiac) tags.push('Glütensiz');
                }
                return {
                    name: it.name || it.raw_name,
                    category: cat,
                    icon: icon,
                    isAlternative: it.is_alternative || false,
                    tags: tags
                };
            });

            const calorieStr = (entry.calorie_range_min && entry.calorie_range_max)
                ? `${entry.calorie_range_min} - ${entry.calorie_range_max} kcal`
                : (entry.total_calories ? `${entry.total_calories} kcal` : '750 - 950 kcal');

            if (entry.meal_type === 'breakfast') {
                breakfast = {
                    title: 'Sabah Kahvaltısı',
                    hours: '06:30 - 12:00',
                    calories: calorieStr,
                    subsidy: '110 ₺',
                    items: items
                };
            } else if (entry.meal_type === 'dinner') {
                dinner = {
                    title: 'Akşam Yemeği',
                    hours: '16:00 - 22:30',
                    calories: calorieStr,
                    subsidy: '190 ₺',
                    items: items
                };
            }
        }

        if (!breakfast) {
            breakfast = {
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
            };
        }

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
                <button class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🍲 Gençlik Sofrası</h2>
            </div>

            <div class="info-hero">
                <span class="info-hero-icon">🍲</span>
                <h3 class="info-hero-title">ABB Gençlik Sofrası</h3>
                <p class="info-hero-subtitle">${data.description}</p>
                <div class="time-badge">🕕 ${data.hours}</div>
            </div>

            <div class="section-title">Günün Menüsü</div>
            <div id="genclik-menu-content" class="kyk-menu-placeholder mb-lg">
                <span class="kyk-menu-placeholder-icon">⏳</span>
                <p>Menü yükleniyor...</p>
            </div>

            <a href="${data.menuUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full mb-lg">
                📋 Tüm Menüyü Görüntüle
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

    async _fetchGenclikMenu(container) {
        const menuContainer = container.querySelector('#genclik-menu-content');
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
                            <td style="padding: 10px 8px; font-weight: 600; color: var(--text-primary); white-space: nowrap;">${tarih}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${yemek1}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${yemek2}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${yemek3}</td>
                            <td style="padding: 10px 8px; color: var(--text-secondary);">${yemek4}</td>
                        </tr>
                    `;
                });

                tableHTML += '</tbody></table></div>';
                
                if (data.viaProxy) {
                    tableHTML += `
                        <div class="mt-sm text-muted" style="font-size: 0.75rem; display: flex; align-items: center; gap: 4px; padding: 0 10px 10px 10px;">
                            <span style="color: var(--accent-yellow);">⚠️</span> Veriler ${data.source} ile yüklendi.
                        </div>
                    `;
                }

                menuContainer.innerHTML = tableHTML;
                menuContainer.style.padding = '0';
                menuContainer.style.overflow = 'hidden';
            } else {
                throw new Error('No data');
            }
        } catch (err) {
            // Fallback: show a message with link
            menuContainer.innerHTML = `
                <span class="kyk-menu-placeholder-icon">📋</span>
                <p>Menü verisine şu an ulaşılamıyor.</p>
                <p class="mt-sm" style="font-size: 0.8rem; color: var(--text-muted);">
                    Güncel menü için aşağıdaki butonu kullanın.
                </p>
                <p class="mt-sm" style="font-size: 0.7rem; color: var(--accent-red);">${err.message}</p>
            `;
        }
    },

    // -------------------------------------------------------
    // Millet Kütüphanesi Ekranı
    // -------------------------------------------------------
    renderMilletKutuphanesiScreen(container) {
        const data = APP_DATA.milletKutuphanesi;

        container.innerHTML = `
            <div class="sub-header">
                <button class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
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
    },

    // -------------------------------------------------------
    // Çankaya Belediyesi Ekranı
    // -------------------------------------------------------
    renderCankayaScreen(container) {
        const data = APP_DATA.cankayaBelediyesi;
        // Open in new tab directly
        window.open(data.menuUrl, '_blank', 'noopener,noreferrer');
        // Stay on home but show a brief confirmation
        App.showScreen('home');
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
