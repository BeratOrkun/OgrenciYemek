// =====================================================
// ÖğrenciYemek — Hacettepe ve Ankara Üniversitesi menüleri
//
// Veri: github.com/BeratOrkun/uniyemekscrapper (GitHub Actions saatte bir
// üniversite sitelerini çekip GitHub Pages'e JSON yazar; CORS açık).
//   gazi.json (Google Sheet), hacettepe-1.json (Beytepe),
//   hacettepe-2.json (Sıhhiye), anku.json
// Gün işaretleri: holiday:{text} → resmi tatil, invalid:{reason} → doğrulanamadı
// (bu günlerin menüsü asla gösterilmez).
//
// Önlemler:
//  • Her JSON tarayıcıda yeniden doğrulanır: geçersiz tarih, tarihle uyuşmayan
//    gün, yemek adı olmayan kayıt vb. atılır; hiçbir geçerli gün yoksa veri
//    yok sayılır (yanlış menü göstermektense hiç göstermemek).
//  • Ağ yoksa / dosya bozuksa son geçerli veri cihazdan "Kayıtlı" etiketiyle.
//  • O gün için menü yoksa "yayımlanmadı" + resmi sayfa butonu.
// =====================================================

var UniMenus = window.UniMenus = {
    BASE: 'https://beratorkun.github.io/uniyemekscrapper/data/',
    TIMEOUT_MS: 9000,
    CACHE_PREFIX: 'oy_um_',

    UNIS: {
        gazi: {
            key: 'gazi',
            title: 'Gazi Üniversitesi',
            shortTitle: 'Gazi Üniversitesi',
            icon: '🍽️',
            locations: null,
            file: () => 'gazi.json',
            meals: ['ogle'],
            officialUrl: 'https://mediko.gazi.edu.tr/view/page/20412/yemek-listesi',
            sourceNote: 'Kaynak: Gazi Üniversitesi yemek listesi · Menü zorunlu hallerde değişebilir.'
        },
        hacettepe: {
            key: 'hacettepe',
            title: 'Hacettepe Üniversitesi',
            shortTitle: 'Hacettepe',
            icon: '🍽️',
            locations: [{ id: '1', name: 'Beytepe' }, { id: '2', name: 'Sıhhiye' }],
            locationStoreKey: 'oy_hu_loc',
            file: (loc) => `hacettepe-${loc}.json`,
            meals: ['sabah', 'ogle', 'aksam', 'vegan'],
            officialUrl: 'https://beslenme.hacettepe.edu.tr/',
            sourceNote: 'Kaynak: beslenme.hacettepe.edu.tr · Menü zorunlu hallerde değişebilir.'
        },
        anku: {
            key: 'anku',
            title: 'Ankara Üniversitesi',
            shortTitle: 'Ankara Üni.',
            icon: '🍽️',
            locations: null,
            file: () => 'anku.json',
            meals: ['ogle'],
            officialUrl: 'https://sks.ankara.edu.tr/yemek-hizmetleri-2/',
            sourceNote: 'Kaynak: Ankara Üniversitesi SKS aylık menüsü · Kalori değerleri yaklaşıktır.'
        }
    },

    MEAL_LABELS: { sabah: 'Kahvaltı', ogle: 'Öğle', aksam: 'Akşam', vegan: 'Vegan' },
    DAY_LABELS: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    DAY_SHORT: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    MONTH_LABELS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz',
        'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],

    _files: {},    // dosya adı → { days, live, savedAt, updated }
    _loading: {},  // dosya adı → Promise
    _state: {},    // üni → { date, meal, mealChosen }
    _current: null,

    // ---------------------------------------------------
    // Tarih yardımcıları
    // ---------------------------------------------------
    _pad(n) { return String(n).padStart(2, '0'); },
    _isoOf(d) { return `${d.getFullYear()}-${this._pad(d.getMonth() + 1)}-${this._pad(d.getDate())}`; },
    _dateOf(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); },
    _validISO(iso) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
        const d = this._dateOf(iso);
        return this._isoOf(d) === iso;
    },
    _addDays(iso, n) { const d = this._dateOf(iso); d.setDate(d.getDate() + n); return this._isoOf(d); },
    _mondayOf(iso) { const d = this._dateOf(iso); const wd = d.getDay() === 0 ? 7 : d.getDay(); d.setDate(d.getDate() - (wd - 1)); return this._isoOf(d); },
    _label(iso, withDay = true) {
        const d = this._dateOf(iso);
        const base = `${d.getDate()} ${this.MONTH_LABELS[d.getMonth()]}`;
        return withDay ? `${base} ${this.DAY_LABELS[d.getDay()]}` : base;
    },
    _esc(v) { return window.Screens ? Screens._esc(v) : String(v ?? ''); },
    _clean(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); },

    // ---------------------------------------------------
    // Doğrulama: yalnızca güvenilir alanlar, temizlenmiş halde
    // ---------------------------------------------------
    sanitize(json, allowedMeals) {
        if (!json || typeof json !== 'object' || !json.days || typeof json.days !== 'object') return null;
        const days = {};
        for (const [iso, day] of Object.entries(json.days)) {
            if (!this._validISO(iso) || !day || day.date !== iso || !day.meals) continue;
            const meals = {};
            for (const key of allowedMeals) {
                const m = day.meals[key];
                if (!m || !Array.isArray(m.items)) continue;
                const items = m.items
                    .filter(it => it && typeof it.name === 'string' && this._clean(it.name) && it.name.length <= 160)
                    .slice(0, 40)
                    .map(it => ({
                        name: this._clean(it.name),
                        category: typeof it.category === 'string' ? this._clean(it.category) : null,
                        kcal: Number.isFinite(it.kcal) && it.kcal > 0 && it.kcal < 5000 ? Math.round(it.kcal) : null,
                        allergens: Array.isArray(it.allergens)
                            ? it.allergens.filter(a => a && typeof a.code === 'string').slice(0, 14)
                                .map(a => ({ code: this._clean(a.code), description: this._clean(a.description) }))
                            : []
                    }));
                if (!items.length) continue;
                meals[key] = {
                    time: typeof m.time === 'string' && m.time.length < 40 ? this._clean(m.time) : null,
                    totalKcal: Number.isFinite(m.totalKcal) && m.totalKcal > 0 && m.totalKcal < 10000 ? m.totalKcal : null,
                    items
                };
            }
            if (day.invalid && typeof day.invalid.reason === 'string') {
                days[iso] = { date: iso, meals: {}, invalid: { reason: this._clean(day.invalid.reason).slice(0, 120) } };
            } else if (day.holiday && typeof day.holiday.text === 'string') {
                days[iso] = { date: iso, meals: {}, holiday: { text: this._clean(day.holiday.text).slice(0, 120) } };
            } else if (Object.keys(meals).length) {
                days[iso] = { date: iso, meals };
            }
        }
        if (!Object.keys(days).length) return null;
        return { days, updated: typeof json.updated === 'string' ? json.updated : null };
    },

    // ---------------------------------------------------
    // Yükleme (ağ → doğrulama → cihaz önbelleği)
    // ---------------------------------------------------
    _readCache(file) {
        try {
            const raw = Store.get(this.CACHE_PREFIX + file);
            if (!raw) return null;
            const c = JSON.parse(raw);
            return c && c.data && c.savedAt ? c : null;
        } catch {
            return null;
        }
    },

    _writeCache(file, data) {
        try {
            Store.set(this.CACHE_PREFIX + file, JSON.stringify({ savedAt: Date.now(), data }));
        } catch { /* kota / özel mod */ }
    },

    peek(uni, file) {
        if (this._files[file]) return this._files[file];
        const c = this._readCache(file);
        if (c) {
            const clean = this.sanitize(c.data, this.UNIS[uni].meals);
            if (clean) this._files[file] = { ...clean, live: false, savedAt: c.savedAt };
        }
        return this._files[file] || null;
    },

    load(uni, file) {
        if (this._loading[file]) return this._loading[file];
        const cfg = this.UNIS[uni];
        this._loading[file] = (async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
            try {
                const res = await fetch(this.BASE + file, { signal: controller.signal, cache: 'no-cache' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const clean = this.sanitize(json, cfg.meals);
                if (!clean) throw new Error('Geçerli menü yok');
                this._files[file] = { ...clean, live: true, savedAt: Date.now() };
                this._writeCache(file, json);
            } catch {
                const cached = this.peek(uni, file);
                if (cached) cached.live = false;
            } finally {
                clearTimeout(timer);
                delete this._loading[file];
            }
            return this._files[file] || null;
        })();
        return this._loading[file];
    },

    // ---------------------------------------------------
    // Seçimler
    // ---------------------------------------------------
    _location(uni) {
        const cfg = this.UNIS[uni];
        if (!cfg.locations) return null;
        const saved = Store.get(cfg.locationStoreKey);
        return cfg.locations.some(l => l.id === saved) ? saved : cfg.locations[0].id;
    },

    _fileFor(uni) {
        return this.UNIS[uni].file(this._location(uni));
    },

    // Bugün; bugün menü yoksa ve hafta sonuysa gelecek pazartesi
    _targetDate(data) {
        const today = this._isoOf(new Date());
        if (data && data.days[today]) return today;
        const wd = new Date().getDay();
        if (wd === 6) return this._addDays(today, 2);
        if (wd === 0) return this._addDays(today, 1);
        return today;
    },

    // Günün saatine göre varsayılan öğün
    _defaultMeal(uni, day) {
        const cfg = this.UNIS[uni];
        const avail = cfg.meals.filter(m => day && day.meals[m]);
        if (!avail.length) return cfg.meals.includes('ogle') ? 'ogle' : cfg.meals[0];
        const now = new Date();
        const min = now.getHours() * 60 + now.getMinutes();
        const pref = min < 10 * 60 ? 'sabah' : min < 14 * 60 + 30 ? 'ogle' : 'aksam';
        if (avail.includes(pref)) return pref;
        if (avail.includes('ogle')) return 'ogle';
        return avail[0];
    },

    // "Şu an açık" kartı için bugünün öğle yemekleri
    todayDishes(uni) {
        if (!this.UNIS[uni]) return null;
        const data = this.peek(uni, this._fileFor(uni));
        const day = data && data.days[this._isoOf(new Date())];
        const meal = day && day.meals.ogle;
        return meal ? meal.items.map(i => i.name) : null;
    },

    prefetchSelected() {
        // Eski (doğrudan sheet okuyan) Gazi sürümünün önbelleği artık kullanılmıyor
        try { Store.remove('oy_gazi_menu_v1'); } catch { /* yoksay */ }
        const uniName = Store.get('oy_university');
        const uni = uniName && APP_DATA.universities.find(u => u.name === uniName);
        if (!uni || !this.UNIS[uni.inApp]) return Promise.resolve(null);
        return this.load(uni.inApp, this._fileFor(uni.inApp));
    },

    // ---------------------------------------------------
    // Ekran
    // ---------------------------------------------------
    render(container, uni) {
        const cfg = this.UNIS[uni];
        if (!cfg) return;
        this._current = uni;
        this._state[uni] = { date: null, meal: null, mealChosen: false };
        const esc = (v) => this._esc(v);
        const loc = this._location(uni);

        container.innerHTML = `
            <div class="sub-header">
                <button type="button" class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">${cfg.icon} ${esc(cfg.shortTitle)}</h2>
            </div>

            <div class="gz-head">
                <div class="gz-head-text">
                    <h3 class="gz-title">${esc(cfg.title)} Yemek Menüsü</h3>
                    <p class="gz-sub">${cfg.meals.length > 1 ? 'Kahvaltı · Öğle · Akşam · Vegan' : 'Öğle yemeği · Hafta içi'}</p>
                </div>
                <span class="kyk-status-pill" id="um-status">
                    <span class="status-dot"></span> <span id="um-status-text">Yükleniyor…</span>
                </span>
            </div>

            ${cfg.locations ? `
                <div class="um-seg um-loc" role="tablist" aria-label="Yerleşke">
                    ${cfg.locations.map(l => `
                        <button type="button" role="tab" class="um-seg-btn${l.id === loc ? ' active' : ''}"
                                aria-selected="${l.id === loc}" onclick="UniMenus.setLocation('${uni}','${l.id}')">
                            📍 ${esc(l.name)}
                        </button>`).join('')}
                </div>` : ''}

            <div id="um-body"></div>

            <a href="${esc(cfg.officialUrl)}" target="_blank" rel="noopener noreferrer"
               class="btn btn-secondary btn-full mb-md place-menu-btn" id="um-official-btn">
                📋 Menü güncel değilse tıklayınız <span aria-hidden="true">↗</span>
            </a>
            <p class="um-source">${esc(cfg.sourceNote)}</p>
        `;

        const btn = container.querySelector('#um-official-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                try {
                    if (window.OYAnalytics) {
                        const data = this.peek(uni, this._fileFor(uni));
                        const st = this._state[uni];
                        const has = !!(data && st && st.date && data.days[st.date]);
                        window.OYAnalytics.resmiMenuLinkiTiklandi(uni, has);
                    }
                } catch { /* sayaç uygulamayı bozmamalı */ }
            });
        }

        this._refresh(container, uni);
    },

    _refresh(container, uni) {
        const file = this._fileFor(uni);
        if (this.peek(uni, file)) this._renderBody(container, uni);
        else this._renderBody(container, uni, true);
        this._setStatus(container, uni);

        this.load(uni, file).then(() => {
            if (!container.isConnected || App.currentScreen !== uni || this._fileFor(uni) !== file) return;
            this._renderBody(container, uni);
            this._setStatus(container, uni);
        });
    },

    _setStatus(container, uni) {
        const pill = container.querySelector('#um-status');
        const text = container.querySelector('#um-status-text');
        if (!pill || !text) return;
        const file = this._fileFor(uni);
        const data = this._files[file];
        if (this._loading[file] && !data) {
            pill.className = 'kyk-status-pill';
            text.textContent = 'Yükleniyor…';
        } else if (data && data.live) {
            pill.className = 'kyk-status-pill live';
            text.textContent = 'Güncel';
        } else if (data) {
            const when = new Date(data.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            pill.className = 'kyk-status-pill synced';
            text.textContent = `Kayıtlı · ${when}`;
        } else {
            pill.className = 'kyk-status-pill empty';
            text.textContent = navigator.onLine === false ? 'Çevrimdışı' : 'Alınamadı';
        }
    },

    setLocation(uni, id) {
        const cfg = this.UNIS[uni];
        if (!cfg || !cfg.locations || !cfg.locations.some(l => l.id === id)) return;
        Store.set(cfg.locationStoreKey, id);
        const container = document.getElementById('sub-screen');
        if (!container) return;
        container.querySelectorAll('.um-loc .um-seg-btn').forEach((b, i) => {
            const on = cfg.locations[i].id === id;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on);
        });
        this._refresh(container, uni);
    },

    selectDate(uni, iso) {
        const st = this._state[uni];
        if (!st || !this._validISO(iso)) return;
        st.date = iso;
        if (!st.mealChosen) st.meal = null;
        this._renderBody(document.getElementById('sub-screen'), uni);
    },

    selectMeal(uni, meal) {
        const st = this._state[uni];
        if (!st || !this.UNIS[uni].meals.includes(meal)) return;
        st.meal = meal;
        st.mealChosen = true;
        this._renderBody(document.getElementById('sub-screen'), uni);
    },

    stepWeek(uni, dir) {
        const st = this._state[uni];
        const data = this._files[this._fileFor(uni)];
        if (!st || !data) return;
        const monday = this._addDays(this._mondayOf(st.date), dir * 7);
        const week = Array.from({ length: 7 }, (_, i) => this._addDays(monday, i));
        const first = week.find(iso => data.days[iso]);
        if (!first) return;
        this.selectDate(uni, first);
    },

    _kind(category, mealKey) {
        const c = (category || '').toLocaleUpperCase('tr');
        if (mealKey === 'sabah' || c === 'KAHVALTI') return 'diger';
        if (c.includes('ÇORBA')) return 'corba';
        if (c.includes('VEGAN') || c.includes('ETSİZ')) return 'etsiz';
        if (c.includes('ANA')) return 'ana';
        if (/TATLI|MEYVE|İÇECEK|YANINDA|YOĞURT|AYRAN|KOMPOSTO/.test(c)) return 'tatli';
        if (c) return 'yardimci';
        return 'diger';
    },

    _niceCategory(category) {
        const c = this._clean(category);
        if (!c) return '';
        if (c.toLocaleUpperCase('tr') === 'ANAYEMEK') return 'Ana Yemek';
        if (c.toLocaleUpperCase('tr') === 'KAHVALTI') return '';
        return c.toLocaleLowerCase('tr').replace(/(^|[\s/])(\p{L})/gu, (m, p, ch) => p + ch.toLocaleUpperCase('tr'));
    },

    _allergenShort(a) {
        const d = (a.description || '').toLocaleLowerCase('tr');
        const map = [
            ['gluten', 'Gluten'], ['süt', 'Süt'], ['yumurta', 'Yumurta'], ['balık', 'Balık'],
            ['yer fıstığı', 'Yer fıstığı'], ['soya', 'Soya'], ['susam', 'Susam'], ['hardal', 'Hardal'],
            ['kereviz', 'Kereviz'], ['sülfit', 'Sülfit'], ['acı bakla', 'Acı bakla'],
            ['yumuşakça', 'Yumuşakça'], ['kabuklu deniz', 'Kabuklular'], ['kabuklu yemiş', 'Kabuklu yemiş'], ['sert kabuklu', 'Kabuklu yemiş']
        ];
        const hit = map.find(([k]) => d.includes(k));
        return hit ? hit[1] : a.code;
    },

    _renderBody(container, uni, loading = false) {
        if (!container) return;
        const body = container.querySelector('#um-body');
        if (!body) return;
        const cfg = this.UNIS[uni];
        const esc = (v) => this._esc(v);
        const file = this._fileFor(uni);
        const data = this._files[file] || this.peek(uni, file);

        if (!data) {
            body.innerHTML = (loading || this._loading[file])
                ? '<div class="kyk-loading-shimmer"><p>Menü yükleniyor...</p></div>'
                : `<div class="kyk-empty-state">
                       <span class="kyk-empty-icon" aria-hidden="true">📡</span>
                       <h3 class="kyk-empty-title">Menüye ulaşılamadı</h3>
                       <p class="kyk-empty-text">İnternet bağlantını kontrol et ya da aşağıdaki butondan resmi menüye bak.</p>
                   </div>`;
            return;
        }

        const st = this._state[uni];
        if (!st.date) st.date = this._targetDate(data);
        const sel = st.date;
        const todayIso = this._isoOf(new Date());
        const day = data.days[sel];
        if (!st.meal || !(day && day.meals[st.meal])) {
            if (!st.mealChosen || !(day && day.meals[st.meal])) st.meal = this._defaultMeal(uni, day);
        }

        // Hafta şeridi: Pzt–Cum her zaman; Cmt/Paz yalnızca menü varsa
        const monday = this._mondayOf(sel);
        const week = Array.from({ length: 7 }, (_, i) => this._addDays(monday, i))
            .filter((iso, i) => i < 5 || data.days[iso] || iso === sel);
        const hasWeek = (m) => Array.from({ length: 7 }, (_, i) => this._addDays(m, i)).some(iso => data.days[iso]);
        const hasPrev = hasWeek(this._addDays(monday, -7));
        const hasNext = hasWeek(this._addDays(monday, 7));

        const chips = week.map(iso => {
            const d = this._dateOf(iso);
            const dd = data.days[iso];
            const cls = ['gz-chip'];
            if (iso === sel) cls.push('active');
            if (iso === todayIso) cls.push('today');
            let mark = '<span class="gz-chip-mark gz-chip-dot" aria-hidden="true"></span>';
            if (!dd) { cls.push('missing'); mark = '<span class="gz-chip-mark">—</span>'; }
            else if (dd.holiday) { cls.push('holiday'); mark = '<span class="gz-chip-mark">Tatil</span>'; }
            else if (dd.invalid) { cls.push('invalid'); mark = '<span class="gz-chip-mark">!</span>'; }
            return `
                <button type="button" class="${cls.join(' ')}" onclick="UniMenus.selectDate('${uni}','${iso}')"
                        aria-pressed="${iso === sel}" aria-label="${esc(this._label(iso))}">
                    <span class="gz-chip-day">${this.DAY_SHORT[d.getDay()]}</span>
                    <span class="gz-chip-date">${d.getDate()}</span>
                    ${mark}
                </button>`;
        }).join('');

        // Öğün sekmeleri (birden fazla öğün olan üniversitede)
        const mealTabs = cfg.meals.length > 1 ? `
            <div class="um-seg um-meals" role="tablist" aria-label="Öğün">
                ${cfg.meals.map(m => {
                    const avail = !!(day && day.meals[m]);
                    return `<button type="button" role="tab" class="um-seg-btn${m === st.meal ? ' active' : ''}${avail ? '' : ' off'}"
                                aria-selected="${m === st.meal}" ${avail ? '' : 'disabled'}
                                onclick="UniMenus.selectMeal('${uni}','${m}')">${this.MEAL_LABELS[m]}</button>`;
                }).join('')}
            </div>` : '';

        // Başlık
        let heading;
        let dateText;
        const target = this._targetDate(data);
        const wd = new Date().getDay();
        if (sel === todayIso) { heading = 'Bugün'; dateText = this._label(sel); }
        else if ((wd === 0 || wd === 6) && sel === target) { heading = 'Pazartesi menüsü'; dateText = this._label(sel, false); }
        else { heading = this.DAY_LABELS[this._dateOf(sel).getDay()]; dateText = this._label(sel, false); }

        const note = ((wd === 0 || wd === 6) && sel === target && sel !== todayIso)
            ? '<p class="gz-note">Hafta sonu menü yayımlanmamış — pazartesi günün menüsü gösteriliyor.</p>' : '';

        let card;
        const meal = day && day.meals[st.meal];
        if (day && day.holiday) {
            const generic = /^\s*resmi\s+tatil\s*$/i.test(day.holiday.text);
            card = `
                <div class="gz-card gz-card-holiday">
                    <span class="gz-empty-icon" aria-hidden="true">🎉</span>
                    <p class="gz-empty-title">Resmi tatil</p>
                    <p class="gz-empty-text">${esc(generic ? 'Bu gün yemekhane hizmet vermiyor.' : day.holiday.text)}</p>
                </div>`;
        } else if (day && day.invalid) {
            card = `
                <div class="gz-card gz-card-empty">
                    <span class="gz-empty-icon" aria-hidden="true">⚠️</span>
                    <p class="gz-empty-title">Bu günün menüsü doğrulanamadı</p>
                    <p class="gz-empty-text">${esc(day.invalid.reason)}. Lütfen aşağıdan resmi menüye bak.</p>
                </div>`;
        } else if (!day) {
            card = `
                <div class="gz-card gz-card-empty">
                    <span class="gz-empty-icon" aria-hidden="true">🗒️</span>
                    <p class="gz-empty-title">Bu gün için menü yayımlanmadı</p>
                    <p class="gz-empty-text">Yayımlandığında burada otomatik görünecek. Resmi menüye aşağıdan bakabilirsin.</p>
                </div>`;
        } else if (!meal) {
            card = `
                <div class="gz-card gz-card-empty">
                    <span class="gz-empty-icon" aria-hidden="true">🗒️</span>
                    <p class="gz-empty-title">${esc(this.MEAL_LABELS[st.meal])} menüsü yayımlanmadı</p>
                </div>`;
        } else {
            const meta = [meal.time ? `⏰ ${esc(meal.time)}` : '', cfg.meals.length > 1 ? esc(this.MEAL_LABELS[st.meal]) : '']
                .filter(Boolean).join(' · ');
            card = `
                <div class="gz-card">
                    <div class="gz-card-head">
                        <div>
                            <span class="gz-card-kicker">${esc(heading)}</span>
                            <h4 class="gz-card-date">${esc(dateText)}</h4>
                            ${meta ? `<span class="um-meta">${meta}</span>` : ''}
                        </div>
                        ${meal.totalKcal ? `<span class="kyk-calorie-badge">🔥 ${meal.totalKcal} kcal</span>` : ''}
                    </div>
                    <div class="gz-dishes">
                        ${meal.items.map(it => {
                            const kind = this._kind(it.category, st.meal);
                            const label = this._niceCategory(it.category);
                            const allergens = [...new Set(it.allergens.map(a => this._allergenShort(a)))];
                            return `
                            <div class="gz-dish" data-kind="${kind}">
                                <span class="gz-dish-icon" aria-hidden="true">${window.Screens ? Screens._categorizeDishIcon(it.name) : '🍽️'}</span>
                                <span class="gz-dish-text">
                                    <span class="gz-dish-name">${esc(it.name)}</span>
                                    ${label ? `<span class="gz-dish-label">${esc(label)}</span>` : ''}
                                    ${allergens.length ? `<span class="um-allergens">Alerjen: ${esc(allergens.join(', '))}</span>` : ''}
                                </span>
                                ${it.kcal ? `<span class="um-kcal">${it.kcal} kcal</span>` : ''}
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
        }

        body.innerHTML = `
            ${mealTabs}
            <div class="gz-week">
                <button type="button" class="gz-week-arrow" onclick="UniMenus.stepWeek('${uni}',-1)"
                        ${hasPrev ? '' : 'disabled'} aria-label="Önceki hafta">‹</button>
                <div class="gz-week-chips" style="grid-template-columns: repeat(${week.length}, minmax(0, 1fr));">${chips}</div>
                <button type="button" class="gz-week-arrow" onclick="UniMenus.stepWeek('${uni}',1)"
                        ${hasNext ? '' : 'disabled'} aria-label="Sonraki hafta">›</button>
            </div>
            <p class="gz-week-range">${esc(this._label(week[0], false))} – ${esc(this._label(week[week.length - 1], false))}</p>
            ${note}
            ${card}
        `;
    }
};

window.UniMenus = UniMenus;
