// =====================================================
// ÖğrenciYemek - Veri Dosyası
// Ankara üniversiteleri, KYK yurtları, Gençlik Sofrası
// =====================================================

const APP_DATA = {
    cities: ['Ankara'],

    // Ankara Üniversiteleri (10 Kurum: 9 Devlet, 1 Vakıf)
    universities: [
        // --- Devlet Üniversiteleri (9) ---
        {
            id: 1,
            name: 'Ankara Üniversitesi',
            shortName: 'Ankara Üni.',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://sks.ankara.edu.tr/yemek-hizmetleri-2/',
            accessChannel: '✅ Açık Menü',
            note: 'Öğle, akşam ve vejetaryen menüler ayrı listeler halinde yayınlanır. Aylık menü indirilebilir.',
            icon: '🏛️'
        },
        {
            id: 2,
            name: 'Gazi Üniversitesi',
            shortName: 'Gazi Üni.',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://mediko.gazi.edu.tr/view/page/20412/yemek-listesi',
            accessChannel: '✅ Açık Menü',
            note: 'Haftalık tablo formatında öğle menüsü; vejetaryen seçenekler işaretli. Kalori bilgisi mevcut.',
            icon: '🏛️'
        },
        {
            id: 3,
            name: 'Hacettepe Üniversitesi',
            shortName: 'Hacettepe',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://beslenme.hacettepe.edu.tr/',
            accessChannel: '✅ Açık Menü',
            note: 'Günlük/haftalık/aylık görünüm; öğle, akşam ve vegan menüler; alerjen kodları ve kalori bilgisi.',
            icon: '🏛️'
        },
        {
            id: 4,
            name: 'Orta Doğu Teknik Üniversitesi',
            shortName: 'ODTÜ',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://kafeterya.metu.edu.tr/',
            accessChannel: '✅ Açık Menü',
            note: 'Ana sayfada günün menüsü (kahvaltı/öğle/akşam); aylık menü PDF duyurular bölümünde.',
            icon: '🏛️'
        },
        {
            id: 5,
            name: 'Ankara Yıldırım Beyazıt Üniversitesi',
            shortName: 'AYBÜ',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://aybu.edu.tr/sks/tr/sayfa/6265/Yemek-Men%C3%BCs%C3%BC',
            accessChannel: '✅ Açık Menü',
            note: 'Haftalık menü tabloları kalori değerleriyle birlikte sayfada. Mobil uygulama üzerinden de erişilebilir.',
            icon: '🏛️'
        },
        {
            id: 6,
            name: 'Ankara Sosyal Bilimler Üniversitesi',
            shortName: 'ASBÜ',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://sksdb.asbu.edu.tr/tr',
            accessChannel: '✅ Açık Menü',
            note: 'Ana sayfada günlük menü ve kalori özeti; aylık menü ayrı sayfada sunulmaktadır.',
            icon: '🏛️'
        },
        {
            id: 7,
            name: 'Ankara Hacı Bayram Veli Üniversitesi',
            shortName: 'AHBV',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://yemek.hacibayram.edu.tr/',
            accessChannel: '✅ Açık Menü',
            note: 'Günlük menü + takvim arayüzü; aylık geçmiş menülere takvimden erişim. Kalori bilgisi mevcuttur.',
            icon: '🏛️'
        },
        {
            id: 8,
            name: 'Ankara Müzik ve Güzel Sanatlar Üniversitesi',
            shortName: 'MGÜ',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://www.mgu.edu.tr/mgu-yemek-menusu/',
            accessChannel: '✅ Açık Menü',
            note: 'Haftalık tablo formatında menü; yemek rezervasyonu ve fiyat tablosu aynı sayfada.',
            icon: '🏛️'
        },
        {
            id: 9,
            name: 'SBÜ Gülhane Külliyesi',
            shortName: 'SBÜ Gülhane',
            type: 'Devlet',
            menuStatus: 'available', // ✅
            menuUrl: 'https://sksdb.sbu.edu.tr/yemek-listesi/',
            accessChannel: '✅ Açık Menü',
            note: 'Gülhane Külliyesinde günde 3 öğün yemek sunulur. Aylık menü SKSDB sitesinde yayınlanır (Gülhane seçilmelidir).',
            icon: '🏛️'
        },
        // --- Vakıf Üniversiteleri (1) ---
        {
            id: 10,
            name: 'Bilkent Üniversitesi',
            shortName: 'Bilkent',
            type: 'Vakıf',
            menuStatus: 'available', // ✅
            menuUrl: 'https://kafemud.bilkent.edu.tr/monu_tr.html',
            accessChannel: '✅ Açık Menü',
            note: 'Haftalık fiks ve seçmeli tabldot menüleri; vegan seçenekler işaretli. Kamuya açık ve düzenli güncellenir.',
            icon: '🎓'
        }
    ],

        // KYK Bilgileri ve Beslenme Yardımı
    kykInfo: {
        title: 'KYK Yurt Yemekleri',
        breakfastHours: '06:30 - 12:00',
        dinnerHours: '16:00 - 22:30',
        breakfastSubsidy: '110 ₺',
        dinnerSubsidy: '190 ₺',
        totalSubsidy: '300 ₺',
        description: 'T.C. Gençlik ve Spor Bakanlığı Kredi ve Yurtlar Genel Müdürlüğü yemek hizmeti.'
    },

    // Çevrimdışı ve Yedek KYK Menü Veritabanı (Kasım 2026 - 30 Gün Eksiksiz)
    kykMenuBackup: {
        "11-01": {
                "dayName": "Pazar",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Düğün Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Kalamar / Ispanak Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Salçalı Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Rus Salatası",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-02": {
                "dayName": "Pazartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Arabaşı Çorba / Mısır Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Nohut Yemeği / İmam Bayıldı",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Bulgur Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Cevizli Baklava",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-03": {
                "dayName": "Salı",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Domates Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Çökertme / Karışık Kızartma+Yoğurt",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Çoban Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-04": {
                "dayName": "Çarşamba",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Tel Şehriye Çorba / Kremalı Mantar Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Hasanpaşa Köfte / Tavuk Izgara / Sebzeli Mantar Sote",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Salçalı Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Sütlaç",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-05": {
                "dayName": "Perşembe",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Yayla Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Tantuni+Lavaş+Turşu / Karnabahar Graten",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Bulgur Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Sumaklı Soğan Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-06": {
                "dayName": "Cuma",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Tarhana Çorba / Tutmaç Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Et Fajita / Kekikli Beşamelli Tavuk / Kabak Mücver",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Bezelyeli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Cacık",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-07": {
                "dayName": "Cumartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Yüksük Çorbası / Mercimek Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Köri Soslu Tavuk / Lahana Sarma",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Spagetti Napoliten",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Browni",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-08": {
                "dayName": "Pazar",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Mahluta Çorba / Sebze Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Beğendili Köfte / Tavuk Sote / Taze Fasulye Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Acılı Ezme",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-09": {
                "dayName": "Pazartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Toyga Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Elbasan Tava+Küp Patates / Terbiyeli Tavuk Yahni(Kemiksiz) / İmam Bayıldı",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Meyhane Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Havuçlu Pancar Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-10": {
                "dayName": "Salı",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Şehriye Çorbası / Mercimek Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Çıtır Tavuk Pane / Biber-Kabak Dolması",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Sebzeli Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Haydari",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-11": {
                "dayName": "Çarşamba",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Köylü Çorba / Terbiyeli Tavuk Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Kuru Fasulye / Patates Köftesi+Yoğurt",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Kabune Pilavı / Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Karışık Turşu",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "Şekerpare",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-12": {
                "dayName": "Perşembe",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Pirinç Çorba / Cennet Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Külbastı / Çıtır Kabak Kızartması",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Pilav",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Çoban Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-13": {
                "dayName": "Cuma",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Kremalı Mantar Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Hamburger(Et) / Yeşil Mercimek Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Patates Kızartması+Ketçap+Mayonez",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Ayran/Meyve Suyu",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-14": {
                "dayName": "Cumartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Domates Çorba / Mercimek Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Şiş+Lavaş+Köz Biber/Domates / Karışık Kızartma+Yoğurt",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Domatesli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Supangle",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-15": {
                "dayName": "Pazar",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Tarhana Çorba / Sebze Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Dana Rosto (Püreli) / Tavuk Kalamar / Karnabahar Graten",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Bulgur Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Atom(Tatlı Veya Acı)",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-16": {
                "dayName": "Pazartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Havuç Çorba / Yayla Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Fajita / Taze Fasulye Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Fırın Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Ege Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-17": {
                "dayName": "Salı",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Mısır Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "İzmir Köfte / Haşlanmış Didilmiş Tavuk+Kornişon Turşu / İmam Bayıldı",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Nohutlu Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Kabak Tatlısı (Tahinli Cevizli)",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-18": {
                "dayName": "Çarşamba",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Şehriye Çorbası / Mercimek Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuklu Buğu Kebabı / Lahana Sarma",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Salçalı Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Yoğurt",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-19": {
                "dayName": "Perşembe",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Andaloz Çorba / Kremalı Mantar Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tire Köfte / Fırında Sebzeli Tavuk / Sebzeli Mantar Sote",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Domatesli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Ayran",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-20": {
                "dayName": "Cuma",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Terbiyeli Tavuk Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Nohut Yemeği / Fırın Beşamel Soslu Sebze",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Cevizli Kadayıf",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-21": {
                "dayName": "Cumartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Mahluta Çorba / Toyga Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Piliç Şnitzel / Biber/Patlıcan/Kabak Dolma",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Yoğurtlu Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Acılı Ezme",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-22": {
                "dayName": "Pazar",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Yüksük Çorbası / Mercimek Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Çoban Kavurma / Tavuk Külbastı / Havuçlu Bezelye Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Bulgur Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Domatesli Roka Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-23": {
                "dayName": "Pazartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Nohutlu Tarhana Çorba / Düğün Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Sote / Peynirli Kabak Sandal",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Bisküvili Pasta",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-24": {
                "dayName": "Salı",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Sebze Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Hamburger(Et) / Fırında Kaşarlı Karnabahar Köftesi",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Patates Kızartması+Ketçap+Mayonez",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Ayran/Meyve Suyu",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-25": {
                "dayName": "Çarşamba",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Şehriye Çorbası / Anadolu Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Balon Tava / Tavuk Çökertme / Karışık Kızartma+Yoğurt",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Mercimekli Bulgur Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Koslov Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-26": {
                "dayName": "Perşembe",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Köylü Çorba / Yayla Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Tavuk Izgara / Patlıcan Çığırtma",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Pesto Soslu Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Havuçlu Pancar Salata",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-27": {
                "dayName": "Cuma",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Arabaşı Çorba / Kremalı Mantar Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Kuru Fasulye / Karışık Sebze Graten",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Şehriyeli Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Turşu",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "Trileçe",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-28": {
                "dayName": "Cumartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Yüksük Çorbası / Mercimek Çorbası",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Macar Gulaş / Çıtır Tavuk Pane / Taze Fasulye Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Sebzeli Bulgur Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Yoğurt",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-29": {
                "dayName": "Pazar",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Ezogelin Çorba / Cennet Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Kremalı Mantarlı Tavuk / Biber/Patlıcan/Kabak Dolma",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Köri Soslu Makarna",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Haydari",
                                        "category": "Salata / Meze",
                                        "icon": "🥗"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        },
        "11-30": {
                "dayName": "Pazartesi",
                "dinner": {
                        "title": "Akşam Yemeği",
                        "hours": "16:00 - 22:30",
                        "calories": "780 - 980 kcal",
                        "subsidy": "190 ₺",
                        "items": [
                                {
                                        "name": "Domates Çorba / Terbiyeli Tavuk Çorba",
                                        "category": "Çorba",
                                        "icon": "🥣"
                                },
                                {
                                        "name": "Balaban Köfte / Tavuk Fajita / Barbunya Yemeği",
                                        "category": "Ana Yemek",
                                        "icon": "🍗"
                                },
                                {
                                        "name": "Garnitürlü Pirinç Pilavı",
                                        "category": "Yardımcı Yemek",
                                        "icon": "🍚"
                                },
                                {
                                        "name": "Kalburabastı",
                                        "category": "Tatlı",
                                        "icon": "🍮"
                                },
                                {
                                        "name": "500 ml Su",
                                        "category": "İçecek",
                                        "icon": "💧"
                                },
                                {
                                        "name": "Çeyrek Ekmek",
                                        "category": "Ekmek",
                                        "icon": "🍞"
                                }
                        ]
                },
                "breakfast": {
                        "title": "Sabah Kahvaltısı",
                        "hours": "06:30 - 12:00",
                        "calories": "650 - 850 kcal",
                        "subsidy": "110 ₺",
                        "items": [
                                {
                                        "name": "Sucuklu Omlet / Haşlanmış Yumurta",
                                        "category": "Sıcak",
                                        "icon": "🍳"
                                },
                                {
                                        "name": "Patates Kızartması / Karışık Kızartma",
                                        "category": "Sıcak",
                                        "icon": "🍟"
                                },
                                {
                                        "name": "Taze Simit & Açma",
                                        "category": "Unlu Mamul",
                                        "icon": "🥯"
                                },
                                {
                                        "name": "Beyaz Peynir / Kaşar Peynir",
                                        "category": "Şarküteri",
                                        "icon": "🧀"
                                },
                                {
                                        "name": "Siyah ve Yeşil Zeytin",
                                        "category": "Kahvaltılık",
                                        "icon": "🫒"
                                },
                                {
                                        "name": "Süzme Bal / Çilek Reçeli",
                                        "category": "Tatlı",
                                        "icon": "🍯"
                                },
                                {
                                        "name": "Sıcak Çay / Süt",
                                        "category": "İçecek",
                                        "icon": "☕"
                                },
                                {
                                        "name": "Çeyrek Ekmek & 500 ml Su",
                                        "category": "Temel",
                                        "icon": "🍞"
                                }
                        ]
                }
        }
},

    // Gençlik Sofrası Hizmet Noktaları
    genclikSofrasi: {
        // Birincil kaynak: ABB Sosyal Hizmetler resmi Gençlik Sofraları sayfası
        // (günün menüsü + haftalık menü burada yayınlanıyor)
        pageUrl: 'https://sosyalhizmetler.ankara.bel.tr/hizmetler/genclik-sofralari',
        // İkincil kaynak: eski menü formu (DataTables)
        menuUrl: 'https://forms.ankara.bel.tr/genclik-sofrasi-menu',
        hours: '17:00 - 20:00 (Hafta içi)',
        description: 'Ankara Büyükşehir Belediyesi tarafından üniversite öğrencilerine ücretsiz sıcak yemek hizmeti.',
        locations: [
            {
                name: 'Gazi Mahallesi Gençlik Sofrası',
                address: 'Emniyet Mah. Silahtar Cad. No:36, Yenimahalle',
                icon: '📍'
            },
            {
                name: 'Sıhhiye Gençlik Sofrası',
                address: 'Sıhhiye Çok Katlı Otopark, 1. kat',
                icon: '📍'
            },
            {
                name: '100. Yıl Gençlik Sofrası',
                address: 'İzmir 2 Cad., Kızılay',
                icon: '📍'
            },
            {
                name: 'Anıttepe Gençlik Sofrası',
                address: 'Anıttepe Mah. Kubilay Sk. No:2',
                icon: '📍'
            }
        ]
    },

    // Millet Kütüphanesi Bilgisi
    milletKutuphanesi: {
        title: 'Cumhurbaşkanlığı Millet Kütüphanesi',
        subtitle: 'Zemin Kat Restoran',
        services: [
            {
                name: 'Sıcak İçecek İkramı',
                schedule: 'Her gün — 7/24',
                hours: '24 saat',
                icon: '☕',
                description: 'Çay, kahve, sıcak içecek ve su kesintisiz olarak ücretsiz sunulmaktadır.'
            },
            {
                name: 'Çorba İkramı',
                schedule: 'Hafta içi ve hafta sonu',
                hours: '12:00 - 14:00 / 18:00 - 20:00',
                icon: '🍲',
                description: 'Ücretsiz çorba ikramı yapılmaktadır.'
            },
            {
                name: 'Kek İkramı',
                schedule: 'Her gün',
                hours: '24:00 - 08:00',
                icon: '🍰',
                description: 'Gece saatlerinde ücretsiz kek ikramı yapılmaktadır.'
            }
        ]
    }
};
