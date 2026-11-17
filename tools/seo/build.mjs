// =====================================================
// ÖğrenciYemek — SEO sayfaları üreticisi
//
// Arama motorlarının okuyabileceği, menüleri HTML içine "pişirilmiş" statik
// sayfalar üretir (JS gerekmez). GitHub Actions bunu günde birkaç kez çalıştırır;
// Hostinger GitHub'dan otomatik yayınladığı için sayfalar hep günceldir.
//
//   node tools/seo/build.mjs
//
// Kaynaklar:
//   • js/data.js (saatler, fiyatlar, adresler — uygulamayla tek kaynak)
//   • KYK: github.com/BeratOrkun/kyk-yemek-api (81 il)
//   • Gazi / Hacettepe / Ankü: beratorkun.github.io/uniyemekscrapper
//   • ABB Gençlik Sofrası: menü tarayıcıda yüklenir (ABB sunuculara 403 veriyor)
//
// Önlem: bir kaynağa ulaşılamazsa o kaynağa bağlı sayfalar YAZILMAZ (eski hali
// korunur). İçerik değişmediyse dosyaya dokunulmaz (gereksiz commit olmaz).
// =====================================================
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {
  SITE, fetchJson, esc, clean, niceCase,
  istanbulNow, addDays, weekday, trDate, mondayOf, renderPage, DAYS, MONTHS,
} from "./lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = path.join(ROOT, "tools", "seo", "manifest.json");
const KYK_API = "https://raw.githubusercontent.com/BeratOrkun/kyk-yemek-api/main/data";
const UNI_API = "https://beratorkun.github.io/uniyemekscrapper/data";

const { iso: TODAY } = istanbulNow();
const MONTH_LABEL = `${MONTHS[Number(TODAY.slice(5, 7)) - 1]} ${TODAY.slice(0, 4)}`; // "Kasım 2026"
const log = (...a) => console.log(...a);
const warn = (m) => console.warn(`::warning::${m}`);

/* ================================ Veri ================================ */

async function loadAppData() {
  const code = await readFile(path.join(ROOT, "js", "data.js"), "utf8");
  const ctx = { window: {} };
  vm.runInNewContext(code, ctx, { timeout: 2000 });
  if (!ctx.window.APP_DATA) throw new Error("js/data.js içinden APP_DATA okunamadı");
  return ctx.window.APP_DATA;
}

async function safe(label, fn) {
  try {
    return await fn();
  } catch (e) {
    warn(`${label} alınamadı: ${e.message}`);
    return null;
  }
}

// KYK: kaynak bazen birleşik yemeği parçalarıyla tekrar yazar ("Tavuk +Lavaş", "Tavuk", "+Lavaş")
function cleanKykItems(items) {
  const raw = (Array.isArray(items) ? items : []).map((n) => clean(n)).filter(Boolean);
  // Kaynak "Siyah/Yeşil Zeytin"i "Siyah" + "Yeşil Zeytin" diye bölüyor: yeniden birleştir
  const names = [];
  for (let i = 0; i < raw.length; i++) {
    if (/^(siyah|yeşil)$/i.test(raw[i]) && /zeytin/i.test(raw[i + 1] || "")) {
      names.push(`${raw[i]} / ${raw[i + 1]}`);
      i++;
    } else names.push(raw[i]);
  }
  const seen = new Set();
  return names.filter((n) => {
    if (n.startsWith("+")) return false;
    if (names.some((o) => o !== n && o.startsWith(`${n} +`))) return false;
    const k = n.toLocaleLowerCase("tr");
    if (seen.has(k)) return false;
    seen.add(k);
    return n.length <= 120;
  }).map((n) => n.replace(/\s*\+\s*/g, " + "));
}

function kykMeal(m) {
  if (!m || !Array.isArray(m.items)) return null;
  const items = cleanKykItems(m.items);
  if (!items.length) return null;
  const kcal = Number(m.calories);
  return { items, kcal: Number.isFinite(kcal) && kcal > 0 && kcal < 6000 ? kcal : null };
}

/* ============================ Bileşenler ============================ */

const dishList = (names) => `<ul class="s-dishes">${names.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`;

function uniItems(items) {
  return `<ul class="s-dishes">${items
    .map((it) => {
      const label = it.category ? niceCase(it.category.replace(/^ANAYEMEK$/i, "ANA YEMEK")) : "";
      const meta = [label && label !== "Kahvaltı" ? label : "", it.kcal ? `${it.kcal} kcal` : ""].filter(Boolean).join(" · ");
      return `<li>${esc(it.name)}${meta ? `<small>${esc(meta)}</small>` : ""}</li>`;
    })
    .join("")}</ul>`;
}

const mealBlock = (title, time, kcal, inner) =>
  `<div class="s-meal"><h3>${esc(title)}${time ? ` <span class="s-time">${esc(time)}</span>` : ""}${kcal ? ` <span class="s-kcal">${kcal} kcal</span>` : ""}</h3>${inner}</div>`;

const note = (text, kind = "") => `<p class="s-note${kind ? " " + kind : ""}">${text}</p>`;

const infoGrid = (rows) =>
  `<dl class="s-info">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const hoursText = (h) => clean(String(h || "").replace(/\s*-\s*/, "–"));

// "17:00 - 20:00" → { opens: "17:00", closes: "20:00" }
function openClose(h) {
  const m = String(h || "").match(/(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})/);
  return m ? { opens: m[1].replace(".", ":").padStart(5, "0"), closes: m[2].replace(".", ":").padStart(5, "0") } : null;
}

function foodPlaceSchema({ name, address, query, hours, weekdaysOnly = true, free = false, price = null, url }) {
  const oc = openClose(hours);
  return {
    "@type": "FoodEstablishment",
    name,
    url,
    address: { "@type": "PostalAddress", streetAddress: address, addressLocality: "Ankara", addressCountry: "TR" },
    hasMap: mapsUrl(query || `${name} ${address} Ankara`),
    ...(oc ? {
      openingHoursSpecification: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: weekdaysOnly
          ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
          : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: oc.opens,
        closes: oc.closes,
      }],
    } : {}),
    ...(free ? { isAccessibleForFree: true } : {}),
    ...(price ? { priceRange: price } : {}),
    servesCuisine: "Türk mutfağı",
  };
}

const KYK_POPULAR = ["ankara", "istanbul", "izmir", "bursa", "konya", "sivas", "sakarya", "eskisehir", "erzurum", "kayseri", "samsun", "trabzon"];

/* ============================== Sayfalar ============================== */

function kykPages(D, today, archive) {
  // Şehir listesi: bugünün dosyası (81 il) + arşiv
  const cities = new Map();
  if (today?.menus) for (const [slug, c] of Object.entries(today.menus)) cities.set(slug, clean(c.city) || slug);
  for (const day of Object.values(archive?.by_date || {}))
    for (const [slug, c] of Object.entries(day)) if (!cities.has(slug)) cities.set(slug, clean(c.city) || slug);
  if (!cities.size) return [];

  const dayOf = (slug, iso) => {
    const src = iso === TODAY && today?.date === TODAY && today.menus?.[slug] ? today.menus[slug] : archive?.by_date?.[iso]?.[slug];
    if (!src) return null;
    const b = kykMeal(src.breakfast);
    const d = kykMeal(src.dinner);
    return b || d ? { b, d } : null;
  };

  const info = D.kykInfo;
  const bH = hoursText(info.breakfastHours);
  const dH = hoursText(info.dinnerHours);
  const sorted = [...cities.entries()].sort((a, b) => a[1].localeCompare(b[1], "tr"));
  const cityName = (slug) => cities.get(slug);

  const dayCard = (slug, iso, heading) => {
    const day = dayOf(slug, iso);
    if (!day) return `<section class="s-card"><h2>${esc(heading)}</h2>${note("Bu günün menüsü henüz yayımlanmadı. Yurt yönetiminin duyurularını takip edebilirsin.")}</section>`;
    return `<section class="s-card${iso === TODAY ? " s-today" : ""}"><h2>${esc(heading)}</h2>
