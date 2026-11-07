<?php
/**
 * ÖğrenciYemek — kendi sunucumuzda basit sayaç
 *
 * Dış servis yok, kayıt yok, çerez yok, sınır yok.
 * SADECE sayı tutar: IP, tarayıcı, konum veya başka kişisel veri
 * kaydedilmez. Bu yüzden çerez onayı da gerekmez.
 *
 * Veri public_html DIŞINA yazılır: web'den okunamaz ve GitHub
 * dağıtımları üzerine yazmaz.
 */

declare(strict_types=1);

// Yalnızca bilinen olaylar sayılır (rastgele girdiyle dosya açılmasın)
const GECERLI_OLAYLAR = ['view', 'app', 'install'];

// Önbelleğe alınmasın: CDN ya da service worker araya girerse
// istekler sunucuya ulaşmaz ve sayım eksik kalır.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: image/gif');
header('Content-Length: 43');

// Yanıt her durumda 1x1 şeffaf GIF — <img> ile de çağrılabilsin
$gif = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

$olay = isset($_GET['e']) && is_string($_GET['e']) ? $_GET['e'] : '';
$tekil = isset($_GET['u']) && $_GET['u'] === '1';

if (!in_array($olay, GECERLI_OLAYLAR, true)) {
    echo $gif;
    exit;
}

$dizin = dirname(__DIR__) . '/oy-stats';
if (!is_dir($dizin)) {
    @mkdir($dizin, 0775, true);
}
$dosya = $dizin . '/stats.json';

$fp = @fopen($dosya, 'c+');
if ($fp === false) {
    // Yazamıyorsak sessizce çık — sayaç asla siteyi bozmamalı
    echo $gif;
    exit;
}

if (flock($fp, LOCK_EX)) {
    $ham = stream_get_contents($fp);
    $veri = json_decode($ham !== false && $ham !== '' ? $ham : '{}', true);
    if (!is_array($veri)) {
        $veri = [];
    }

    $gun = gmdate('Y-m-d');
    if (!isset($veri[$gun]) || !is_array($veri[$gun])) {
        $veri[$gun] = [];
    }
    $veri[$gun][$olay] = (int)($veri[$gun][$olay] ?? 0) + 1;
    if ($tekil) {
        $veri[$gun]['uniq'] = (int)($veri[$gun]['uniq'] ?? 0) + 1;
    }

    // Dosya sonsuza kadar büyümesin: son 400 gün yeter
    ksort($veri);
    if (count($veri) > 400) {
        $veri = array_slice($veri, -400, null, true);
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($veri, JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
}
fclose($fp);

echo $gif;
