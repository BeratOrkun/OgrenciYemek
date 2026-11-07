<?php
// Gecici PHP yoklama dosyasi - dogrulandiktan sonra silinecek
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$dataDir = dirname(__DIR__) . '/oy-data';
echo json_encode([
    'php'        => PHP_VERSION,
    'yazilabilir'=> is_writable(dirname(__DIR__)) ? 'ust dizin yazilabilir' : 'ust dizin YAZILAMAZ',
    'yerel_yaz'  => is_writable(__DIR__) ? 'public_html yazilabilir' : 'public_html YAZILAMAZ',
    'ustDizin'   => dirname(__DIR__),
    'zaman'      => date('c'),
], JSON_UNESCAPED_SLASHES);