${day.b ? mealBlock("🍳 KYK kahvaltı menüsü", bH, day.b.kcal, dishList(day.b.items)) : mealBlock("🍳 KYK kahvaltı menüsü", bH, null, note("Kahvaltı menüsü henüz yayımlanmadı."))}
${day.d ? mealBlock("🍲 KYK akşam yemeği menüsü", dH, day.d.kcal, dishList(day.d.items)) : mealBlock("🍲 KYK akşam yemeği menüsü", dH, null, note("Akşam menüsü henüz yayımlanmadı."))}
</section>`;
  };

  const yardim = `Kahvaltı ${esc(info.breakfastSubsidy)}, akşam yemeği ${esc(info.dinnerSubsidy)} (günlük toplam ${esc(info.totalSubsidy)}). Yurt ücreti ödemeden barınan öğrencilerde günlük ${esc(info.freeHousingSubsidy)}.`;
  const infoBox = infoGrid([
    ["Kahvaltı saati", esc(bH)],
    ["Akşam yemeği saati", esc(dH)],
    ["Öğle yemeği", "KYK yurtlarında öğle yemeği verilmez"],
    ["GSB beslenme yardımı", yardim],
  ]);

  const baseFaq = [
    { q: "KYK yurt yemek listesine (KYK menü) nereden bakılır?", a: "ÖğrenciYemek'te ilini seçerek bugünün, yarının ve ayın KYK kahvaltı ve akşam yemeği menüsüne bakabilirsin. KYK yemek listesi her gün güncellenir; aynı menü ÖğrenciYemek uygulamasında da yer alır." },
    { q: "KYK yemekhane saatleri nedir, kaçta açılıyor?", a: `KYK yemekhanelerinde kahvaltı ${bH}, akşam yemeği ${dH} saatleri arasında verilir. Saatler yurda göre küçük farklılık gösterebilir.` },
    { q: "KYK kahvaltısı saat kaçta başlıyor, kaça kadar?", a: `KYK yurtlarında kahvaltı genellikle ${bH} saatleri arasında verilir. Saatler yurda göre küçük farklılık gösterebilir.` },
    { q: "KYK akşam yemeği saat kaçta, kaça kadar?", a: `Akşam yemeği genellikle ${dH} saatleri arasında verilir.` },
    { q: "KYK yemekleri ücretli mi, paralı mı?", a: "Yurtta kalan öğrencilerin yemekleri GSB günlük beslenme yardımıyla karşılanır; yardım yemekhanede kartla/parmak iziyle kullanılır. Yardımı aşan alımlar öğrenciye aittir." },
    { q: "KYK yemek ücretleri 2026 (beslenme yardımı) ne kadar?", a: `2026-2027 döneminde günlük beslenme yardımı: ${clean(yardim)} Güncel tutar için yurt idaresine danışın.` },
    { q: "KYK yurtlarında öğle yemeği var mı?", a: "Hayır. KYK yurtlarında kahvaltı ve akşam yemeği verilir; öğle yemeği servisi yoktur." },
  ];

  const pages = [];

  // ---- 81 il ----
  for (const [slug, name] of sorted) {
    const todayDay = dayOf(slug, TODAY);
    const tomorrow = addDays(TODAY, 1);
    const upcoming = [];
    for (let i = 2; i <= 31; i++) {
      const iso = addDays(TODAY, i);
      if (iso.slice(0, 7) !== TODAY.slice(0, 7) && i > 7) break;
      const d = dayOf(slug, iso);
      if (d) upcoming.push([iso, d]);
    }
    const monthName = MONTHS[Number(TODAY.slice(5, 7)) - 1];
    const preview = todayDay?.d ? todayDay.d.items.slice(0, 3).join(", ") : todayDay?.b ? todayDay.b.items.slice(0, 3).join(", ") : "";

    const body = `
${dayCard(slug, TODAY, `${name} KYK menü bugün · ${trDate(TODAY)}`)}
${dayOf(slug, tomorrow) ? dayCard(slug, tomorrow, `${name} KYK menü yarın · ${trDate(tomorrow)}`) : ""}
${upcoming.length ? `<section class="s-sec"><h2>${esc(name)} KYK yemek listesi ${esc(MONTH_LABEL)} (aylık)</h2><div class="s-days">${upcoming
      .map(([iso, d]) => `<article class="s-day"><h3>${esc(trDate(iso, { year: false }))}</h3>${d.b ? `<p><b>Kahvaltı:</b> ${esc(d.b.items.join(", "))}</p>` : ""}${d.d ? `<p><b>Akşam:</b> ${esc(d.d.items.join(", "))}</p>` : ""}</article>`)
      .join("")}</div></section>` : ""}
<section class="s-sec"><h2>KYK yemekhane saatleri ve yemek ücretleri</h2>${infoBox}</section>
<section class="s-sec"><h2>Diğer illerin KYK yemek listesi</h2><ul class="s-chips">${KYK_POPULAR.filter((s) => s !== slug && cities.has(s))
      .map((s) => `<li><a href="/kyk-yemek-listesi/${s}/">${esc(cityName(s))}</a></li>`).join("")}<li><a href="/kyk-yemek-listesi/">Tüm iller</a></li></ul></section>`;

    pages.push({
      key: "kyk",
      path: `/kyk-yemek-listesi/${slug}/`,
      title: `${name} KYK Yemek Listesi ${MONTH_LABEL} – Bugünün KYK Menüsü`,
      description: preview
        ? `${name} KYK yemek ${trDate(TODAY, { day: false, year: false })}: ${preview}. ${name} KYK menü — kahvaltı, akşam yemeği ve yemek saatleri.`
        : `${name} KYK yemek listesi ve KYK menü: bugünün kahvaltı ve akşam yemeği, aylık liste ve yemek saatleri.`,
      h1: `${name} KYK Yemek Listesi ve KYK Menü`,
      lead: `${name} KYK yurt yemek listesi (KYK menü): ${name} KYK'da bugün ne yemek var? Günün kahvaltı ve akşam menüsü, yarının menüsü${upcoming.length ? `, ${MONTH_LABEL} aylık listesi` : ""}, KYK yemekhane saatleri ve yemek ücretleri aşağıda.`,
      crumbs: [{ name: "KYK yemek listesi", path: "/kyk-yemek-listesi/" }, { name, path: `/kyk-yemek-listesi/${slug}/` }],
      body,
      app: { screen: "kyk", ctaText: "KYK menüsünü uygulamada aç" },
      faq: [
        {
          q: `${name} KYK'da bugün ne yemek var?`,
          a: todayDay
            ? `${trDate(TODAY)}${todayDay.b ? ` kahvaltı: ${todayDay.b.items.join(", ")}.` : ""}${todayDay.d ? ` Akşam yemeği: ${todayDay.d.items.join(", ")}.` : ""}`
            : "Bugünün menüsü henüz yayımlanmadı; yayımlandığında bu sayfada görünür.",
        },
        ...baseFaq,
      ],
      related: [
        { href: "/kyk-yemek-listesi/", text: "KYK yemek listesi — tüm iller" },
        { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
        { href: "/ankara-universite-yemek-listeleri/", text: "Ankara üniversite yemek listeleri" },
      ],
    });
  }

  // ---- KYK ana sayfası (tüm iller) ----
  const hasAnkara = cities.has("ankara");
  pages.push({
    key: "kyk",
    path: "/kyk-yemek-listesi/",
    title: `KYK Yemek Listesi ve KYK Menü Bugün – ${MONTH_LABEL} (81 İl)`,
    description: `KYK yemek listesi ve KYK menü ${trDate(TODAY, { day: false, year: false })}: 81 il için bugünün kahvaltı ve akşam yemeği, KYK yemekhane saatleri ve 2026 yemek ücretleri.`,
    h1: "KYK Yemek Listesi ve KYK Menü — Bugün KYK'da Ne Var?",
    lead: `KYK yemek listesi (KYK menü) her gün güncel: KYK'da bugün ne yemek var? Türkiye'deki tüm KYK yurtlarının kahvaltı ve akşam yemeği menüsü, ${MONTH_LABEL} aylık yurt yemek listesi, KYK yemekhane saatleri ve yemek ücretleri. İlini seç.`,
    crumbs: [{ name: "KYK yemek listesi", path: "/kyk-yemek-listesi/" }],
    body: `
${hasAnkara ? dayCard("ankara", TODAY, `Ankara KYK yemek bugün · ${trDate(TODAY)}`) : ""}
<section class="s-sec"><h2>İl seç</h2><ul class="s-grid">${sorted
      .map(([s, n]) => `<li><a href="/kyk-yemek-listesi/${s}/">${esc(n)}</a></li>`).join("")}</ul></section>
<section class="s-sec"><h2>KYK yemekhane saatleri ve yemek ücretleri</h2>${infoBox}</section>`,
    app: { screen: "kyk", ctaText: "KYK menüsünü uygulamada aç" },
    faq: [
      { q: "KYK'da bugün ne yemek var?", a: "KYK menüsü ilden ile değişir. Bu sayfadan ilini seçerek bugünün kahvaltı ve akşam yemeği menüsünü görebilirsin; Ankara'nın bugünkü menüsü sayfanın başında yer alır." },
      ...baseFaq,
    ],
    related: [
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
      { href: "/gazi-universitesi-yemek-listesi/", text: "Gazi Üniversitesi yemek listesi" },
      { href: "/hacettepe-yemek-listesi/", text: "Hacettepe yemek listesi" },
    ],
  });

  return pages;
}

