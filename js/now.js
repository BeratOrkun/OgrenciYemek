// =====================================================
// ÖğrenciYemek — "Şu an yiyebileceğin yerler" kartı
//
// Ana ekranda, cihaz saatine göre O AN açık olan yerleri listeler:
//   • KYK kahvaltı / akşam yemeği   (her gün)
//   • Üniversite yemekhaneleri       (hafta içi, sabit 11:00–13:30)
//   • ABB Gençlik Sofrası            (hafta içi)
//   • Çankaya Gençlik Sofrası        (hafta içi)
//   • Çankaya Kent Lokantası         (hafta içi)
//   • Etimesgut Kent Lokantası       (hafta içi; dokununca belediye sitesi açılır)
//   • Millet Kütüphanesi ikramları   (servis bazında saat aralıkları)
//
// Saatler data.js → openHours ve milletKutuphanesi.services[].windows
// alanlarından okunur. Yemek isimleri yalnızca cihazda zaten bulunan
// GERÇEK veriden gelir (canlı/kayıtlı menü); ağ isteği atılmaz.
// Satıra dokununca ilgili sayfa açılır ve tıklama GoatCounter + Umami'ye
// "simdi-acik/<kaynak>" olayı olarak gönderilir.
// =====================================================

var NowOpen = window.NowOpen = {
    _timer: null,
    _lastKey: null,

    // ---------------------------------------------------
    // Zaman yardımcıları
    // ---------------------------------------------------
    _toMin(hhmm) {
        const [h, m] = String(hhmm).split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    },

    _pad(n) {
        return String(n).padStart(2, '0');
    },

    _dateStr(d) {
        return `${d.getFullYear()}-${this._pad(d.getMonth() + 1)}-${this._pad(d.getDate())}`;
    },

    _isWeekday(d) {
        const day = d.getDay();
        return day >= 1 && day <= 5;
    },

    // Aralık şu an açık mı? (bitiş hariç: 13:30'da kapanmış sayılır)
    _isOpen(win, nowMin) {
        return nowMin >= this._toMin(win.start) && nowMin < this._toMin(win.end);
    },

    _esc(v) {
        return (window.Screens && Screens._esc) ? Screens._esc(v) : String(v ?? '');
    },

    // ---------------------------------------------------
    // Yemek isimleri (yalnızca cihazdaki gerçek veriden)
    // ---------------------------------------------------
    _kykMenuForToday(now) {
        try {
            const city = Store.get('oy_city') || 'Ankara';
            const slug = Screens._slugifyCity(city);
            const dateStr = this._dateStr(now);
            const mem = Screens.kykMenuMemoryCache[`oy_kyk_live_${slug}_${dateStr}`];
            if (mem) return { data: mem, estimated: false };
            const stored = Screens._readStoredKYKMenu(slug, dateStr);
            if (stored && stored.data) return { data: stored.data, estimated: false };
            const backup = Screens._getBackupKYKMenu(slug, dateStr);
            if (backup) return { data: backup, estimated: true };
        } catch { /* veri yoksa isim gösterilmez */ }
        return null;
    },

    // Su ve ekmek gibi her öğünde olanlar önizlemede yer kaplamasın
    _isFiller(name) {
        return /^(\d+\s*ml\s*)?su$|ekmek/i.test(String(name).trim());
    },

    _kykDishes(now, mealKey) {
        const menu = this._kykMenuForToday(now);
        const meal = menu && menu.data && menu.data[mealKey];
        if (!meal || !Array.isArray(meal.items)) return null;
        const names = meal.items
            .map(it => (it && it.name) || '')
            .filter(n => n && !this._isFiller(n));
        if (!names.length) return null;
        return { names, estimated: menu.estimated };
    },

    _genclikDishes(now) {
        try {
            const cached = GenclikSofralariAPI.readCache();
            const data = cached && cached.data;
            if (!data) return null;
            const today = this._dateStr(now);

            // 1) "Bugünün menüsü" tahtası — tarihi bugünse
            if (data.today && data.today.dateISO
                && String(data.today.dateISO).slice(0, 10) === today
                && data.today.items && data.today.items.length) {
                return data.today.items;
            }

            // 2) Haftalık listede bugünün satırı ("17 Kasım" eşleşmesi)
            if (data.week && Array.isArray(data.week.days)) {
                const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                const label = `${now.getDate()} ${months[now.getMonth()]}`.toLocaleLowerCase('tr');
                const row = data.week.days.find(d => d.tarih
                    && String(d.tarih).toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim() === label);
                if (row && row.dishes && row.dishes.length) return row.dishes;
            }
        } catch { /* önbellek yok */ }
        return null;
    },

    // Gençlik Sofrası sayfası menüyü BÜYÜK HARF yayınlıyor; kartta okunaklı olsun
    _titleCase(s) {
        const str = String(s).trim();
        if (str !== str.toLocaleUpperCase('tr')) return str;
        return str.toLocaleLowerCase('tr').replace(/(^|[\s(/+-])(\p{L})/gu,
            (m, p, c) => p + c.toLocaleUpperCase('tr'));
    },

    // ---------------------------------------------------
    // O anki durumun hesaplanması
    // ---------------------------------------------------
    _slots() {
        const H = APP_DATA.openHours;
        return [
            { key: 'kyk-kahvalti', screen: 'kyk', meal: 'breakfast', icon: '🍳', accent: 'green', name: 'KYK Kahvaltı', hours: H.kykBreakfast },
            { key: 'kyk-aksam', screen: 'kyk', meal: 'dinner', icon: '🍲', accent: 'green', name: 'KYK Akşam Yemeği', hours: H.kykDinner },
            { key: 'universite', screen: 'universities', icon: '🎓', accent: 'orange', name: 'Üniversite Yemekhanesi', hours: H.university },
            { key: 'genclik-sofrasi', screen: 'genclik', icon: '🥘', accent: 'blue', name: 'ABB Gençlik Sofrası', hours: H.genclik, free: true },
            { key: 'cankaya-genclik-sofrasi', screen: 'cankaya-genclik', icon: '🥗', accent: 'cyan', name: 'Çankaya Gençlik Sofrası', hours: H.cankayaGenclik, free: true },
            { key: 'cankaya-kent-lokantasi', screen: 'cankaya-kent', icon: '🍛', accent: 'yellow', name: 'Çankaya Kent Lokantası', hours: H.cankayaKent, price: APP_DATA.cankayaKentLokantasi.price },
            { key: 'etimesgut-kent-lokantasi', screen: 'external-etimesgut', icon: '🍲', accent: 'pink', name: 'Etimesgut Kent Lokantası', hours: H.etimesgutKent, price: APP_DATA.etimesgutKentLokantasi.price }
        ];
    },

    _slotAvailableOn(slot, date) {
        return !slot.hours.weekdaysOnly || this._isWeekday(date);
    },

    compute(now = new Date()) {
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const items = [];

        this._slots().forEach(slot => {
            if (!this._slotAvailableOn(slot, now) || !this._isOpen(slot.hours, nowMin)) return;
            const endMin = this._toMin(slot.hours.end);
            const item = {
                key: slot.key,
                screen: slot.screen,
                icon: slot.icon,
                accent: slot.accent,
                name: slot.name,
                free: !!slot.free,
                price: slot.price || null,
                end: slot.hours.end,
                minutesLeft: endMin - nowMin,
                dishes: null,
                hint: null,
                estimated: false
            };

            if (slot.screen === 'kyk') {
                const d = this._kykDishes(now, slot.meal);
                if (d) {
                    item.dishes = d.names;
                    item.estimated = d.estimated;
                } else {
                    item.hint = 'Menüyü görmek için dokun';
                }
            } else if (slot.screen === 'genclik') {
                const d = this._genclikDishes(now);
                if (d) item.dishes = d.map(n => this._titleCase(n));
                else item.hint = 'Bugünün menüsü için dokun';
            } else if (slot.screen === 'cankaya-genclik') {
                // Belediyenin paylaştığı haftalık menüde yalnızca BUGÜNÜN satırı
                const menu = APP_DATA.cankayaGenclikSofrasi.weeklyMenu || [];
                const row = menu.find(d => d.date === this._dateStr(now));
                if (row) item.dishes = row.items.slice();
                else item.hint = 'Menü için dokun';
            } else if (slot.screen === 'external-etimesgut') {
                item.hint = 'Günün menüsü için dokun';
            } else if (slot.screen === 'cankaya-kent') {
                item.hint = 'Cebeci · Sokullu · Seyranbağları';
            } else if (slot.screen === 'universities') {
                const uniName = Store.get('oy_university');
                const uni = uniName && APP_DATA.universities.find(u => u.name === uniName);
                if (uni) item.name = `${uni.shortName || uni.name} Yemekhanesi`;
                item.hint = 'Öğle yemeği · Menü için dokun';
                // Menüsü uygulamada olan üniversite: bugünün yemekleri + kendi ekranı
                if (uni && uni.inApp && window.UniMenus && UniMenus.UNIS[uni.inApp]) {
                    // Gazi / Hacettepe / Ankara Üniversitesi (uniyemekscrapper verisi)
                    const d = UniMenus.todayDishes(uni.inApp);
                    if (d && d.length) {
                        item.dishes = d;
                        item.hint = null;
                    }
                    item.screen = uni.inApp;
                }
            }

            items.push(item);
        });

        // Ana öğünler: en erken kapanan en üstte
        items.sort((a, b) => a.minutesLeft - b.minutesLeft);

        // Millet Kütüphanesi — o an açık ikramlar (her gün)
        const ml = APP_DATA.milletKutuphanesi;
        const openServices = (ml.services || []).filter(s =>
            Array.isArray(s.windows) && s.windows.some(w => this._isOpen(w, nowMin)));
        if (openServices.length) {
            // 7/24 olanlar sona, zamanlı ikramlar öne
            const parts = openServices
                .map(s => {
                    const win = s.windows.find(w => this._isOpen(w, nowMin));
                    const allDay = win.start === '00:00' && win.end === '24:00';
                    return { allDay, text: allDay ? s.shortName : `${s.shortName} (${win.start}–${win.end})` };
                })
                .sort((a, b) => Number(a.allDay) - Number(b.allDay))
                .map(p => p.text);
            items.push({
                key: 'millet-kutuphanesi',
                screen: 'millet',
                icon: '🏛️',
                accent: 'purple',
                name: 'Millet Kütüphanesi',
                free: true,
                end: null,
                minutesLeft: null,
                dishes: parts,
                hint: null,
                estimated: false,
                always: true
            });
        }

        return { items, next: this._nextOpenings(now, nowMin) };
    },

    // Bugün daha sonra açılacak ana öğünler; bugün yoksa yarının ilki
    _nextOpenings(now, nowMin) {
        const slots = this._slots();
        const today = slots
            .filter(s => this._slotAvailableOn(s, now) && this._toMin(s.hours.start) > nowMin)
            .sort((a, b) => this._toMin(a.hours.start) - this._toMin(b.hours.start))
            .slice(0, 2)
            .map(s => ({ name: s.name, start: s.hours.start, tomorrow: false }));
        if (today.length) return today;

        const tmr = new Date(now);
        tmr.setDate(tmr.getDate() + 1);
        const first = slots
            .filter(s => this._slotAvailableOn(s, tmr))
            .sort((a, b) => this._toMin(a.hours.start) - this._toMin(b.hours.start))[0];
        return first ? [{ name: first.name, start: first.hours.start, tomorrow: true }] : [];
    },

    // ---------------------------------------------------
    // Çizim
    // ---------------------------------------------------
    // Sağdaki sabit saat sütunu: "19:00 / kapanış", "15 dk / kaldı", "7/24 / açık"
    _timeCol(item) {
        if (item.always) {
            return '<span class="now-row-time always"><strong>7/24</strong><small>açık</small></span>';
        }
        if (item.minutesLeft != null && item.minutesLeft <= 30) {
            return `<span class="now-row-time soon"><strong>${item.minutesLeft} dk</strong><small>kaldı</small></span>`;
        }
        return `<span class="now-row-time"><strong>${this._esc(item.end)}</strong><small>kapanış</small></span>`;
    },

    _row(item) {
        const tags = [];
        if (item.free) tags.push('<span class="now-tag now-tag-free">Ücretsiz</span>');
        if (item.price) tags.push(`<span class="now-tag now-tag-price">${this._esc(item.price)}</span>`);
        if (item.estimated) tags.push('<span class="now-tag now-tag-est">Tahmini</span>');

        const body = item.dishes && item.dishes.length
            ? item.dishes.map(d => this._esc(d)).join(' · ')
            : this._esc(item.hint || '');

        return `
            <button type="button" class="now-row" data-accent="${item.accent}"
                    data-now-key="${item.key}" data-now-screen="${item.screen}">
                <span class="now-row-icon" aria-hidden="true">${item.icon}</span>
                <span class="now-row-main">
                    <span class="now-row-name">${this._esc(item.name)}</span>
                    <span class="now-row-dishes${item.dishes ? '' : ' is-hint'}">${tags.join('')}${body}</span>
                </span>
                ${this._timeCol(item)}
            </button>
        `;
    },

    render() {
        const listEl = document.getElementById('now-list');
        if (!listEl) return;

        const now = new Date();
        const { items, next } = this.compute(now);

        // Saat rozeti: "17:12" (ekran okuyucu için tam tarih)
        const timeEl = document.getElementById('now-time');
        if (timeEl) {
            const hm = `${this._pad(now.getHours())}:${this._pad(now.getMinutes())}`;
            timeEl.textContent = hm;
            timeEl.setAttribute('aria-label',
                `${now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}, saat ${hm}`);
        }

        const hasMeal = items.some(i => !i.always);
        const leadEl = document.getElementById('now-lead');
        if (leadEl) {
            leadEl.textContent = hasMeal
                ? 'Şu anda aşağıdaki yemeklerden faydalanabilirsin'
                : 'Şu an açık yemekhane yok, ama bunlardan faydalanabilirsin';
        }

        // Gereksiz yeniden çizimi önle (dakikada bir çağrılıyor)
        const html = items.map(i => this._row(i)).join('');
        if (html !== this._lastKey) {
            listEl.innerHTML = html || '<p class="now-empty">Şu an açık bir yer yok.</p>';
            this._lastKey = html;
        }

        const nextEl = document.getElementById('now-next');
        if (nextEl) {
            if (next.length) {
                nextEl.hidden = false;
                nextEl.innerHTML = `<span class="now-next-label">Sıradaki</span> ` + next
                    .map(n => `${this._esc(n.name)} <strong>${n.tomorrow ? 'yarın ' : ''}${this._esc(n.start)}</strong>`)
                    .join('<span class="now-next-sep">·</span>');
            } else {
                nextEl.hidden = true;
            }
        }
    },

    // ---------------------------------------------------
    // Etkileşim + analitik
    // ---------------------------------------------------
    open(key, screen, name) {
        // Olay, sayfa geçişinden ÖNCE gönderilir: böylece Umami'de olayın
        // sayfası "/" (ana ekran) olarak kaydedilir.
        try {
            if (window.OYAnalytics) window.OYAnalytics.simdiAcikTiklandi(key, name);
        } catch { /* sayaç asla uygulamayı bozmamalı */ }
        // Etimesgut: menü belediye sitesinde görsel; doğrudan o sayfayı aç
        if (screen === 'external-etimesgut') {
            App.openEtimesgutKent('simdi-acik');
            return;
        }
        App.showScreen(screen);
    },

    init() {
        const listEl = document.getElementById('now-list');
        if (!listEl || this._inited) return;
        this._inited = true;

        // Tek dinleyici (olay delegasyonu): satırlar yeniden çizilse de çalışır
        listEl.addEventListener('click', (e) => {
            const row = e.target.closest('.now-row');
            if (!row) return;
            const nameEl = row.querySelector('.now-row-name');
            this.open(row.dataset.nowKey, row.dataset.nowScreen, nameEl ? nameEl.textContent : '');
        });

        // Dakika başında güncelle (saat ve açık/kapalı durumu)
        const tick = () => {
            if (App.currentScreen === 'home' && document.visibilityState !== 'hidden') this.render();
            const n = new Date();
            this._timer = setTimeout(tick, (60 - n.getSeconds()) * 1000 + 50);
        };
        const n = new Date();
        this._timer = setTimeout(tick, (60 - n.getSeconds()) * 1000 + 50);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && App.currentScreen === 'home') this.render();
        });
    }
};

window.NowOpen = NowOpen;
