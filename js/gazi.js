// =====================================================
// ÖğrenciYemek — Gazi Üniversitesi yemek menüsü (Google Sheets)
//
// Kaynak: herkese açık Google Sheet (tek sayfa). Her hafta bir blok:
//   1. satır : tarih satırı  → "16 Kasım 2026 Pazartesi" ... "20 Kasım 2026 Cuma"
//   sonraki  : yemek satırları (çorba, ana yemek, *etsiz alternatif,
//              yardımcı yemek, tatlı/yanında) ve "Kalori:1200" satırı
// Sütunlar günlerdir (Pzt–Cum). Bir hücrede "tatil" geçiyorsa o gün
// resmi tatil sayılır.
//
// Veri tarayıcıdan doğrudan çekilir (gviz CSV uç noktası CORS'a açık);
// sheet'e yeni hafta eklendiğinde uygulama kendiliğinden günceller.
// İnternet yoksa son başarılı çekim cihazdan gösterilir.
//
// Doğrulama: tarih okunamayan, gün adı tarihle uyuşmayan veya aynı tarihe
// FARKLI iki menü yazılmış günler "doğrulanamadı" olarak işaretlenir ve
// asla menü gibi gösterilmez.
// =====================================================

var GaziMenu = window.GaziMenu = {
    SHEET_ID: '1koCBOca2hgdGno3NJ0vR_VJ0wqLxXpXR5fpJQDAjTGM',
    SHEET_NAME: 'Sayfa1',
    OFFICIAL_URL: 'https://mediko.gazi.edu.tr/view/page/20412/yemek-listesi',
    CACHE_KEY: 'oy_gazi_menu_v1',
    TIMEOUT_MS: 8000,

    _data: null,        // ayrıştırılmış veri (bellek)
    _loading: null,     // devam eden istek (tekrar istek atılmasın)
    selectedDate: null, // ekranda seçili gün (ISO)

    MONTHS: ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
        'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'],
    DAYS: ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'],
    DAY_LABELS: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    DAY_SHORT: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    MONTH_LABELS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz',
        'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],

    get csvUrl() {
        return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(this.SHEET_NAME)}`;
    },

    // ---------------------------------------------------
    // Yardımcılar
    // ---------------------------------------------------
    _fold(s) {
        return String(s || '').toLocaleLowerCase('tr')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
            .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
            .replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u');
    },

    _clean(s) {
        return String(s ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    },

    _iso(y, m, d) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    },

    _isoOf(date) {
        return this._iso(date.getFullYear(), date.getMonth() + 1, date.getDate());
    },

    _dateOf(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    },

    // "16 Kasım 2026 Pazartesi" | "16.11.2026" → { iso, weekdayText, weekdayOk } | null
    _parseDateCell(cell) {
        const raw = this._clean(cell);
        if (!raw) return null;
        const f = this._fold(raw);

        let y, m, d;
        let match = f.match(/(\d{1,2})\s*[ .]?\s*(ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)\s*[ .]?\s*(\d{4})/);
        if (match) {
            d = Number(match[1]);
            m = this.MONTHS.indexOf(match[2]) + 1;
            y = Number(match[3]);
        } else {
            match = f.match(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/);
            if (!match) return null;
            d = Number(match[1]);
            m = Number(match[2]);
            y = Number(match[3]);
        }

        // Geçersiz tarihleri ele (ör. 31 Kasım)
        const dt = new Date(y, m - 1, d);
        if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
            return { iso: null, invalid: true, raw };
        }

        // Hücrede gün adı yazıyorsa tarihle uyuşuyor mu?
        // (kelime sınırı sayesinde "pazar", "pazartesi" ile karışmaz)
        let namedIdx = -1;
        this.DAYS.forEach((day, i) => {
            if (new RegExp(`(^|[^a-z])${day}([^a-z]|$)`).test(f)) {
                if (namedIdx === -1 || day.length > this.DAYS[namedIdx].length) namedIdx = i;
            }
        });
        const weekdayOk = namedIdx === -1 || namedIdx === dt.getDay();

        return { iso: this._iso(y, m, d), weekdayOk, raw };
    },

    _isHolidayText(s) {
        return /tatil|bayram/.test(this._fold(s));
    },

    _calorie(s) {
        const m = this._fold(s).match(/^kalori\s*[:=]?\s*(\d{2,5})/);
        return m ? Number(m[1]) : null;
    },

    _niceName(s) {
        const t = this._clean(s).replace(/^\*+\s*/, '');
        if (!t) return '';
        return t.charAt(0).toLocaleUpperCase('tr') + t.slice(1);
    },

    // ---------------------------------------------------
    // CSV → satırlar (tırnaklı alanları ve satır içi virgülleri doğru okur)
    // ---------------------------------------------------
    parseCSV(text) {
        const rows = [];
        let row = [];
        let field = '';
        let inQuotes = false;
        const src = String(text || '').replace(/^﻿/, '');

        for (let i = 0; i < src.length; i++) {
            const c = src[i];
            if (inQuotes) {
                if (c === '"') {
                    if (src[i + 1] === '"') { field += '"'; i++; }
                    else inQuotes = false;
                } else {
                    field += c;
                }
            } else if (c === '"') {
                inQuotes = true;
            } else if (c === ',') {
                row.push(field); field = '';
            } else if (c === '\n' || c === '\r') {
                if (c === '\r' && src[i + 1] === '\n') i++;
                row.push(field); rows.push(row);
                row = []; field = '';
            } else {
                field += c;
            }
        }
        if (field !== '' || row.length) { row.push(field); rows.push(row); }
        return rows;
    },

    // ---------------------------------------------------
    // Satırlar → { days: { ISO: Day }, issues: [] }
    // Day = { iso, holiday, holidayText, items:[{name,label,veg}], calories, status }
    // status: 'ok' | 'holiday' | 'invalid'
    // ---------------------------------------------------
    parseRows(rows) {
        const days = {};
        const issues = [];
        let block = null; // { cols: [dateInfo|null], rows: [[...]] }

        const isDateRow = (r) => r.some(c => {
            const p = this._parseDateCell(c);
            return p && (p.iso || p.invalid);
        });

        const flush = () => {
            if (!block) return;
            const menuRows = block.rows.filter(r => r.some(c => this._clean(c)));
            // Kalori satırı hariç yemek satırı sayısı beklenen düzende mi (5)?
            const foodRows = menuRows.filter(r => !r.some(c => this._calorie(c) !== null));
            const standard = foodRows.length === 5;
            const LABELS = ['Çorba', 'Ana Yemek', 'Etsiz Alternatif', 'Yardımcı Yemek', 'Tatlı / Yanında'];

            block.cols.forEach((info, col) => {
                if (!info) return;
                if (info.invalid || !info.iso) {
                    issues.push(`Geçersiz tarih: "${info.raw}"`);
                    return;
                }

                const items = [];
                let calories = null;
                let holidayText = this._isHolidayText(info.raw) ? info.raw : null;

                let foodIdx = -1;
                menuRows.forEach(r => {
                    const cell = this._clean(r[col]);
                    const cal = this._calorie(cell);
                    const isFoodRow = !r.some(c => this._calorie(c) !== null);
                    if (isFoodRow) foodIdx += 1;
                    if (!cell) return;
                    if (cal !== null) { calories = cal; return; }
                    if (this._isHolidayText(cell)) { holidayText = holidayText || cell; return; }

                    const veg = /^\*/.test(cell);
                    let label = null;
                    if (veg) label = 'Etsiz Alternatif';
                    else if (standard && isFoodRow) label = LABELS[foodIdx] || null;
                    else if (/corba/.test(this._fold(cell))) label = 'Çorba';
                    items.push({ name: this._niceName(cell), label, veg });
                });

                const day = {
                    iso: info.iso,
                    holiday: !!holidayText,
                    holidayText: holidayText ? this._clean(holidayText) : null,
                    items: holidayText ? [] : items,
                    calories: holidayText ? null : calories,
                    status: 'ok'
                };

                if (!info.weekdayOk) {
                    day.status = 'invalid';
                    day.reason = 'Gün adı tarihle uyuşmuyor';
                    issues.push(`Gün adı uyuşmuyor: "${info.raw}"`);
                } else if (day.holiday) {
                    day.status = 'holiday';
                } else if (!items.length) {
                    day.status = 'empty';
                }

                const prev = days[info.iso];
                if (prev) {
                    const same = JSON.stringify(prev.items) === JSON.stringify(day.items)
                        && prev.holiday === day.holiday;
                    if (!same) {
                        // Aynı tarihe iki farklı menü: hangisi doğru bilinemez
                        prev.status = 'invalid';
                        prev.reason = 'Bu tarihe iki farklı menü girilmiş';
                        issues.push(`Çakışan tarih: ${info.iso}`);
                    }
                    return;
                }
                days[info.iso] = day;
            });
            block = null;
        };

        rows.forEach(r => {
            if (isDateRow(r)) {
                flush();
                block = { cols: r.map(c => this._parseDateCell(c)), rows: [] };
            } else if (block) {
                block.rows.push(r);
            }
        });
        flush();

        return { days, issues };
    },

    // ---------------------------------------------------
    // Yükleme (ağ → cihaz önbelleği)
    // ---------------------------------------------------
    readCache() {
        try {
            const raw = Store.get(this.CACHE_KEY);
            if (!raw) return null;
            const c = JSON.parse(raw);
            return c && Array.isArray(c.rows) ? c : null;
        } catch {
            return null;
        }
    },

    writeCache(rows) {
        try {
            Store.set(this.CACHE_KEY, JSON.stringify({ savedAt: Date.now(), rows }));
        } catch { /* kota / özel mod */ }
    },

    // Bellekte veri yoksa cihazdakini hemen kullanılabilir yap
    current() {
        if (this._data) return this._data;
        const c = this.readCache();
        if (c) {
            this._data = { ...this.parseRows(c.rows), live: false, savedAt: c.savedAt };
        }
        return this._data;
    },

    async load(force = false) {
        if (this._loading && !force) return this._loading;
        this._loading = (async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
            try {
                const res = await fetch(this.csvUrl, { signal: controller.signal, cache: 'no-store' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const text = await res.text();
                // Sheet erişime kapatılırsa Google HTML giriş sayfası döner
                if (/^\s*</.test(text)) throw new Error('CSV yerine HTML geldi');
                const rows = this.parseCSV(text);
                const parsed = this.parseRows(rows);
                if (!Object.keys(parsed.days).length) throw new Error('Sheet içinde tarih bulunamadı');
                this.writeCache(rows);
                this._data = { ...parsed, live: true, savedAt: Date.now() };
            } catch (err) {
                const cached = this.current();
                if (cached) cached.live = false;
            } finally {
                clearTimeout(timer);
                this._loading = null;
            }
            return this._data;
        })();
        return this._loading;
    },

    // ---------------------------------------------------
    // Hangi gün gösterilecek?
    // Hafta içi → bugün. Cumartesi/Pazar → gelecek pazartesi.
    // ---------------------------------------------------
    targetDate(now = new Date()) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const wd = d.getDay();
        if (wd === 6) d.setDate(d.getDate() + 2);
        else if (wd === 0) d.setDate(d.getDate() + 1);
        return { iso: this._isoOf(d), weekend: wd === 0 || wd === 6 };
    },

    getDay(iso) {
        const data = this.current();
        return data && data.days[iso] ? data.days[iso] : null;
    },

    // "Şu an açık" kartı için bugünün yemek isimleri (yalnızca hafta içi, doğrulanmış gün)
    todayDishes(now = new Date()) {
        const iso = this._isoOf(now);
        const day = this.getDay(iso);
        if (!day || day.status !== 'ok') return null;
        return day.items.map(i => i.name);
    },

    // Bir tarihin Pazartesi–Cuma haftası (ISO listesi)
    _weekOf(iso) {
        const d = this._dateOf(iso);
        const wd = d.getDay() === 0 ? 7 : d.getDay();
        d.setDate(d.getDate() - (wd - 1));
        const out = [];
        for (let i = 0; i < 5; i++) {
            out.push(this._isoOf(d));
            d.setDate(d.getDate() + 1);
        }
        return out;
    },

    _label(iso, withDay = true) {
        const d = this._dateOf(iso);
        const base = `${d.getDate()} ${this.MONTH_LABELS[d.getMonth()]}`;
        return withDay ? `${base} ${this.DAY_LABELS[d.getDay()]}` : base;
    },

    _hasWeek(weekStartIso) {
        const data = this.current();
        if (!data) return false;
        return this._weekOf(weekStartIso).some(iso => data.days[iso]);
    },

    // ---------------------------------------------------
    // Ekran
    // ---------------------------------------------------
    render(container) {
        const target = this.targetDate();
        if (!this.selectedDate) this.selectedDate = target.iso;

        container.innerHTML = `
            <div class="sub-header">
                <button type="button" class="back-btn" onclick="App.showScreen('home')" aria-label="Geri">←</button>
                <h2 class="sub-header-title">🍽️ Gazi Üniversitesi</h2>
            </div>

            <div class="gz-head">
                <div class="gz-head-text">
                    <h3 class="gz-title">Gazi Üniversitesi Yemek Menüsü</h3>
                    <p class="gz-sub">Öğle yemeği · Hafta içi</p>
                </div>
                <span class="kyk-status-pill" id="gz-status">
                    <span class="status-dot"></span> <span id="gz-status-text">Yükleniyor…</span>
                </span>
            </div>

            <div id="gz-body"></div>

            <a href="${this.OFFICIAL_URL}" target="_blank" rel="noopener noreferrer"
               class="btn btn-secondary btn-full mb-lg place-menu-btn" id="gz-official-btn">
                📋 Menü güncel değilse tıklayınız <span aria-hidden="true">↗</span>
            </a>
        `;

        const btn = container.querySelector('#gz-official-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                try {
                    if (window.OYAnalytics) {
                        const day = this.getDay(this.selectedDate);
                        window.OYAnalytics.gaziMenuLinkiTiklandi(!!(day && day.status === 'ok'));
                    }
                } catch { /* sayaç uygulamayı bozmamalı */ }
            });
        }

        // 1) Cihazdaki veriyle anında çiz
        if (this.current()) this._renderBody(container);
        this._setStatus(container);

        // 2) Canlı veriyi çek, gelince yeniden çiz
        this.load().then(() => {
            if (!container.isConnected || App.currentScreen !== 'gazi') return;
            this._renderBody(container);
            this._setStatus(container);
        });
    },

    _setStatus(container) {
        const pill = container.querySelector('#gz-status');
        const text = container.querySelector('#gz-status-text');
        if (!pill || !text) return;
        const data = this._data;
        if (this._loading && !data) {
            pill.className = 'kyk-status-pill';
            text.textContent = 'Yükleniyor…';
        } else if (data && data.live) {
            pill.className = 'kyk-status-pill live';
            text.textContent = 'Güncel';
        } else if (data) {
            const when = new Date(data.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            pill.className = 'kyk-status-pill synced';
            text.textContent = `Kayıtlı · ${when}`;
        } else if (!this._loading) {
            pill.className = 'kyk-status-pill empty';
            text.textContent = navigator.onLine === false ? 'Çevrimdışı' : 'Alınamadı';
        }
    },

    select(iso) {
        this.selectedDate = iso;
        const container = document.getElementById('sub-screen');
        if (container) this._renderBody(container);
    },

    stepWeek(dir) {
        const d = this._dateOf(this._weekOf(this.selectedDate)[0]);
        d.setDate(d.getDate() + dir * 7);
        const monday = this._isoOf(d);
        if (!this._hasWeek(monday)) return;
        const data = this.current();
        const week = this._weekOf(monday);
        this.select(week.find(iso => data.days[iso]) || monday);
    },

    _renderBody(container) {
        const body = container.querySelector('#gz-body');
        if (!body) return;
        const esc = (v) => (window.Screens ? Screens._esc(v) : String(v));
        const data = this.current();
        const target = this.targetDate();
        const todayIso = this._isoOf(new Date());

        if (!data) {
            body.innerHTML = this._loading
                ? '<div class="kyk-loading-shimmer"><p>Menü yükleniyor...</p></div>'
                : `<div class="kyk-empty-state">
                       <span class="kyk-empty-icon" aria-hidden="true">📡</span>
                       <h3 class="kyk-empty-title">Menüye ulaşılamadı</h3>
                       <p class="kyk-empty-text">İnternet bağlantını kontrol et ya da aşağıdaki butondan resmi listeye bak.</p>
                   </div>`;
            return;
        }

        const sel = this.selectedDate || target.iso;
        const week = this._weekOf(sel);
        const prevMonday = (() => { const d = this._dateOf(week[0]); d.setDate(d.getDate() - 7); return this._isoOf(d); })();
        const nextMonday = (() => { const d = this._dateOf(week[0]); d.setDate(d.getDate() + 7); return this._isoOf(d); })();
        const hasPrev = this._hasWeek(prevMonday);
        const hasNext = this._hasWeek(nextMonday);

        const chips = week.map(iso => {
            const d = this._dateOf(iso);
            const day = data.days[iso];
            const cls = ['gz-chip'];
            if (iso === sel) cls.push('active');
            if (iso === todayIso) cls.push('today');
            if (!day) cls.push('missing');
            else if (day.status === 'holiday') cls.push('holiday');
            else if (day.status === 'invalid') cls.push('invalid');
            const mark = !day ? '—' : day.status === 'holiday' ? 'Tatil' : day.status === 'invalid' ? '!' : '';
            return `
                <button type="button" class="${cls.join(' ')}" onclick="GaziMenu.select('${iso}')"
                        aria-pressed="${iso === sel}" aria-label="${esc(this._label(iso))}">
                    <span class="gz-chip-day">${this.DAY_SHORT[d.getDay()]}</span>
                    <span class="gz-chip-date">${d.getDate()}</span>
                    ${mark ? `<span class="gz-chip-mark">${mark}</span>` : '<span class="gz-chip-mark gz-chip-dot" aria-hidden="true"></span>'}
                </button>
            `;
        }).join('');

        const selDay = data.days[sel];
        // Üst etiket + tarih; gün adı iki kez yazılmasın
        let heading;
        let dateText;
        if (sel === todayIso) {
            heading = 'Bugün';
            dateText = this._label(sel);
        } else if (target.weekend && sel === target.iso) {
            heading = 'Pazartesi menüsü';
            dateText = this._label(sel, false);
        } else {
            heading = this.DAY_LABELS[this._dateOf(sel).getDay()];
            dateText = this._label(sel, false);
        }

        let note = '';
        if (target.weekend && sel === target.iso) {
            note = '<p class="gz-note">Hafta sonu yemekhane kapalı — pazartesi günün menüsü gösteriliyor.</p>';
        }

        let card;
        if (!selDay) {
            card = `
                <div class="gz-card gz-card-empty">
                    <span class="gz-empty-icon" aria-hidden="true">🗒️</span>
                    <p class="gz-empty-title">Bu gün için menü henüz eklenmedi</p>
                    <p class="gz-empty-text">Menü eklendiğinde burada otomatik görünecek.</p>
                </div>`;
        } else if (selDay.status === 'holiday') {
            card = `
                <div class="gz-card gz-card-holiday">
                    <span class="gz-empty-icon" aria-hidden="true">🎉</span>
                    <p class="gz-empty-title">Resmi tatil</p>
                    <p class="gz-empty-text">${esc(
                        selDay.holidayText && !/^\s*resmi\s+tatil\s*$/.test(this._fold(selDay.holidayText))
                            ? selDay.holidayText
                            : 'Bu gün yemekhane hizmet vermiyor.')}</p>
                </div>`;
        } else if (selDay.status === 'invalid') {
            card = `
                <div class="gz-card gz-card-empty">
                    <span class="gz-empty-icon" aria-hidden="true">⚠️</span>
                    <p class="gz-empty-title">Bu günün menüsü doğrulanamadı</p>
                    <p class="gz-empty-text">${esc(selDay.reason || 'Listede tutarsızlık var')}. Lütfen resmi listeye bak.</p>
                </div>`;
        } else if (selDay.status === 'empty') {
            card = `
                <div class="gz-card gz-card-empty">
                    <span class="gz-empty-icon" aria-hidden="true">🗒️</span>
                    <p class="gz-empty-title">Bu gün için menü henüz eklenmedi</p>
                </div>`;
        } else {
            card = `
                <div class="gz-card">
                    <div class="gz-card-head">
                        <div>
                            <span class="gz-card-kicker">${esc(heading)}</span>
                            <h4 class="gz-card-date">${esc(dateText)}</h4>
                        </div>
                        ${selDay.calories ? `<span class="kyk-calorie-badge">🔥 ${selDay.calories} kcal</span>` : ''}
                    </div>
                    <div class="gz-dishes">
                        ${selDay.items.map(it => `
                            <div class="gz-dish${it.veg ? ' veg' : ''}">
                                <span class="gz-dish-icon" aria-hidden="true">${it.veg ? '🥦' : (window.Screens ? Screens._categorizeDishIcon(it.name) : '🍽️')}</span>
                                <span class="gz-dish-text">
                                    <span class="gz-dish-name">${esc(it.name)}</span>
                                    ${it.label ? `<span class="gz-dish-label">${esc(it.label)}</span>` : ''}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }

        body.innerHTML = `
            <div class="gz-week">
                <button type="button" class="gz-week-arrow" onclick="GaziMenu.stepWeek(-1)"
                        ${hasPrev ? '' : 'disabled'} aria-label="Önceki hafta">‹</button>
                <div class="gz-week-chips">${chips}</div>
                <button type="button" class="gz-week-arrow" onclick="GaziMenu.stepWeek(1)"
                        ${hasNext ? '' : 'disabled'} aria-label="Sonraki hafta">›</button>
            </div>
            <p class="gz-week-range">${esc(this._label(week[0], false))} – ${esc(this._label(week[4], false))}</p>
            ${note}
            ${card}
        `;
    }
};

window.GaziMenu = GaziMenu;