/* ---------------- Üniversiteler (uniyemekscrapper verisi) ---------------- */

function validDays(json) {
  const days = json?.days && typeof json.days === "object" ? json.days : {};
  return Object.fromEntries(Object.entries(days).filter(([iso, d]) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && d?.date === iso));
}

// Hafta sonuysa ve bugün menü yoksa: gelecek pazartesi
function targetDate(days) {
  if (days[TODAY]) return TODAY;
  const wd = weekday(TODAY);
  if (wd === 6) return addDays(TODAY, 2);
  if (wd === 0) return addDays(TODAY, 1);
  return TODAY;
}

function uniDayInner(day, mealKeys, { withTimes = true } = {}) {
  if (!day) return note("Bu günün menüsü henüz yayımlanmadı.");
  if (day.holiday) return note(`🎉 Resmi tatil — ${esc(/^\s*resmi\s+tatil\s*$/i.test(day.holiday.text || "") ? "yemekhane hizmet vermiyor." : day.holiday.text)}`, "s-holiday");
  if (day.invalid) return note("⚠️ Bu günün menüsü doğrulanamadı; resmi listeye bakın.", "s-warn");
  const LABEL = { sabah: "🍳 Kahvaltı", ogle: "🍽️ Öğle yemeği", aksam: "🌙 Akşam yemeği", vegan: "🥗 Vegan menü" };
  const blocks = mealKeys
    .filter((k) => day.meals?.[k]?.items?.length)
    .map((k) => {
      const m = day.meals[k];
      return mealBlock(LABEL[k], withTimes ? m.time : null, m.totalKcal, uniItems(m.items));
    });
  return blocks.length ? blocks.join("") : note("Bu günün menüsü henüz yayımlanmadı.");
}

function uniUpcoming(days, fromIso, mealKeys) {
  const out = Object.keys(days).filter((iso) => iso > fromIso).sort().slice(0, 25);
  if (!out.length) return "";
  return `<div class="s-days">${out
    .map((iso) => {
      const d = days[iso];
      let inner;
      if (d.holiday) inner = `<p class="s-holiday">Resmi tatil</p>`;
      else if (d.invalid) inner = `<p class="s-warn">Menü doğrulanamadı</p>`;
      else
        inner = mealKeys
          .filter((k) => d.meals?.[k]?.items?.length)
          .map((k) => `<p><b>${{ sabah: "Kahvaltı", ogle: "Öğle", aksam: "Akşam", vegan: "Vegan" }[k]}:</b> ${esc(d.meals[k].items.map((i) => i.name).join(", "))}</p>`)
          .join("");
      return `<article class="s-day"><h3>${esc(trDate(iso, { year: false }))}</h3>${inner}</article>`;
    })
    .join("")}</div>`;
}

const todayHeading = (iso) =>
  iso === TODAY ? `Bugün · ${trDate(iso)}` : `${weekday(TODAY) % 6 === 0 ? "Pazartesi menüsü" : DAYS[weekday(iso)]} · ${trDate(iso)}`;

function gaziPage(D, json) {
  const days = validDays(json);
  if (!Object.keys(days).length) return null;
  const t = targetDate(days);
  const day = days[t];
  const preview = day?.meals?.ogle?.items?.slice(0, 3).map((i) => i.name).join(", ");
  const uni = D.universities.find((u) => u.inApp === "gazi");
  return {
    key: "gazi",
    path: "/gazi-universitesi-yemek-listesi/",
    title: `Gazi Yemek Listesi Bugün – Gazi Üni Yemekhane Menüsü ${MONTH_LABEL}`,
    description: `Gazi yemek listesi ${trDate(t, { day: false, year: false })}${preview ? `: ${preview}` : ""}. Gazi Üniversitesi yemekhane menüsü, haftalık liste, etsiz alternatif ve kalori.`,
    h1: "Gazi Üniversitesi Yemek Listesi ve Yemekhane Menüsü",
    lead: "Gazi yemek listesi (Gazi üni yemek listesi) her gün güncel: Gazi Üniversitesi yemekhanesinin öğle menüsü — çorba, ana yemek, etsiz alternatif, yardımcı yemek, tatlı ve kalori. Gazi yemekhane menüsünün haftalık listesi aşağıda.",
    crumbs: [{ name: "Üniversite yemek listeleri", path: "/ankara-universite-yemek-listeleri/" }, { name: "Gazi Üniversitesi", path: "/gazi-universitesi-yemek-listesi/" }],
    body: `
<section class="s-card${t === TODAY ? " s-today" : ""}"><h2>${esc(todayHeading(t))}</h2>${weekday(TODAY) % 6 === 0 && t !== TODAY ? note("Hafta sonu yemekhane menüsü yayımlanmaz; pazartesi günün menüsü gösteriliyor.") : ""}${uniDayInner(day, ["ogle"])}</section>
<section class="s-sec"><h2>Gazi Üniversitesi haftalık yemek listesi</h2>${uniUpcoming(days, t, ["ogle"]) || note("Sonraki günlerin menüsü henüz eklenmedi.")}</section>
<section class="s-sec"><h2>Resmi kaynak</h2>${note(`Menü değişikliklerini <a href="${esc(uni?.menuUrl || "https://mediko.gazi.edu.tr/view/page/20412/yemek-listesi")}" rel="noopener">Gazi Üniversitesi yemek listesi</a> sayfasından teyit edebilirsin.`)}</section>`,
    app: { screen: "gazi", ctaText: "Gazi menüsünü uygulamada aç" },
    faq: [
      { q: "Gazi yemek listesine nereden bakılır?", a: "Gazi Üniversitesi yemek listesi (Gazi yemekhane menüsü) bu sayfada ve ÖğrenciYemek uygulamasında her gün güncel olarak yer alır; resmi liste Gazi Üniversitesi Mediko-Sosyal sayfasında yayımlanır." },
      { q: "Gazi Üniversitesi yemekhanesinde bugün ne var?", a: day?.meals?.ogle?.items?.length ? `${trDate(t)} öğle menüsü: ${day.meals.ogle.items.map((i) => i.name).join(", ")}.` : "Bu günün menüsü henüz yayımlanmadı." },
      { q: "Gazi yemek listesinde etsiz (vejetaryen) seçenek var mı?", a: "Evet. Listede ana yemeğin yanında etsiz bir alternatif yer alır; bu sayfada \"Etsiz Alternatif\" olarak işaretlidir." },
      { q: "Gazi Üniversitesi yemekhanesi hafta sonu açık mı?", a: "Yemek listesi hafta içi günler için yayımlanır. Hafta sonu bu sayfada pazartesi günün menüsü gösterilir." },
      { q: "Gazi yemek listesi ne zaman güncellenir?", a: "Yeni haftanın menüsü yayımlandığında bu sayfa otomatik güncellenir. Resmi tatillerde yemekhane hizmet vermez." },
    ],
    related: [
      { href: "/hacettepe-yemek-listesi/", text: "Hacettepe yemek listesi" },
      { href: "/ankara-universitesi-yemek-listesi/", text: "Ankara Üniversitesi yemek listesi" },
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
    ],
  };
}

