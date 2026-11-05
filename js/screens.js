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
    // KYK Yemekleri Ekranı
    // -------------------------------------------------------
    renderKYKScreen(container) {
        const savedDorm = localStorage.getItem('oy_kyk_dorm');

        if (savedDorm) {
            this._renderKYKSelected(container, savedDorm);
        } else {
            this._renderKYKSelection(container);
        }
    },

    _renderKYKSelected(container, dormName) {
        container.innerHTML = `
            <div class="sub-header">
                <button class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🏠 KYK Yemekleri</h2>
            </div>

            <div class="kyk-selected">
                <span class="kyk-selected-icon">🏠</span>
                <h3 class="kyk-selected-name">${dormName}</h3>
                <p class="kyk-menu-label">Yemek Menüsü</p>

                <div class="kyk-menu-placeholder">
                    <span class="kyk-menu-placeholder-icon">📋</span>
                    <p>KYK yemek menüsü yakında burada gösterilecek.</p>
                    <p class="mt-sm text-muted" style="font-size: 0.8rem;">Menü bilgileri KYK resmi kanallarından takip edilmektedir.</p>
                </div>

                <button class="btn btn-secondary btn-full mt-lg" onclick="Screens.changeKYKDorm()">
                    🔄 Yurdu Değiştir
                </button>
            </div>
        `;
    },

    _renderKYKSelection(container) {
        const dorms = APP_DATA.kykDorms;

        container.innerHTML = `
            <div class="sub-header">
                <button class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🏠 KYK Yemekleri</h2>
            </div>

            <div class="info-hero" style="margin-bottom: var(--space-lg);">
                <span class="info-hero-icon">🏠</span>
                <h3 class="info-hero-title">Ankara KYK Yurt Seçimi</h3>
                <p class="info-hero-subtitle">Kaldığınız yurdu seçin, menü bilgilerini takip edin.</p>
            </div>

            <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" id="kyk-search" placeholder="Yurt ara..." autocomplete="off">
            </div>

            <div class="select-list" id="kyk-dorm-list">
                ${dorms.map(dorm => `
                    <div class="select-list-item" data-dorm="${dorm.toLowerCase()}" onclick="Screens.selectKYKDorm('${dorm.replace(/'/g, "\\'")}')">
                        🏠 ${dorm}
                    </div>
                `).join('')}
            </div>
        `;

        // Search
        const searchInput = container.querySelector('#kyk-search');
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase().trim();
            container.querySelectorAll('.select-list-item').forEach(item => {
                const match = item.dataset.dorm.includes(term);
                item.classList.toggle('hidden', !match);
            });
        });
    },

    selectKYKDorm(dormName) {
        localStorage.setItem('oy_kyk_dorm', dormName);
        App.showScreen('kyk');
    },

    changeKYKDorm() {
        localStorage.removeItem('oy_kyk_dorm');
        App.showScreen('kyk');
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
