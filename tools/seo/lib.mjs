// SEO sayfa üreticisi — ortak yardımcılar ve sayfa iskeleti (bağımlılık yok)

export const SITE = "https://ogrenciyemek.com";
export const SEO_CSS_VERSION = "6";

const UA = "Mozilla/5.0 (compatible; ogrenciyemek-seo/1.0; +https://ogrenciyemek.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------- Ağ ------------------------------- */

export async function fetchText(url, { attempts = 3, timeout = 25000 } = {}) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept-Language": "tr-TR,tr;q=0.9" },
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      last = e;
      if (i < attempts) await sleep(i * 2000);
    }
  }
  throw new Error(`${last?.message || last} <- ${url}`);
}

export async function fetchJson(url, opts) {
  return JSON.parse(await fetchText(url, opts));
}

/* ------------------------------- Metin ------------------------------- */

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const clean = (s) => String(s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();

export function decodeEntities(s) {
  const map = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => map[n.toLowerCase()] ?? m);
}

// "İNEGÖL KÖFTE+PATATES" → "İnegöl Köfte + Patates" (yalnızca tamamı büyük harfse)
export function niceCase(s) {
  const t = clean(s);
  if (!t || t !== t.toLocaleUpperCase("tr")) return t;
  return t
    .toLocaleLowerCase("tr")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/(^|[\s(/+-])(\p{L})/gu, (m, p, c) => p + c.toLocaleUpperCase("tr"));
}

/* ------------------------------- Tarih ------------------------------- */

export const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
export const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export function istanbulNow() {
  // "YYYY-MM-DD HH:MM" İstanbul saatiyle
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date()).map((x) => [x.type, x.value])
  );
  return { iso: `${p.year}-${p.month}-${p.day}`, hm: `${p.hour === "24" ? "00" : p.hour}:${p.minute}` };
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const weekday = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();

export function trDate(iso, { day = true, year = true } = {}) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}${year ? ` ${y}` : ""}${day ? ` ${DAYS[weekday(iso)]}` : ""}`;
}

export function mondayOf(iso) {
  const wd = weekday(iso) || 7;
  return addDays(iso, -(wd - 1));
}

// Google ~155-160 karakterden sonrasını keser: kelime sınırında kırp, "…" ekle
export function clampText(s, max = 155) {
  const t = clean(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:–-]+$/, "") + "…";
}

/* ------------------------------- Sayfa iskeleti ------------------------------- */

const COUNTERS = `
<script data-goatcounter="https://beratorkune.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="0fcc0f5a-49ce-4bdb-88b7-55492e04d394" data-exclude-search="true" data-exclude-hash="true"></script>`;

export function faqHtml(faq) {
  if (!faq?.length) return "";
  return `
<section class="s-sec" aria-labelledby="sss">
  <h2 id="sss">Sık sorulan sorular</h2>
  <div class="s-faq">
${faq.map((f) => `    <details><summary>${esc(f.q)}</summary><p>${f.aHtml || esc(f.a)}</p></details>`).join("\n")}
  </div>
</section>`;
}

export function relatedHtml(links) {
  if (!links?.length) return "";
  return `
<section class="s-sec" aria-labelledby="ilgili">
  <h2 id="ilgili">İlgili sayfalar</h2>
  <ul class="s-links">
${links.map((l) => `    <li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join("\n")}
  </ul>
</section>`;
}

// page: { path, title, description, h1, lead, crumbs:[{name,path}], body, faq, related, app:{screen,label}, schema:[...] }
// updatedIso: "YYYY-MM-DD" — içerik en son ne zaman değişti
export function renderPage(page, updatedIso) {
  const url = SITE + page.path;
  page = { ...page, description: clampText(page.description, 155) };
  const crumbs = [{ name: "Ana sayfa", path: "/" }, ...(page.crumbs || [])];

  const graph = [
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url,
      name: page.title,
      description: page.description,
      inLanguage: "tr-TR",
      isPartOf: { "@id": SITE + "/#website" },
      dateModified: updatedIso,
      breadcrumb: { "@id": url + "#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumb",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: SITE + c.path })),
    },
  ];
  if (page.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  (page.schema || []).forEach((s) => graph.push(s));
  const jsonld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  const appHref = page.app?.screen ? `/?ekran=${encodeURIComponent(page.app.screen)}` : "/";

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="#15102b">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ÖğrenciYemek">
<meta property="og:locale" content="tr_TR">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${SITE}/icons/og-image.png?v=15">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icons/favicon.ico?v=15" sizes="any">
<link rel="icon" href="/icons/favicon-32.png?v=15" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=15">
<link rel="manifest" href="/manifest.json?v=15">
<link rel="stylesheet" href="/seo/seo.css?v=${SEO_CSS_VERSION}">
<script type="application/ld+json">${jsonld}</script>
</head>
<body>
<header class="s-top">
  <a class="s-brand" href="/"><img src="/icons/icon-192.png?v=15" width="30" height="30" alt="">ÖğrenciYemek</a>
  <a class="s-open" href="${appHref}">${esc(page.app?.label || "Uygulamada aç")}</a>
</header>
<main class="s-main">
<nav class="s-crumbs" aria-label="Sayfa yolu">${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<span aria-current="page">${esc(c.name)}</span>` : `<a href="${esc(c.path)}">${esc(c.name)}</a>`))
    .join('<span class="s-sep" aria-hidden="true">›</span>')}</nav>
<h1>${esc(page.h1)}</h1>
<p class="s-lead">${page.leadHtml || esc(page.lead)}</p>
<p class="s-updated">Son güncelleme: <time datetime="${updatedIso}">${esc(trDate(updatedIso, { day: false }))}</time></p>
${page.body || ""}
<a class="s-cta" href="${appHref}">📲 ${esc(page.app?.ctaText || "ÖğrenciYemek uygulamasında aç")}</a>
${faqHtml(page.faq)}
${relatedHtml(page.related)}
</main>
<footer class="s-foot">
  <p><strong>ÖğrenciYemek</strong> bağımsız bir öğrenci projesidir; üniversitelerin, KYK'nın veya belediyelerin resmi sitesi değildir.
  Menüler ilgili kurumların yayımladığı listelerden derlenir ve değişebilir; kesin bilgi için resmi kaynağa bakın.</p>
  <p><a href="/">Ana sayfa</a> · <a href="/kyk-yemek-listesi/">KYK yemek listesi</a> · <a href="/kyk-yemek-listesi/ankara/">KYK menü Ankara</a> · <a href="/gazi-universitesi-yemek-listesi/">Gazi yemek listesi</a> · <a href="/hacettepe-yemek-listesi/">Hacettepe yemek listesi</a> · <a href="/ankara-universitesi-yemek-listesi/">Ankara Üniversitesi yemek listesi</a> · <a href="/genclik-sofrasi/">Gençlik Sofrası menü</a> · <a href="/ankara-ogrenci-ucretsiz-yemek/">Ücretsiz yemek</a> · <a href="https://www.instagram.com/ogrenciyemek.com_/" rel="noopener">Instagram</a></p>
</footer>${COUNTERS}
</body>
</html>
`;
}