function hacettepePage(D, beytepe, sihhiye) {
  const bDays = validDays(beytepe);
  const sDays = validDays(sihhiye);
  if (!Object.keys(bDays).length && !Object.keys(sDays).length) return null;
  const t = targetDate(Object.keys(bDays).length ? bDays : sDays);
  const MEALS = ["sabah", "ogle", "aksam", "vegan"];
  const bDay = bDays[t];
  const sDay = sDays[t];
  const same = bDay && sDay && JSON.stringify(bDay.meals) === JSON.stringify(sDay.meals);

  // Servis saatleri: verideki gerçek saatlerden (hafta içi / hafta sonu)
  const times = { ici: {}, sonu: {} };
  for (const d of Object.values(bDays)) {
    const bucket = weekday(d.date) % 6 === 0 ? times.sonu : times.ici;
    for (const k of MEALS) if (d.meals?.[k]?.time && !bucket[k]) bucket[k] = d.meals[k].time;
  }
  const tRow = (k, label) => [label, [times.ici[k] ? `Hafta içi ${esc(times.ici[k])}` : "", times.sonu[k] ? `Hafta sonu ${esc(times.sonu[k])}` : ""].filter(Boolean).join("<br>") || "—"];
  const preview = bDay?.meals?.ogle?.items?.slice(0, 3).map((i) => i.name).join(", ");

  return {
    key: "hacettepe",
    path: "/hacettepe-yemek-listesi/",
    title: "Hacettepe Yemek Listesi Bugün – Beytepe ve Sıhhiye Yemekhane Menüsü, Saatleri",
    description: `Hacettepe yemek listesi ${trDate(t, { day: false, year: false })}${preview ? `: ${preview}` : ""}. Hacettepe yemekhane menüsü (Beytepe, Sıhhiye), yemekhane saatleri, vegan menü ve kalori.`,
    h1: "Hacettepe Yemek Listesi ve Yemekhane Menüsü",
    lead: "Hacettepe yemek listesi her gün güncel: Beytepe ve Sıhhiye yemekhanelerinin kahvaltı, öğle, akşam ve vegan menüsü; Hacettepe yemekhane saatleri, kalori ve alerjen bilgisiyle.",
    crumbs: [{ name: "Üniversite yemek listeleri", path: "/ankara-universite-yemek-listeleri/" }, { name: "Hacettepe Üniversitesi", path: "/hacettepe-yemek-listesi/" }],
    body: `
<section class="s-card${t === TODAY ? " s-today" : ""}"><h2>Hacettepe Beytepe yemekhane menüsü · ${esc(todayHeading(t))}</h2>${uniDayInner(bDay, MEALS)}</section>
${!same && sDay
      ? `<section class="s-card"><h2>Hacettepe Sıhhiye yemekhane menüsü · ${esc(todayHeading(t))}</h2>${uniDayInner(sDay, MEALS)}</section>`
      : `<section class="s-sec"><h2>Hacettepe Sıhhiye yemek listesi</h2>${note(sDay ? "Sıhhiye yemekhanesinde bugün Beytepe ile aynı menü uygulanıyor; menü yukarıda." : "Sıhhiye yemekhanesinin bugünkü menüsü henüz yayımlanmadı.")}</section>`}
<section class="s-sec"><h2>Hacettepe yemekhane saatleri (Beytepe, Sıhhiye)</h2>${infoGrid([tRow("sabah", "Kahvaltı"), tRow("ogle", "Öğle yemeği"), tRow("aksam", "Akşam yemeği"), tRow("vegan", "Vegan menü")])}</section>
<section class="s-sec"><h2>Hacettepe haftalık yemek listesi (Beytepe)</h2>${uniUpcoming(bDays, t, ["ogle", "aksam", "vegan"]) || note("Sonraki günlerin menüsü henüz yayımlanmadı.")}</section>
<section class="s-sec"><h2>Resmi kaynak</h2>${note(`Menü ve saat değişikliklerini <a href="https://beslenme.hacettepe.edu.tr/" rel="noopener">Hacettepe Beslenme Bilgi Sistemi</a> üzerinden teyit edebilirsin. Menü zorunlu hallerde değişebilir.`)}</section>`,
    app: { screen: "hacettepe", ctaText: "Hacettepe menüsünü uygulamada aç" },
    faq: [
      { q: "Hacettepe yemek listesine nereden bakılır?", a: "Hacettepe yemek listesi (Beytepe ve Sıhhiye yemekhane menüsü) bu sayfada ve ÖğrenciYemek uygulamasında her gün güncel olarak yer alır; resmi kaynak Hacettepe Beslenme Bilgi Sistemi'dir." },
      { q: "Hacettepe yemekhanesinde bugün ne var?", a: bDay?.meals?.ogle?.items?.length ? `${trDate(t)} öğle menüsü (Beytepe): ${bDay.meals.ogle.items.map((i) => i.name).join(", ")}.` : "Bu günün öğle menüsü henüz yayımlanmadı." },
      { q: "Hacettepe yemekhane saatleri nedir?", a: `Öğle yemeği hafta içi ${times.ici.ogle || "—"}, akşam yemeği ${times.ici.aksam || "—"}, kahvaltı ${times.ici.sabah || "—"} saatlerindedir.${times.sonu.ogle ? ` Hafta sonu öğle yemeği ${times.sonu.ogle}.` : ""} Saatler menüyle birlikte yayımlanır ve değişebilir.` },
      { q: "Hacettepe'de vegan menü var mı?", a: "Evet. Öğle saatlerinde ayrı bir vegan menü yayımlanır; bu sayfada \"Vegan menü\" başlığıyla gösterilir." },
      { q: "Beytepe ve Sıhhiye menüsü aynı mı?", a: "Çoğu gün iki yemekhanede aynı menü uygulanır. Farklı olduğu günlerde bu sayfada iki menü ayrı ayrı gösterilir." },
      { q: "Hacettepe menüsünde alerjen bilgisi var mı?", a: "Evet. Yemeklerin kalori ve alerjen (gluten, süt vb.) bilgisi ÖğrenciYemek uygulamasında her yemeğin altında gösterilir." },
    ],
    related: [
      { href: "/gazi-universitesi-yemek-listesi/", text: "Gazi Üniversitesi yemek listesi" },
      { href: "/ankara-universitesi-yemek-listesi/", text: "Ankara Üniversitesi yemek listesi" },
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
    ],
  };
}

function ankuPage(D, json) {
  const days = validDays(json);
  if (!Object.keys(days).length) return null;
  const t = targetDate(days);
  const day = days[t];
  const preview = day?.meals?.ogle?.items?.slice(0, 3).map((i) => i.name).join(", ");
  const monthTitle = json?.title ? niceCase(json.title) : "Aylık menü";
  return {
    key: "anku",
    path: "/ankara-universitesi-yemek-listesi/",
    title: "Ankü Yemek Listesi Bugün – Ankara Üniversitesi Yemekhane Menüsü",
    description: `Ankara Üniversitesi yemek listesi ${trDate(t, { day: false, year: false })}${preview ? `: ${preview}` : ""}. Ankü yemekhane menüsü, aylık yemek listesi ve kalori değerleri.`,
    h1: "Ankara Üniversitesi (Ankü) Yemek Listesi",
    lead: "Ankara Üniversitesi yemek listesi (Ankü yemek listesi, Ankara Üni yemekhane menüsü): günün öğle menüsü ve aylık yemek listesi — çorba, ana yemek, yardımcı yemek ve kalori değerleri.",
    crumbs: [{ name: "Üniversite yemek listeleri", path: "/ankara-universite-yemek-listeleri/" }, { name: "Ankara Üniversitesi", path: "/ankara-universitesi-yemek-listesi/" }],
    body: `
<section class="s-card${t === TODAY ? " s-today" : ""}"><h2>${esc(todayHeading(t))}</h2>${weekday(TODAY) % 6 === 0 && t !== TODAY ? note("Hafta sonu menü yayımlanmaz; pazartesi günün menüsü gösteriliyor.") : ""}${uniDayInner(day, ["ogle"], { withTimes: false })}</section>
<section class="s-sec"><h2>${esc(monthTitle)}</h2>${uniUpcoming(days, t, ["ogle"]) || note("Ayın kalan günleri için menü yok.")}</section>
<section class="s-sec"><h2>Resmi kaynak</h2>${note(`Menü Ankara Üniversitesi SKS'nin yayımladığı aylık listeden alınır. Değişiklikler için <a href="https://sks.ankara.edu.tr/yemek-hizmetleri-2/" rel="noopener">SKS yemek hizmetleri</a> sayfasına bakabilirsin. Kalori değerleri yaklaşıktır.`)}</section>`,
    app: { screen: "anku", ctaText: "Ankü menüsünü uygulamada aç" },
    faq: [
      { q: "Ankara Üniversitesi yemekhanesinde bugün ne var?", a: day?.meals?.ogle?.items?.length ? `${trDate(t)} öğle menüsü: ${day.meals.ogle.items.map((i) => i.name).join(", ")}.` : "Bu günün menüsü henüz yayımlanmadı." },
      { q: "Ankara Üniversitesi yemek listesi nereden yayımlanıyor?", a: "Menü, Sağlık, Kültür ve Spor Daire Başkanlığı'nın (SKS) aylık yemek listesinden alınır ve bu sayfa her gün güncellenir." },
      { q: "Menüdeki kalori değerleri doğru mu?", a: "Kalori değerleri SKS diyetisyenlerinin listesinden alınır ve yaklaşık değerlerdir." },
    ],
    related: [
      { href: "/gazi-universitesi-yemek-listesi/", text: "Gazi Üniversitesi yemek listesi" },
      { href: "/hacettepe-yemek-listesi/", text: "Hacettepe yemek listesi" },
      { href: "/cankaya-kent-lokantasi/", text: "Çankaya Kent Lokantası (Cebeci şubesi)" },
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
    ],
  };
}

