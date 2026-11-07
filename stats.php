<?php
/**
 * ÖğrenciYemek — sayaç panosu
 *
 * NOT: Depo herkese açık olduğu için koda şifre gömülemez
 * (gömseydim GitHub'da görünürdü). Bu sayfa şu an herkese açık;
 * yalnızca toplam sayılar var, kişisel veri yok.
 *
 * Şifrelemek istersen: hPanel > Dosya Yöneticisi ile public_html
 * içine .htpasswd oluşturup .htaccess'e koruma satırı eklemen yeterli.
 */

declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$dosya = dirname(__DIR__) . '/oy-stats/stats.json';
$veri = [];
if (is_readable($dosya)) {
    $ham = file_get_contents($dosya);
    $cozulen = json_decode($ham !== false ? $ham : '{}', true);
    if (is_array($cozulen)) {
        $veri = $cozulen;
    }
}
krsort($veri);

$toplam = ['view' => 0, 'uniq' => 0, 'app' => 0, 'install' => 0];
foreach ($veri as $gun) {
    foreach (array_keys($toplam) as $k) {
        $toplam[$k] += (int)($gun[$k] ?? 0);
    }
}

function s(int $n): string { return number_format($n, 0, ',', '.'); }
?>
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>ÖğrenciYemek — İstatistik</title>
<style>
    :root {
        --bg: #0e0b1d; --card: rgba(255,255,255,.05); --line: rgba(255,255,255,.09);
        --text: #f1f1f5; --muted: #9ca3af; --orange: #f97316;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        background: linear-gradient(170deg,#1a1333,#0d0a1c 50%,#07060e);
        background-attachment: fixed; min-height: 100vh;
        color: var(--text); font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 24px 16px 48px;
    }
    .wrap { max-width: 720px; margin: 0 auto; }
    h1 { font-size: 1.3rem; margin-bottom: 4px; }
    .sub { color: var(--muted); font-size: .82rem; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 10px; margin-bottom: 28px; }
    .kpi { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
    .kpi b { display: block; font-size: 1.7rem; font-weight: 800; letter-spacing: -.5px; }
    .kpi span { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; }
    .kpi.accent b { color: var(--orange); }
    table { width: 100%; border-collapse: collapse; background: var(--card);
            border: 1px solid var(--line); border-radius: 14px; overflow: hidden; font-size: .88rem; }
    th, td { padding: 10px 12px; text-align: right; border-bottom: 1px solid var(--line); }
    th:first-child, td:first-child { text-align: left; }
    th { font-size: .7rem; text-transform: uppercase; letter-spacing: .8px; color: var(--muted); font-weight: 700; }
    tr:last-child td { border-bottom: none; }
    .bos { color: var(--muted); padding: 28px 0; text-align: center; }
    .not { margin-top: 20px; font-size: .75rem; color: var(--muted); line-height: 1.6; }
</style>
</head>
<body>
<div class="wrap">
    <h1>ÖğrenciYemek — İstatistik</h1>
    <p class="sub">Kendi sunucunda tutuluyor · kişisel veri kaydedilmez</p>

    <div class="grid">
        <div class="kpi"><b><?= s($toplam['uniq']) ?></b><span>Ziyaretçi</span></div>
        <div class="kpi"><b><?= s($toplam['view']) ?></b><span>Açılış</span></div>
        <div class="kpi accent"><b><?= s($toplam['app']) ?></b><span>Uygulamadan</span></div>
        <div class="kpi accent"><b><?= s($toplam['install']) ?></b><span>Kurulum</span></div>
    </div>

    <?php if (!$veri): ?>
        <p class="bos">Henüz veri yok. Siteyi bir kez ziyaret et, sonra burayı yenile.</p>
    <?php else: ?>
    <table>
        <tr><th>Gün</th><th>Ziyaretçi</th><th>Açılış</th><th>Uygulamadan</th><th>Kurulum</th></tr>
        <?php foreach (array_slice($veri, 0, 60, true) as $gun => $d): ?>
        <tr>
            <td><?= htmlspecialchars($gun, ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= s((int)($d['uniq'] ?? 0)) ?></td>
            <td><?= s((int)($d['view'] ?? 0)) ?></td>
            <td><?= s((int)($d['app'] ?? 0)) ?></td>
            <td><?= s((int)($d['install'] ?? 0)) ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
    <?php endif; ?>

    <p class="not">
        <strong>Ziyaretçi:</strong> aynı cihazdan günde bir kez sayılır.
        <strong>Açılış:</strong> her sayfa açılışı.
        <strong>Uygulamadan:</strong> ana ekrana kurulmuş uygulamadan açılanlar.
        <strong>Kurulum:</strong> "Yükle" ile kurulanlar (iOS bu olayı bildirmez, orada görünmez).
        Çevrimdışı açılışlar sunucuya ulaşmadığı için sayılmaz.
    </p>
</div>
</body>
</html>
