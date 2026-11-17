// =====================================================
// ÖğrenciYemek - Veri Dosyası
// Ankara üniversiteleri, KYK yurtları, Gençlik Sofrası
// =====================================================

var APP_DATA = window.APP_DATA = {
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
            // Menü uygulama içinde gösterilir (js/gazi.js — Google Sheet'ten canlı)
            inApp: 'gazi',
            accessChannel: '✅ Açık Menü',
            note: 'Günlük öğle menüsü uygulamada: çorba, ana yemek, etsiz alternatif ve kalori.',
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
        // Yurt ücreti ve güvence bedeli alınmadan (ücretsiz) barınan öğrenciler
        freeHousingSubsidy: '340 ₺',
        description: 'T.C. Gençlik ve Spor Bakanlığı Kredi ve Yurtlar Genel Müdürlüğü yemek hizmeti.'
    },

    // "Şu an açık" kartı için saat aralıkları (24 saat, "SS:DD").
    // weekdaysOnly: true → yalnızca Pazartesi–Cuma.
    openHours: {
        kykBreakfast: { start: '06:30', end: '12:00', weekdaysOnly: false },
        kykDinner:    { start: '16:00', end: '22:30', weekdaysOnly: false },
        university:   { start: '11:00', end: '13:30', weekdaysOnly: true },
        genclik:      { start: '17:00', end: '20:00', weekdaysOnly: true },
        cankayaGenclik: { start: '17:30', end: '19:00', weekdaysOnly: true },
        cankayaKent:    { start: '11:00', end: '16:00', weekdaysOnly: true },
        etimesgutKent:  { start: '12:00', end: '14:00', weekdaysOnly: true }
    },

    // Yedek menü YALNIZCA bu şehir ve bu ay için geçerlidir; başka şehir
    // veya ayda asla gösterilmez (yanlış menü göstermemek için).
    kykMenuBackupCity: 'ankara',
    kykMenuBackupPeriod: '2026-11',

    // Çevrimdışı yedek KYK menüsü — YALNIZCA Ankara, Kasım 2026.
    // Kaynak: kyk-yemek-api arşivi (data/kyk_menus.json → by_date[*].ankara).
    // Biçim canlı API ile aynıdır; Screens._parseOurApiMenu ile işlenir.
    // Arayüzde her zaman "Tahmini Menü" etiketiyle gösterilir.
    kykMenuBackup: {
        "11-01": {"breakfast": {"items": ["Peynirli Omlet", "Domates Soslu Biber Kızartma", "Sade Poğaça", "Labne Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Tarhana Çorba", "Yayla Çorbası", "Köri Soslu Tavuk +Elma Dilim Patates", "Kaşarlı Karnabahar Graten", "Köri Soslu Tavuk", "+Elma Dilim Patates", "Tereyağlı Makarna", "Yeşil Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 790}},
        "11-02": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Kızartması", "Zeytinli", "Peynirli Açma", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 965}, "dinner": {"items": ["Domates Çorba", "Etli Düğün Çorbası", "Etsiz Nohut Yemeği", "İmam Bayıldı", "Tereyağlı Pirinç Pilavı", "Baklava-kadayıf(Cevizli)", "500 ml Su", "Çeyrek Ekmek"], "calories": 1050}},
        "11-03": {"breakfast": {"items": ["Kaşarlı Omlet", "Patates Kroket", "Dere Otlu Poğaça", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 796}, "dinner": {"items": ["Şehriye Çorbası", "Kremalı Mantar Çorba", "Fırın Tavuk But +Köz Domates, Biber, Soğan", "Mevsim Türlü", "Fırın Tavuk But", "+Köz Domates, Biber, Soğan", "Salçalı Bulgur Pilavı", "Havuç Tarator", "500 ml Su", "Çeyrek Ekmek"], "calories": 685}},
        "11-04": {"breakfast": {"items": ["Haşlanmış Yumurta", "Sosis Kızartması", "Peynirli", "Ispanaklı Börek", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 884}, "dinner": {"items": ["Ezogelin Çorba", "Yoğurtlu Yarma Çorba", "İzmir Köfte", "Tavuk Sote +Küp Patates", "Ispanak Kavurma +Yoğurt", "Tavuk Sote", "+Küp Patates", "Ispanak Kavurma", "+Yoğurt", "Fırın Makarna", "Muzlu Magnolya", "500 ml Su", "Çeyrek Ekmek"], "calories": 1028}},
        "11-05": {"breakfast": {"items": ["Sucuklu Omlet", "Karışık Kızartma", "Simit", "Krem Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Mercimek Çorbası", "Köz Biber Çorba", "Balık Çeşitleri +Fırın Sebze", "Tavuk Külbastı +Fırın Sebze", "Karışık Dolma +Yoğurt", "Balık Çeşitleri", "+Fırın Sebze", "Tavuk Külbastı", "Karışık Dolma", "+Yoğurt", "İrmik Helvası", "Mevsim Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 790}},
        "11-06": {"breakfast": {"items": ["Haşlanmış Yumurta", "Haşlanmış Patates+Domates+Salatalık", "Karışık Pizza", "Yöresel Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Tarhana Çorba", "Toyga Çorba", "Et Kavurma +Küp Patates", "Kuşbaşı Tavuk Tava", "Taze Fasulye Yemeği", "Et Kavurma", "+Küp Patates", "Şehriyeli Pirinç Pilavı", "Cacık", "500 ml Su", "Çeyrek Ekmek"], "calories": 817}},
        "11-07": {"breakfast": {"items": ["Menemen", "Salçalı Sosis", "Çikolatalı Milföy Börek", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 760}, "dinner": {"items": ["Ezogelin Çorba", "Kremalı Mısır Çorbası", "Kemikli Tavuk Pirzola +Patates Püresi", "Mücver +Yoğurt", "Kemikli Tavuk Pirzola", "+Patates Püresi", "Mücver", "+Yoğurt", "Spagetti Napoliten", "Bisküvili Pasta", "500 ml Su", "Çeyrek Ekmek"], "calories": 1035}},
        "11-08": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Kavurması", "Pankek+Sürülebilir Çikolata", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Domates Çorba", "Yayla Çorbası", "Izgara Köfte +Elma Dilim Patates", "Tavuk Graten", "Soslu Karışık Kızartma", "Izgara Köfte", "+Elma Dilim Patates", "Şehriyeli Bulgur Pilavı", "Pembe Sultan", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-09": {"breakfast": {"items": ["Sade Omlet", "Patates Kızartması", "Sade Poğaça", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Mercimek Çorbası", "Kremalı Havuç Çorba", "Ankara Tava", "Halep Dolma +Yoğurt", "Halep Dolma", "+Yoğurt", "Peynirli Tepsi Böreği", "Hoşaf-Komposto Çeşitleri", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-10": {"breakfast": {"items": ["Haşlanmış Yumurta", "Sebzeli Sucuk Sote(Domates, Biber)", "Pişi+Domates+Salatalık", "Yöresel Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Tarhana Çorba", "Terbiyeli Anadolu Çorba", "Tavuk Şinitzel +Soğan Halkası+Patates Kızartması", "Mantar Sote", "Tavuk Şinitzel", "+Soğan Halkası+Patates Kızartması", "Penne Napoliten", "Rus Salatası", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-11": {"breakfast": {"items": ["Peynirli Omlet", "Patates Mücveri", "Zeytinli", "Peynirli Açma", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Şehriye Çorbası", "Etli Düğün Çorbası", "Etsiz Kuru Fasulye", "Karnabahar Pane", "Tereyağlı Pirinç Pilavı", "Yoğurt", "Tahinli Kemalpaşa", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-12": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Kızartması", "Peynirli Dereotlu, Maydanozlu Kaşık Dökmesi", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Mercimek Çorbası", "Dereotlu Kabak Çorba", "Tavuk Şiş +Köz Domates, Biber, Soğan", "Bezelye Yemeği", "Tavuk Şiş", "+Köz Domates, Biber, Soğan", "Sebzeli Bulgur Pilavı", "Çoban Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-13": {"breakfast": {"items": ["Menemen", "Patates Salatası", "Simit", "Labne Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 734}, "dinner": {"items": ["Domates Çorba", "Tutmaç Çorba", "Hamburger (80-100 Gr Hamburger Ekmeği İçerisinde Domates, Marul, Kornişon Turşu İle)", "Kaşarlı Ispanak Graten", "Hamburger", "(80-100 Gr Hamburger Ekmeği İçerisinde Domates, Marul, Kornişon Turşu İle)", "Patates Kızartması", "Ayran", "Meyve Suyu", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-14": {"breakfast": {"items": ["Haşlanmış Yumurta", "Karışık Kızartma", "Peynirli Milföy Böreği", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Tarhana Çorba", "Kremalı Mantar Çorba", "Haşlanmış Tavuk Fileto (Didilmiş)+Mor Lahana, Havuç, Turşu", "Patlıcan Yemeği", "Haşlanmış Tavuk Fileto", "(Didilmiş)+Mor Lahana, Havuç, Turşu", "Tereyağlı Nohutlu Pirinç Pilavı", "Supangle", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-15": {"breakfast": {"items": ["Sucuklu Omlet", "Patates Kroket", "Dere Otlu Poğaça", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 751}, "dinner": {"items": ["Mercimek Çorbası", "Terbiyeli Şehriye Çorba", "Püreli Etli Kebap", "Püreli Tavuk Kebap", "Taze Fasulye Yemeği", "Tereyağlı Bulgur Pilavı", "Ezme", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-16": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Kızartması", "Sade Poğaça", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Domates Çorba", "Kremalı Mısır Çorbası", "Tavuk Fajita +Lavaş", "Kabak Kalye +Yoğurt", "Tavuk Fajita", "+Lavaş", "Kabak Kalye", "+Yoğurt", "Spagetti Napoliten", "Çoban Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-17": {"breakfast": {"items": ["Peynirli Omlet", "Elmalı Kurabiye", "Tart", "Simit", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Tarhana Çorba", "Köz Biber Çorba", "Karnıyarık", "Etsiz Barbunya Yemeği", "Tereyağlı Şehriyeli Pirinç Pilavı", "Cacık", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-18": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Kavurması", "Karışık Pizza", "Krem Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 600}, "dinner": {"items": ["Mercimek Çorbası", "Kremalı Havuç Çorba", "Çıtır Tavuk +Patates Kızartması", "Karışık Dolma", "Çıtır Tavuk", "+Patates Kızartması", "Yoğurtlu Soslu Mantı", "Cevizli Tahinli Kabak Tatlısı", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-19": {"breakfast": {"items": ["Sade Omlet", "Sosis Kızartması+Domates+Salatalık", "Pankek+Reçel", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Şehriye Çorbası", "Kremalı Mantar Çorba", "Soslu Pideli Köfte", "Mevsim Türlü", "Tereyağlı Bulgur Pilavı", "Ayran", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-20": {"breakfast": {"items": ["Haşlanmış Yumurta", "Karışık Kızartma", "Zeytinli", "Peynirli Açma", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Salçalı Tavuk Çorba", "Kremalı Sebze Çorbası", "Etsiz Nohut Tava", "Karnabahar Pane +Yoğurt", "Karnabahar Pane", "+Yoğurt", "Tereyağlı Pirinç Pilavı", "Baklava-kadayıf(Cevizli)", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-21": {"breakfast": {"items": ["Kaşarlı Omlet", "Patates Salatası", "Çikolatalı Milföy Börek", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 899}, "dinner": {"items": ["Ezogelin Çorba", "Yoğurtlu Yarma Çorba", "Tavuk Külbastı +Sebze Sote", "Pırasa Yemeği", "Tavuk Külbastı", "+Sebze Sote", "Salçalı Makarna", "Yoğurtlu Köz Biberli Mısırlı Meze", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-22": {"breakfast": {"items": ["Haşlanmış Yumurta", "Sebzeli Sucuk Sote(Domates, Biber)", "Peynirli", "Ispanaklı Börek", "Yöresel Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Domates Çorba", "Tutmaç Çorba", "Et Tantuni +Lavaş+Sumaklı Soğan Salatası", "Tavuk Tantuni +Lavaş+Sumaklı Soğan Salatası", "Patates Yemeği", "Et Tantuni", "+Lavaş+Sumaklı Soğan Salatası", "Tavuk Tantuni", "Salçalı Bulgur Pilavı", "Yeşil Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-23": {"breakfast": {"items": ["Peynirli Omlet", "Patates Kızartması", "Dere Otlu Poğaça", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 1010}, "dinner": {"items": ["Mercimek Çorbası", "Dereotlu Kabak Çorba", "Tavuk But +Fırın Sebze(Havuç+Karnabahar+Brokoli)", "Taze Fasulye Yemeği", "Tavuk But", "+Fırın Sebze(Havuç+Karnabahar+Brokoli)", "Tereyağlı Mısırlı Pirinç Pilavı", "Çoban Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-24": {"breakfast": {"items": ["Haşlanmış Yumurta", "Salçalı Sosis", "Simit", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 775}, "dinner": {"items": ["Tarhana Çorba", "Köz Biber Çorba", "Kadınbudu Köfte +Patates Püresi", "Ispanak Kavurma +Yoğurt", "Kadınbudu Köfte", "+Patates Püresi", "Ispanak Kavurma", "+Yoğurt", "Spagetti Napoliten", "Mandalina", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-25": {"breakfast": {"items": ["Sucuklu Omlet", "Pişi+Domates+Salatalık", "Mozaik Kek", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Şehriye Çorbası", "Kremalı Mantar Çorba", "Etli Çökertme Kebabı", "Tavuk Çökertme Kebabı", "Patates Köftesi +Yoğurt", "Patates Köftesi", "+Yoğurt", "Sebzeli Bulgur Pilavı", "Babagannuş", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-26": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Kavurması", "Zeytinli", "Peynirli Açma", "Yöresel Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 781}, "dinner": {"items": ["Ezogelin Çorba", "Toyga Çorba", "Soya Soslu Tavuk +Küp Patates", "Kaşarlı Sebze Graten", "Soya Soslu Tavuk", "+Küp Patates", "Domatesli Fesleğenli Makarna", "Mevsim Salata", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-27": {"breakfast": {"items": ["Sade Omlet", "Patates Kroket", "Pankek+Bal", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Domates Çorba", "Etli Düğün Çorbası", "Etsiz Kuru Fasulye", "Soslu Karışık Kızartma", "Tereyağlı Şehriyeli Pirinç Pilavı", "Havuç Tarator", "Trileçe", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-28": {"breakfast": {"items": ["Haşlanmış Yumurta+Domates+Salatalık", "Patates Kızartması", "Peynirli", "Ispanaklı Börek", "Labne Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Mercimek Çorbası", "Kremalı Havuç Çorba", "Tas Kebabı", "Kuşbaşı Tavuk Tava", "Mantar Sote", "Arpa Şehriye Pilavı", "Yoğurt", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-29": {"breakfast": {"items": ["Menemen", "Mücver", "Sosisli Milföy Börek", "Beyaz Peynir", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Tarhana Çorba", "Köz Biber Çorba", "Çıtır Tavuk Burger (80-100 Gr Hamburger Ekmeği İçerisinde Domates, Marul, Kornişon Turşu İle)", "Halep Dolma +Yoğurt", "Çıtır Tavuk Burger", "(80-100 Gr Hamburger Ekmeği İçerisinde Domates, Marul, Kornişon Turşu İle)", "Halep Dolma", "+Yoğurt", "Patates Kızartması", "Ayran", "Meyve Suyu", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}},
        "11-30": {"breakfast": {"items": ["Haşlanmış Yumurta", "Patates Salatası", "Sade Poğaça", "Kaşar Peyniri", "Siyah", "Yeşil Zeytin", "500 ml Su", "Çeyrek Ekmek"], "calories": 850}, "dinner": {"items": ["Şehriye Çorbası", "Tutmaç Çorba", "Kaşarlı Izgara Köfte +Köz Domates, Biber, Soğan", "Tavuk Izgara +Köz Domates, Biber, Soğan", "Bamya Yemeği", "Kaşarlı Izgara Köfte", "+Köz Domates, Biber, Soğan", "Tavuk Izgara", "Tereyağlı Garnitürlü Pirinç Pilavı", "Portakallı Revani", "500 ml Su", "Çeyrek Ekmek"], "calories": 1500}}
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
                shortName: 'Çay & kahve',
                windows: [{ start: '00:00', end: '24:00' }],
                icon: '☕',
                description: 'Çay, kahve, sıcak içecek ve su kesintisiz olarak ücretsiz sunulmaktadır.'
            },
            {
                name: 'Çorba İkramı',
                schedule: 'Hafta içi ve hafta sonu',
                hours: '12:00 - 14:00 / 18:00 - 20:00',
                shortName: 'Çorba',
                windows: [{ start: '12:00', end: '14:00' }, { start: '18:00', end: '20:00' }],
                icon: '🍲',
                description: 'Ücretsiz çorba ikramı yapılmaktadır.'
            },
            {
                name: 'Kek İkramı',
                schedule: 'Her gün',
                hours: '24:00 - 08:00',
                shortName: 'Kek',
                windows: [{ start: '00:00', end: '08:00' }],
                icon: '🍰',
                description: 'Gece saatlerinde ücretsiz kek ikramı yapılmaktadır.'
            }
        ]
    },

    // Çankaya Belediyesi — Gençlik Sofrası (2026-2027 dönemi, 11 Kasım 2026'da başladı)
    // Kaynaklar: Yeni Ankara (11 ve 16 Kasım 2026), Manşet Ankara (11 Kasım 2026)
    cankayaGenclikSofrasi: {
        title: 'Çankaya Gençlik Sofrası',
        analyticsKey: 'cankaya-genclik-sofrasi',
        subtitle: 'Çankaya Belediyesi',
        hours: '17:30 - 19:00',
        days: 'Hafta içi her gün',
        price: 'Ücretsiz',
        description: "Ankara'da okuyan üniversite öğrencilerine ücretsiz sıcak akşam yemeği (4 çeşit).",
        eligibility: 'Öğrenci kimliğini göstermen yeterli; ayrıca başvuru gerekmiyor.',
        // Belediye menüleri haftalık GÖRSEL olarak yayınlıyor (metin değil); otomatik
        // çekilemez. Güncel menü için her zaman bu sayfaya yönlendirilir.
        menuUrl: 'https://www.cankaya.bel.tr/sayfalar/menulerimiz',
        locations: [
            {
                name: 'Çankaya Belediye Başkanlığı Yemekhanesi',
                address: 'Ziya Gökalp Cad. No:11, Kat:3, Kızılay',
                mapQuery: 'Çankaya Belediyesi Ziya Gökalp Caddesi No:11 Kızılay Ankara'
            },
            {
                name: '100. Yıl Çankaya Evi Yemekhanesi',
                address: 'İşçi Blokları Mah. 1534. Cad. No:3/1',
                mapQuery: '100. Yıl Çankaya Evi İşçi Blokları Mahallesi 1534. Cadde No:3/1 Çankaya Ankara'
            }
        ],
        // Haftalık menü — ELLE girildi (belediye görselinden), kendiliğinden
        // GÜNCELLENMEZ. Yalnızca tarihi bugüne eşit gün gösterilir; hafta geçince
        // gizlenir ve kullanıcı menuUrl'deki güncel menüye yönlendirilir.
        // Yeni haftanın menüsü eklenmek istenirse buraya tarihli satır eklenir.
        weeklyMenu: [
            { date: '2026-11-16', items: ['Tarhana Çorbası', 'Karnıyarık', 'Pirinç Pilavı', 'Puding'] },
            { date: '2026-11-17', items: ['Kırmızı Mercimek Çorbası', 'Fırın Tavuk', 'Erişte', 'Meyve'] },
            { date: '2026-11-18', items: ['Domates Çorbası', 'Etli Patates', 'Bulgur Pilavı', 'Fırın Sütlaç'] },
            { date: '2026-11-19', items: ['Yayla Çorbası', 'Izgara Tavuk', 'Spagetti Bolonez', 'Çoban Salata'] },
            { date: '2026-11-20', items: ['Mantar Çorbası', 'Izgara Köfte', 'Peynirli Tepsi Böreği', 'Meyve'] }
        ]
    },

    // Çankaya Belediyesi — Kent Lokantaları
    // Kaynak: cankaya.bel.tr/hizmetler/kent-lokantalari (115 TL, hafta içi 11.00-16.00;
    // saatler 2 Kasım 2026'dan itibaren geçerli)
    cankayaKentLokantasi: {
        title: 'Çankaya Kent Lokantası',
        analyticsKey: 'cankaya-kent-lokantasi',
        subtitle: 'Çankaya Belediyesi',
        hours: '11:00 - 16:00',
        days: 'Hafta içi her gün',
        price: '115 ₺',
        description: 'Dört çeşit sıcak yemek uygun fiyata; su ve ekmek ücretsiz.',
        menuUrl: 'https://www.cankaya.bel.tr/sayfalar/menulerimiz',
        locations: [
            {
                name: 'Cebeci Kent Lokantası',
                address: 'Fakülteler Mah. Seyhan Sk. No:6/B',
                mapQuery: 'Cebeci Kent Lokantası Fakülteler Mahallesi Seyhan Sokak No:6/B Çankaya Ankara'
            },
            {
                name: 'Sokullu Kent Lokantası',
                address: 'Harbiye Mah. Sokullu Mehmet Paşa Cad. No:73/A',
                mapQuery: 'Sokullu Kent Lokantası Sokullu Mehmet Paşa Caddesi No:73/A Çankaya Ankara'
            },
            {
                name: 'Seyranbağları Kent Lokantası',
                address: 'Mimar Sinan Mah. 115. Cad. No:34/A',
                mapQuery: 'Seyranbağları Kent Lokantası Mimar Sinan Mahallesi 115. Cadde No:34 Çankaya Ankara'
            }
        ]
    },

    // Etimesgut Belediyesi — Ahi-Kent Lokantası
    // Kaynak: etimesgut.bel.tr/ahi-kent-lokantasi (sıcak yemek hafta içi 12.00-14.00,
    // 80 TL; çay-simit vb. hafta sonu dahil 09.00-18.00). Günün menüsü o sayfada
    // görsel olarak yayınlandığı için kart doğrudan bu sayfayı açar.
    etimesgutKentLokantasi: {
        title: 'Etimesgut Kent Lokantası',
        officialName: 'Ahi-Kent Lokantası',
        hours: '12:00 - 14:00',
        price: '80 ₺',
        pageUrl: 'https://www.etimesgut.bel.tr/ahi-kent-lokantasi'
    }
};