/* ---------------- ABB Gençlik Sofrası ---------------- */
// Not: ABB sitesi GitHub sunucularına 403 veriyor; bu yüzden menü sunucuda
// sayfaya işlenmez. Sayfa tarihsiz, hiç eskimeyen bilgileri içerir; günün menüsü
// ziyaretçinin tarayıcısında (uygulamadaki yöntemle) yüklenir. Yüklenemezse resmi
// bağlantı görünür kalır. Böylece yanlış/bayat "bugün" menüsü asla yayımlanmaz.

const GENCLIK_LIVE_SCRIPT = `<script>
(function () {
  var box = document.getElementById("gs-live"), note = document.getElementById("gs-live-note");
  if (!box || !window.fetch || !window.DOMParser) return;
  var U = "https://sosyalhizmetler.ankara.bel.tr/hizmetler/genclik-sofralari";
  var P = [function (u) { return u; },
           function (u) { return "https://api.allorigins.win/raw?url=" + encodeURIComponent(u); },
           function (u) { return "https://corsproxy.io/?url=" + encodeURIComponent(u); }];
  var M = ["ocak","şubat","mart","nisan","mayıs","haziran","temmuz","ağustos","eylül","ekim","kasım","aralık"];
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var d = new Date(), today = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var tc = function (x) {
    x = x.replace(/\\s+/g, " ").trim();
    if (x !== x.toLocaleUpperCase("tr")) return x;
    return x.toLocaleLowerCase("tr").replace(/\\s*\\+\\s*/g, " + ").replace(/(^|[\\s(\\/+-])(\\S)/g, function (m, p, c) { return p + c.toLocaleUpperCase("tr"); });
  };
  function parse(html) {
    var sec = new DOMParser().parseFromString(html, "text/html").querySelector(".hz-gs-hafta");
    if (!sec) return null;
    var yr = (sec.textContent.match(/(\\d{4})/) || [])[1] || String(d.getFullYear()), out = null;
    sec.querySelectorAll("li").forEach(function (li) {
      var sm = li.querySelector(".hz-gs-gun small"), ym = li.querySelector(".hz-gs-yemekler");
      if (!sm || !ym) return;
      var m = sm.textContent.trim().toLocaleLowerCase("tr").match(/^(\\d{1,2})\\s+(\\S+)/);
      if (!m || M.indexOf(m[2]) < 0) return;
      if (yr + "-" + pad(M.indexOf(m[2]) + 1) + "-" + pad(+m[1]) === today) {
        out = ym.textContent.split(/\\s*[·•|]\\s*/).map(tc).filter(Boolean);
      }
    });
    return out;
  }
  (async function () {
    for (var i = 0; i < P.length; i++) {
      try {
        var c = new AbortController(), t = setTimeout(function () { c.abort(); }, 8000);
        var r = await fetch(P[i](U), { signal: c.signal });
        clearTimeout(t);
        if (!r.ok) continue;
        var items = parse(await r.text());
        if (items && items.length) {
          box.innerHTML = '<ul class="s-dishes">' + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
          box.hidden = false;
          if (note) note.hidden = true;
          return;
        }
      } catch (e) { /* sıradaki yolu dene */ }
    }
  })();
})();
</script>`;

