// =====================================================
// ÖğrenciYemek — Güvenli Depolama Katmanı
//
// Neden gerekli: Instagram/Facebook gibi uygulamaların kendi
// içindeki tarayıcılarda, Safari gizli modunda ve çerezleri
// engelleyen ayarlarda localStorage'a erişmek SecurityError
// fırlatır. Doğrudan erişim uygulamanın ilk satırında patlayıp
// sayfanın bomboş açılmasına yol açıyordu.
//
// Bu katman her erişimi korur; depolama yoksa oturum boyunca
// bellekte tutar, böylece uygulama her koşulda çalışır.
// =====================================================

const Store = {
    _memory: {},
    _usable: null,

    // localStorage gerçekten kullanılabiliyor mu? (bir kez ölçülür)
    available() {
        if (this._usable !== null) return this._usable;
        try {
            const probe = '__oy_probe__';
            window.localStorage.setItem(probe, '1');
            window.localStorage.removeItem(probe);
            this._usable = true;
        } catch {
            this._usable = false;
        }
        return this._usable;
    },

    get(key) {
        if (this.available()) {
            try {
                return window.localStorage.getItem(key);
            } catch {
                /* erişim sonradan kısıtlandı — belleğe düş */
            }
        }
        return Object.prototype.hasOwnProperty.call(this._memory, key)
            ? this._memory[key]
            : null;
    },

    set(key, value) {
        const v = String(value);
        this._memory[key] = v;
        if (this.available()) {
            try {
                window.localStorage.setItem(key, v);
                return true;
            } catch {
                /* kota dolu veya kısıtlı — bellekte kalsın */
            }
        }
        return false;
    },

    remove(key) {
        delete this._memory[key];
        if (this.available()) {
            try {
                window.localStorage.removeItem(key);
            } catch {
                /* yoksay */
            }
        }
    }
};
