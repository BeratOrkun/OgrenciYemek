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

    // Ankara KYK Yurtları
    kykDorms: [
        'Emine Şerife Hanım KYK Kız Öğrenci Yurdu',
        'GSB Başkent Yurtları',
        'Beştepe Yurdu',
        'Cebeci Site Öğrenci Yurdu',
        'Gölbaşı Şehit Özel Harekatçılar KYK Kız Öğrenci Yurdu',
        'Gölbaşı Öğrenci Yurdu',
        'Mogan Öğrenci Yurdu',
        'Yunus Emre Yurdu',
        'Taceddin Veli Yurdu',
        'Hüseyin Gazi Yurdu',
        'Ulus Yurdu',
        'Dışkapı Yurdu',
        'Tahsin Banguoğlu Yurdu',
        'Mahmut Nedim Zapçı Yurdu',
        'Osman Tan Yurdu',
        'Hacı Bayram Veli Yurdu',
        'Alev Alatlı Yurdu',
        'Fatma Hanım Yurdu',
        'Hafız Mustafa Sümer Yurdu',
        'Mehmet Akif Yurdu',
        'Gazi Yurdu',
        'Hacı Ömer Sabancı Yurdu',
        'Zübeyde Hanım Yurdu',
        'Yenimahalle Yurdu',
        'Beşevler Yurdu',
        'GSB Anadolu Yurdu',
        'Batıkent Ergazi Yurdu',
        'Milli İrade Yurdu',
        'Ankara Keçiören Yurdu',
        'Saime Kadın Yurdu',
        'Bağlıca Yurdu',
        'Etimesgut Eryaman Yurdu',
        'Ayaş Yurdu',
        'Beypazarı Yurdu',
        'Polatlı Yurdu',
        'Şereflikoçhisar Yurdu',
        'Nallıhan Yurdu',
        'Haymana Yurdu',
        'Kızılcahamam Yurdu'
    ],

    // Gençlik Sofrası Hizmet Noktaları
    genclikSofrasi: {
        menuUrl: 'https://forms.ankara.bel.tr/genclik-sofrasi-menu',
        hours: '18:00 - 20:00 (Hafta içi)',
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
    },

    // Çankaya Belediyesi
    cankayaBelediyesi: {
        menuUrl: 'https://www.cankaya.bel.tr/sayfalar/menulerimiz',
        title: 'Çankaya Belediyesi Yemek Menüleri',
        description: 'Çankaya Belediyesi\'nin güncel yemek menülerine ulaşmak için aşağıdaki butona tıklayın.'
    }
};