function genclikPage(D) {
  const g = D.genclikSofrasi;
  const hours = hoursText(String(g.hours).replace(/\s*\(.*\)\s*/, ""));
  return {
    key: "genclik",
    path: "/genclik-sofrasi/",
    title: "Gençlik Sofrası Menü Bugün – Ankara Gençlik Sofrası Saatleri ve Kayıt",
    description: `Ankara Gençlik Sofrası menü, saatleri (hafta içi ${hours}), Sıhhiye, Kızılay, Anıttepe ve Gazi Mahallesi adresleri ve kayıt bilgisi. Öğrencilere ücretsiz.`,
    h1: "Ankara Gençlik Sofrası Menüsü",
    lead: "Gençlik Sofrası menü, saatleri ve kayıt bilgisi: Ankara Büyükşehir Belediyesi'nin üniversite öğrencilerine hafta içi her akşam verdiği ücretsiz sıcak yemek; günün menüsü ve hizmet noktaları (Sıhhiye, Kızılay, Anıttepe, Gazi Mahallesi).",
    crumbs: [{ name: "Ücretsiz yemek", path: "/ankara-ogrenci-ucretsiz-yemek/" }, { name: "Gençlik Sofrası", path: "/genclik-sofrasi/" }],
    body: `
<section class="s-card"><h2>Günün Gençlik Sofrası menüsü</h2>
<div id="gs-live" hidden></div>
<p class="s-note" id="gs-live-note">Günün menüsü ABB'nin <a href="${esc(g.pageUrl)}" rel="noopener">Gençlik Sofraları sayfasında</a> yayımlanır; ÖğrenciYemek uygulamasında da her gün otomatik görünür. Gençlik Sofrası hafta sonu hizmet vermez.</p>
</section>
<section class="s-sec"><h2>Gençlik Sofrası saatleri ve kayıt</h2>${infoGrid([
      ["Saat", `${esc(hours)} (hafta içi)`],
      ["Ücret", "Ücretsiz"],
      ["Kimler yararlanabilir", "Ankara'da okuyan üniversite öğrencileri"],
      ["Kayıt", "TC kimlik kartı veya öğrenci kimliği ile karekod sistemi üzerinden başvuru yapılır."],
    ])}</section>
<section class="s-sec"><h2>Gençlik Sofrası nerede?</h2><ul class="s-places">${g.locations
      .map((l) => `<li><b>${esc(l.name)}</b><span>${esc(l.address)}</span><a href="${esc(mapsUrl(`${l.name} ${l.address} Ankara`))}" rel="noopener">Haritada aç</a></li>`).join("")}</ul></section>
${GENCLIK_LIVE_SCRIPT}`,
    app: { screen: "genclik", ctaText: "Gençlik Sofrası menüsünü uygulamada aç" },
    faq: [
      { q: "Gençlik Sofrası menüsü nereden görülür?", a: "Ankara Gençlik Sofrası menüsü ABB Sosyal Hizmetler sayfasında yayımlanır; bu sayfada ve ÖğrenciYemek uygulamasında günün menüsü otomatik gösterilir." },
      { q: "Gençlik Sofrası saat kaçta?", a: `Gençlik Sofrası hafta içi her gün ${hours} saatleri arasında hizmet verir.` },
      { q: "Gençlik Sofrası ücretli mi?", a: "Hayır, Ankara'da okuyan üniversite öğrencileri için ücretsizdir." },
      { q: "Gençlik Sofrası nerede?", a: `Hizmet noktaları: ${g.locations.map((l) => `${l.name} (${l.address})`).join("; ")}.` },
      { q: "Gençlik Sofrası'na nasıl kayıt olunur?", a: "TC kimlik kartı veya öğrenci kimliği ile karekod sistemi üzerinden başvuru yapılır; kayıttan sonra kimliğinle yararlanabilirsin." },
      { q: "Gençlik Sofrası hafta sonu açık mı?", a: "Hayır, yalnızca hafta içi hizmet verir." },
    ],
    schema: g.locations.map((l) => foodPlaceSchema({ name: l.name, address: l.address, hours, free: true, url: SITE + "/genclik-sofrasi/" })),
    related: [
      { href: "/cankaya-genclik-sofrasi/", text: "Çankaya Gençlik Sofrası" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
      { href: "/kyk-yemek-listesi/ankara/", text: "KYK menü Ankara" },
    ],
  };
}

/* ---------------- Belediye noktaları (js/data.js) ---------------- */

function cankayaGenclikPage(D) {
  const g = D.cankayaGenclikSofrasi;
  const hours = hoursText(g.hours);
  const week = (g.weeklyMenu || []).filter((w) => w.date >= TODAY && w.date <= addDays(mondayOf(TODAY), 6));
  const todayRow = week.find((w) => w.date === TODAY);
  return {
    key: "cankaya-genclik",
    path: "/cankaya-genclik-sofrasi/",
    title: "Çankaya Gençlik Sofrası – Ücretsiz Akşam Yemeği, Saatler ve Menü",
    description: `Çankaya Belediyesi Gençlik Sofrası: üniversite öğrencilerine hafta içi ${hours} ücretsiz akşam yemeği. Kızılay ve 100. Yıl adresleri, haftalık menü.`,
    h1: "Çankaya Gençlik Sofrası",
    lead: "Çankaya Belediyesi'nin Ankara'da okuyan üniversite öğrencilerine hafta içi her akşam verdiği ücretsiz sıcak yemek (4 çeşit).",
    crumbs: [{ name: "Ücretsiz yemek", path: "/ankara-ogrenci-ucretsiz-yemek/" }, { name: "Çankaya Gençlik Sofrası", path: "/cankaya-genclik-sofrasi/" }],
    body: `
${todayRow ? `<section class="s-card s-today"><h2>Bugün · ${esc(trDate(TODAY))}</h2>${mealBlock("🍲 Akşam yemeği", hours, null, dishList(todayRow.items))}</section>` : ""}
${week.filter((w) => w.date > TODAY).length ? `<section class="s-sec"><h2>Bu haftanın menüsü</h2><div class="s-days">${week.filter((w) => w.date > TODAY)
      .map((w) => `<article class="s-day"><h3>${esc(trDate(w.date, { year: false }))}</h3><p>${esc(w.items.join(", "))}</p></article>`).join("")}</div></section>` : ""}
<section class="s-sec"><h2>Saatler</h2>${infoGrid([["Saat", `${esc(hours)} (${esc(g.days.toLocaleLowerCase("tr"))})`], ["Ücret", esc(g.price)], ["Kimler yararlanabilir", "Ankara'da okuyan üniversite öğrencileri"]])}</section>
<section class="s-sec"><h2>Hizmet noktaları</h2><ul class="s-places">${g.locations
      .map((l) => `<li><b>${esc(l.name)}</b><span>${esc(l.address)}</span><a href="${esc(mapsUrl(l.mapQuery || l.address))}" rel="noopener">Haritada aç</a></li>`).join("")}</ul></section>
<section class="s-sec"><h2>Güncel menü</h2>${note(`Çankaya Belediyesi haftalık menüyü görsel olarak yayımlıyor: <a href="${esc(g.menuUrl)}" rel="noopener">Çankaya Belediyesi — Menülerimiz</a>.`)}</section>`,
    app: { screen: "cankaya-genclik", ctaText: "Uygulamada aç" },
    faq: [
      { q: "Çankaya Gençlik Sofrası saat kaçta?", a: `Hafta içi her gün ${hours} saatleri arasında.` },
      { q: "Çankaya Gençlik Sofrası nerede?", a: g.locations.map((l) => `${l.name}: ${l.address}`).join("; ") + "." },
      { q: "Çankaya Gençlik Sofrası ücretli mi?", a: "Hayır, üniversite öğrencilerine ücretsizdir." },
    ],
    schema: g.locations.map((l) => foodPlaceSchema({ name: l.name, address: l.address, query: l.mapQuery, hours, free: true, url: SITE + "/cankaya-genclik-sofrasi/" })),
    related: [
      { href: "/genclik-sofrasi/", text: "ABB Gençlik Sofrası menüsü" },
      { href: "/cankaya-kent-lokantasi/", text: "Çankaya Kent Lokantası" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
    ],
  };
}

function cankayaKentPage(D) {
  const k = D.cankayaKentLokantasi;
  const hours = hoursText(k.hours);
  return {
    key: "cankaya-kent",
    path: "/cankaya-kent-lokantasi/",
    title: `Çankaya Kent Lokantası – Menü, Fiyat (${k.price}) ve Çalışma Saatleri`,
    description: `Çankaya Kent Lokantası'nda 4 çeşit yemek ${k.price}, su ve ekmek ücretsiz. Hafta içi ${hours}. Cebeci, Sokullu ve Seyranbağları şubelerinin adresleri ve haftalık menü.`,
    h1: "Çankaya Kent Lokantası",
    lead: `Çankaya Belediyesi'nin Cebeci, Sokullu ve Seyranbağları'ndaki kent lokantalarında 4 çeşit sıcak yemek ${k.price}; su ve ekmek ücretsiz.`,
    crumbs: [{ name: "Ücretsiz yemek", path: "/ankara-ogrenci-ucretsiz-yemek/" }, { name: "Çankaya Kent Lokantası", path: "/cankaya-kent-lokantasi/" }],
    body: `
<section class="s-sec"><h2>Fiyat ve çalışma saatleri</h2>${infoGrid([["Fiyat", `${esc(k.price)} (4 çeşit yemek)`], ["Saat", `${esc(hours)} (${esc(k.days.toLocaleLowerCase("tr"))})`], ["Not", esc(k.description)]])}</section>
<section class="s-sec"><h2>Şubeler</h2><ul class="s-places">${k.locations
      .map((l) => `<li><b>${esc(l.name)}</b><span>${esc(l.address)}</span><a href="${esc(mapsUrl(l.mapQuery || l.address))}" rel="noopener">Haritada aç</a></li>`).join("")}</ul></section>
<section class="s-sec"><h2>Haftalık menü</h2>${note(`Çankaya Belediyesi kent lokantası menüsünü her hafta görsel olarak yayımlıyor: <a href="${esc(k.menuUrl)}" rel="noopener">Çankaya Belediyesi — Menülerimiz</a>.`)}</section>`,
    app: { screen: "cankaya-kent", ctaText: "Uygulamada aç" },
    faq: [
      { q: "Çankaya Kent Lokantası fiyatı ne kadar?", a: `4 çeşit yemek ${k.price}; su ve ekmek ücretsiz.` },
      { q: "Çankaya Kent Lokantası çalışma saatleri nedir?", a: `Hafta içi her gün ${hours}.` },
      { q: "Çankaya Kent Lokantası nerede?", a: k.locations.map((l) => `${l.name}: ${l.address}`).join("; ") + "." },
      { q: "Çankaya Kent Lokantası menüsü nereden görülür?", a: "Haftalık menü Çankaya Belediyesi'nin Menülerimiz sayfasında görsel olarak yayımlanır." },
    ],
    schema: k.locations.map((l) => foodPlaceSchema({ name: l.name, address: l.address, query: l.mapQuery, hours, price: k.price, url: SITE + "/cankaya-kent-lokantasi/" })),
    related: [
      { href: "/etimesgut-kent-lokantasi/", text: "Etimesgut Kent Lokantası" },
      { href: "/cankaya-genclik-sofrasi/", text: "Çankaya Gençlik Sofrası" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz ve ucuz yemek" },
    ],
  };
}

function etimesgutKentPage(D) {
  const e = D.etimesgutKentLokantasi;
  const hours = hoursText(e.hours);
  return {
    key: "etimesgut-kent",
    path: "/etimesgut-kent-lokantasi/",
    title: `Etimesgut Kent Lokantası (Ahi-Kent) – Menü, Fiyat ${e.price} ve Saatler`,
    description: `Etimesgut Belediyesi Ahi-Kent Lokantası: hafta içi ${hours} sıcak yemek ${e.price}. Günün menüsü, çalışma saatleri ve bilgiler.`,
    h1: "Etimesgut Kent Lokantası (Ahi-Kent)",
    lead: `Etimesgut Belediyesi'nin Ahi-Kent Lokantası'nda hafta içi ${hours} saatleri arasında sıcak yemek ${e.price}.`,
    crumbs: [{ name: "Ücretsiz yemek", path: "/ankara-ogrenci-ucretsiz-yemek/" }, { name: "Etimesgut Kent Lokantası", path: "/etimesgut-kent-lokantasi/" }],
    body: `
<section class="s-sec"><h2>Fiyat ve çalışma saatleri</h2>${infoGrid([
      ["Sıcak yemek", `${esc(e.price)} · hafta içi ${esc(hours)}`],
      ["Çay, kahve, simit", "Hafta sonu dahil 09:00–18:00 (uygun fiyatlı)"],
      ["Kapasite", "144 kişilik oturma alanı"],
    ])}</section>
<section class="s-sec"><h2>Günün menüsü</h2>${note(`Etimesgut Belediyesi günün menüsünü her gün görsel olarak yayımlıyor: <a href="${esc(e.pageUrl)}" rel="noopener">Ahi-Kent Lokantası — günün menüsü</a>.`)}</section>`,
    app: { screen: null, label: "Uygulamayı aç", ctaText: "ÖğrenciYemek uygulamasını aç" },
    faq: [
      { q: "Etimesgut Kent Lokantası fiyatı ne kadar?", a: `Hafta içi verilen sıcak yemek ${e.price}.` },
      { q: "Etimesgut Kent Lokantası saat kaçta açık?", a: `Sıcak yemek hafta içi ${hours}; çay, kahve ve simit gibi ürünler hafta sonu dahil 09:00–18:00.` },
      { q: "Etimesgut Kent Lokantası menüsü nereden görülür?", a: "Günün menüsü Etimesgut Belediyesi'nin Ahi-Kent Lokantası sayfasında yayımlanır." },
    ],
    related: [
      { href: "/cankaya-kent-lokantasi/", text: "Çankaya Kent Lokantası" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz ve ucuz yemek" },
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
    ],
  };
}

function milletPage(D) {
  const m = D.milletKutuphanesi;
  const timed = m.services.filter((s) => (s.windows || []).some((w) => !(w.start === "00:00" && w.end === "24:00")));
  const allDay = m.services.filter((s) => (s.windows || []).some((w) => w.start === "00:00" && w.end === "24:00"));
  const winText = (s) => s.windows.map((w) => `${w.start}–${w.end === "24:00" ? "24:00" : w.end}`).join(" ve ");
  const corba = m.services.find((s) => /çorba/i.test(s.shortName || s.name));
  const kek = m.services.find((s) => /kek/i.test(s.shortName || s.name));
  return {
    key: "millet",
    path: "/millet-kutuphanesi-corba-saatleri/",
    title: "Millet Kütüphanesi Çorba ve Kek Saatleri – Ücretsiz İkram",
    description: `Cumhurbaşkanlığı Millet Kütüphanesi ücretsiz ikramları: çorba ${corba ? winText(corba) : ""}, kek ${kek ? winText(kek) : ""}, çay ve kahve 7/24. Nerede, hangi katta?`,
    h1: "Millet Kütüphanesi Çorba ve Kek Saatleri",
    lead: "Cumhurbaşkanlığı Millet Kütüphanesi'nde ders çalışan öğrencilere ücretsiz çorba, kek ve sıcak içecek ikramı yapılıyor. Saatler ve yer bilgisi aşağıda.",
    crumbs: [{ name: "Ücretsiz yemek", path: "/ankara-ogrenci-ucretsiz-yemek/" }, { name: "Millet Kütüphanesi", path: "/millet-kutuphanesi-corba-saatleri/" }],
    body: `
<section class="s-sec"><h2>Ücretsiz ikram saatleri</h2>${infoGrid([...timed, ...allDay].map((s) => [s.name, `${esc(winText(s) === "00:00–24:00" ? "7/24" : winText(s))} · ${esc(s.schedule)}`]))}
${note("İkram saatleri kütüphane tarafından değiştirilebilir; ziyaretten önce teyit etmeni öneririz.")}</section>
<section class="s-sec"><h2>Nerede?</h2>${infoGrid([["Yer", `${esc(m.title)} — ${esc(m.subtitle)}`], ["Ücret", "Ücretsiz"]])}</section>`,
    app: { screen: "millet", ctaText: "Uygulamada aç" },
    faq: [
      ...(corba ? [{ q: "Millet Kütüphanesi çorba saat kaçta?", a: `Çorba ikramı ${winText(corba)} saatlerinde yapılır.` }] : []),
      ...(kek ? [{ q: "Millet Kütüphanesi kek saat kaçta?", a: `Kek ikramı gece ${winText(kek)} saatleri arasında yapılır.` }] : []),
      { q: "Millet Kütüphanesi'nde çay ve kahve ücretsiz mi?", a: allDay.length ? "Evet, sıcak içecek ikramı 7/24 ücretsizdir." : "Sıcak içecek ikramı yapılmaktadır." },
      { q: "Millet Kütüphanesi çorba ikramı hangi katta?", a: `İkramlar ${m.subtitle} bölümünde yapılır.` },
    ],
    related: [
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
      { href: "/genclik-sofrasi/", text: "Gençlik Sofrası menüsü" },
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
    ],
  };
}

/* ---------------- Bilgi merkezleri ---------------- */

function freeFoodHub(D, ctx) {
  const k = D.kykInfo;
  const rows = [
    ["KYK yurtları", `Kahvaltı ${hoursText(k.breakfastHours)}, akşam ${hoursText(k.dinnerHours)}`, `GSB beslenme yardımı (${k.totalSubsidy}/gün)`, "/kyk-yemek-listesi/ankara/"],
    ["ABB Gençlik Sofrası", `Hafta içi ${hoursText(String(D.genclikSofrasi.hours).replace(/\s*\(.*\)/, ""))}`, "Ücretsiz", "/genclik-sofrasi/"],
    ["Çankaya Gençlik Sofrası", `Hafta içi ${hoursText(D.cankayaGenclikSofrasi.hours)}`, "Ücretsiz", "/cankaya-genclik-sofrasi/"],
    ["Millet Kütüphanesi", "Çorba, kek ve sıcak içecek ikramı", "Ücretsiz", "/millet-kutuphanesi-corba-saatleri/"],
    ["Çankaya Kent Lokantası", `Hafta içi ${hoursText(D.cankayaKentLokantasi.hours)}`, `${D.cankayaKentLokantasi.price} (4 çeşit)`, "/cankaya-kent-lokantasi/"],
    ["Etimesgut Kent Lokantası", `Hafta içi ${hoursText(D.etimesgutKentLokantasi.hours)}`, D.etimesgutKentLokantasi.price, "/etimesgut-kent-lokantasi/"],
  ];
  const kykToday = ctx.kykAnkaraToday;
  return {
    key: "hub-free",
    path: "/ankara-ogrenci-ucretsiz-yemek/",
    title: "Ankara Öğrencilere Ücretsiz Yemek – Gençlik Sofrası, KYK, Ucuz Yemek Yerleri",
    description: "Ankara'da üniversite öğrencilerinin ücretsiz veya uygun fiyatlı yemek yiyebileceği yerler: Gençlik Sofrası, KYK, Millet Kütüphanesi çorba ikramı ve kent lokantaları; saatler ve fiyatlar.",
    h1: "Ankara'da Öğrencilere Ücretsiz ve Ucuz Yemek",
    lead: "Ankara'da öğrencilere ücretsiz yemek veren yerler ve ucuz yemek yerleri: Ankara Büyükşehir Belediyesi Gençlik Sofrası, Çankaya Belediyesi, KYK, Millet Kütüphanesi ve kent lokantaları — saatler, fiyatlar ve günün menüleri.",
    crumbs: [{ name: "Ücretsiz yemek", path: "/ankara-ogrenci-ucretsiz-yemek/" }],
    body: `
<section class="s-sec"><h2>Nerede, ne zaman, kaç para?</h2><div class="s-table" role="table">
<div class="s-tr s-th" role="row"><span role="columnheader">Yer</span><span role="columnheader">Saat</span><span role="columnheader">Ücret</span></div>
${rows.map(([n, h, p, href]) => `<a class="s-tr" role="row" href="${href}"><span role="cell"><b>${esc(n)}</b></span><span role="cell">${esc(h)}</span><span role="cell">${esc(p)}</span></a>`).join("\n")}
</div></section>
${kykToday ? `<section class="s-card s-today"><h2>Bugün KYK Ankara akşam yemeği</h2>${dishList(kykToday)}<p class="s-more"><a href="/kyk-yemek-listesi/ankara/">Ankara KYK yemek listesinin tamamı →</a></p></section>` : ""}
<section class="s-sec"><h2>Üniversite yemekhaneleri</h2>${note('Gazi, Hacettepe ve Ankara Üniversitesi yemekhanelerinin günlük menüleri için <a href="/ankara-universite-yemek-listeleri/">Ankara üniversite yemek listeleri</a> sayfasına bakabilirsin.')}</section>`,
    app: { screen: null, ctaText: "Şu an açık yerleri uygulamada gör" },
    faq: [
      { q: "Ankara'da öğrencilere ücretsiz yemek veren yerler hangileri?", a: "Ankara Büyükşehir Belediyesi Gençlik Sofrası ve Çankaya Belediyesi Gençlik Sofrası hafta içi akşamları üniversite öğrencilerine ücretsiz yemek verir. Millet Kütüphanesi'nde ücretsiz çorba ve kek ikramı yapılır. KYK yurtlarında yemekler GSB beslenme yardımıyla karşılanır." },
      { q: "Ankara'da en ucuz öğrenci yemeği nerede?", a: `Ücretsiz seçeneklerin yanında belediyelerin kent lokantalarında 4 çeşit yemek ${D.cankayaKentLokantasi.price} (Çankaya), sıcak yemek ${D.etimesgutKentLokantasi.price} (Etimesgut).` },
      { q: "Şu an açık olan yerleri nasıl görürüm?", a: "ÖğrenciYemek uygulamasının ana ekranındaki \"Şu an yiyebileceğin yerler\" kartı, saate göre o an açık yerleri ve menülerini gösterir." },
    ],
    related: [
      { href: "/genclik-sofrasi/", text: "Gençlik Sofrası menüsü" },
      { href: "/cankaya-genclik-sofrasi/", text: "Çankaya Gençlik Sofrası" },
      { href: "/millet-kutuphanesi-corba-saatleri/", text: "Millet Kütüphanesi çorba saatleri" },
      { href: "/kyk-yemek-listesi/", text: "KYK yemek listesi" },
    ],
  };
}

// Aranan kısa adlar (ör. "aybü yemek listesi", "hacı bayram veli yemek listesi")
const UNI_SEARCH_NAME = {
  "Ankara Üniversitesi": "Ankü (Ankara Üniversitesi)",
  "Gazi Üniversitesi": "Gazi",
  "Hacettepe Üniversitesi": "Hacettepe",
  "Orta Doğu Teknik Üniversitesi": "ODTÜ",
  "Ankara Yıldırım Beyazıt Üniversitesi": "AYBÜ",
  "Ankara Sosyal Bilimler Üniversitesi": "ASBÜ",
  "Ankara Hacı Bayram Veli Üniversitesi": "Hacı Bayram Veli (AHBV)",
  "Ankara Müzik ve Güzel Sanatlar Üniversitesi": "MGÜ",
  "SBÜ Gülhane Külliyesi": "Gülhane (SBÜ)",
  "Bilkent Üniversitesi": "Bilkent",
};

function uniHub(D) {
  const internal = { gazi: "/gazi-universitesi-yemek-listesi/", hacettepe: "/hacettepe-yemek-listesi/", anku: "/ankara-universitesi-yemek-listesi/" };
  const short = (u) => UNI_SEARCH_NAME[u.name] || u.shortName || u.name;
  const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };
  const others = D.universities.filter((u) => !internal[u.inApp]);
  return {
    key: "hub-uni",
    path: "/ankara-universite-yemek-listeleri/",
    title: "Ankara Üniversite Yemek Listeleri – Gazi, Hacettepe, Ankü, ODTÜ, Bilkent, AYBÜ",
    description: "Ankara üniversite yemek listeleri: Gazi, Hacettepe ve Ankü günlük menüsü; ODTÜ, Bilkent, AYBÜ, Hacı Bayram Veli, ASBÜ, MGÜ ve Gülhane yemek listesi bağlantıları.",
    h1: "Ankara Üniversite Yemek Listeleri",
    lead: "Ankara'daki üniversitelerin yemekhane menüleri tek sayfada. Gazi, Hacettepe ve Ankara Üniversitesi menüleri günlük olarak burada; diğer üniversiteler için resmi menü sayfalarına bağlantılar.",
    crumbs: [{ name: "Üniversite yemek listeleri", path: "/ankara-universite-yemek-listeleri/" }],
    body: `
<section class="s-sec"><h2>Günlük menüsü ÖğrenciYemek'te olan üniversiteler</h2><ul class="s-places">${D.universities
      .filter((u) => internal[u.inApp])
      .map((u) => `<li><h3>${esc(short(u))} yemek listesi</h3><span>${esc(u.name)} — günlük menü, haftalık liste ve kalori</span><a href="${internal[u.inApp]}">${esc(short(u))} yemek listesine git</a></li>`)
      .join("")}</ul></section>
<section class="s-sec"><h2>Diğer Ankara üniversitelerinin yemek listeleri</h2><ul class="s-places">${others
      .map((u) => `<li><h3>${esc(short(u))} yemek listesi</h3><span>${esc(u.note || "")}</span><a href="${esc(u.menuUrl)}" rel="noopener">${esc(short(u))} resmi yemek listesi (${esc(host(u.menuUrl))})</a></li>`)
      .join("")}</ul></section>`,
    app: { screen: "universities", ctaText: "Üniversite menülerini uygulamada aç" },
    faq: [
      { q: "Hangi üniversitelerin menüsü ÖğrenciYemek'te var?", a: "Gazi, Hacettepe (Beytepe ve Sıhhiye) ve Ankara Üniversitesi (Ankü) menüleri günlük olarak uygulamada ve bu sitede yer alır." },
      ...others.map((u) => ({
        q: `${short(u)} yemek listesine nereden bakılır?`,
        a: `${u.name} yemek listesi resmi olarak ${host(u.menuUrl)} adresinde yayımlanır; bu sayfadaki bağlantıdan ulaşabilirsin.${u.note ? ` ${u.note}` : ""}`,
      })),
    ],
    related: [
      { href: "/gazi-universitesi-yemek-listesi/", text: "Gazi Üniversitesi yemek listesi" },
      { href: "/hacettepe-yemek-listesi/", text: "Hacettepe yemek listesi" },
      { href: "/ankara-universitesi-yemek-listesi/", text: "Ankara Üniversitesi yemek listesi" },
      { href: "/kyk-yemek-listesi/ankara/", text: "Ankara KYK yemek listesi" },
    ],
  };
}

function notFoundPage() {
  return {
    key: "404",
    path: "/404.html",
    file: "404.html",
    noindex: true,
    title: "Sayfa bulunamadı – ÖğrenciYemek",
    description: "Aradığın sayfa bulunamadı.",
    h1: "Sayfa bulunamadı",
    lead: "Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Aşağıdaki sayfalardan devam edebilirsin.",
    crumbs: [],
    body: "",
    app: { screen: null, ctaText: "ÖğrenciYemek uygulamasını aç" },
    related: [
      { href: "/kyk-yemek-listesi/", text: "KYK yemek listesi" },
      { href: "/ankara-universite-yemek-listeleri/", text: "Ankara üniversite yemek listeleri" },
      { href: "/ankara-ogrenci-ucretsiz-yemek/", text: "Ankara'da öğrencilere ücretsiz yemek" },
    ],
  };
}

/* ================================ Yazma ================================ */

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);

async function main() {
  const D = await loadAppData();
  const [kykToday, kykArchive, gazi, hu1, hu2, anku] = await Promise.all([
    safe("KYK bugün", () => fetchJson(`${KYK_API}/kyk_today.json`)),
    safe("KYK arşiv", () => fetchJson(`${KYK_API}/kyk_menus.json`)),
    safe("Gazi", () => fetchJson(`${UNI_API}/gazi.json`)),
    safe("Hacettepe Beytepe", () => fetchJson(`${UNI_API}/hacettepe-1.json`)),
    safe("Hacettepe Sıhhiye", () => fetchJson(`${UNI_API}/hacettepe-2.json`)),
    safe("Ankara Üniversitesi", () => fetchJson(`${UNI_API}/anku.json`)),
  ]);

  const kykAnkara = kykToday?.date === TODAY ? kykMeal(kykToday.menus?.ankara?.dinner) : kykMeal(kykArchive?.by_date?.[TODAY]?.ankara?.dinner);

  const pages = [
    ...(kykToday || kykArchive ? kykPages(D, kykToday, kykArchive) : []),
    gazi && gaziPage(D, gazi),
    (hu1 || hu2) && hacettepePage(D, hu1, hu2),
    anku && ankuPage(D, anku),
    genclikPage(D),
    cankayaGenclikPage(D),
    cankayaKentPage(D),
    etimesgutKentPage(D),
    milletPage(D),
    freeFoodHub(D, { kykAnkaraToday: kykAnkara?.items }),
    uniHub(D),
    notFoundPage(),
  ].filter(Boolean);

  const manifest = await readManifest();
  let written = 0;
  for (const page of pages) {
    const probe = renderPage(page, "0000-00-00");
    const h = hash(probe);
    const prev = manifest[page.path];
    const file = path.join(ROOT, page.file || path.join(page.path, "index.html"));
    let exists = true;
    try { await readFile(file); } catch { exists = false; }
    if (prev && prev.hash === h && exists) continue;
    const updated = TODAY;
    let html = renderPage(page, updated);
    if (page.noindex) html = html.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html, "utf8");
    manifest[page.path] = { hash: h, updated, noindex: !!page.noindex };
    written++;
  }

  // Ana sayfa: index.html değiştiyse lastmod güncellenir
  const indexHash = hash(await readFile(path.join(ROOT, "index.html"), "utf8"));
  if (manifest["/"]?.hash !== indexHash) manifest["/"] = { hash: indexHash, updated: TODAY };

  // Site haritası
  const urls = Object.entries(manifest)
    .filter(([, v]) => !v.noindex)
    .sort(([a], [b]) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
  const prio = (p) => (p === "/" ? "1.0" : /^\/kyk-yemek-listesi\/$|yemek-listesi\/$|ucretsiz/.test(p) && !/kyk-yemek-listesi\/[a-z]/.test(p) ? "0.9" : "0.7");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, v]) => `  <url>
    <loc>${SITE}${p}</loc>
    <lastmod>${v.updated}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${prio(p)}</priority>
  </url>`).join("\n")}
</urlset>
`;
  await writeFile(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
  await writeFile(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 1) + "\n", "utf8");
  log(`SEO: ${pages.length} sayfa üretildi, ${written} dosya değişti, site haritasında ${urls.length} adres.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
