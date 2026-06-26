const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const G = (...a) => console.log('%c[Gaetin]', 'color:#10b981;font-weight:bold', ...a);
G('content.js v4 loaded ✓', new Date().toLocaleTimeString());

// ── Float UI ──────────────────────────────────────────────────────────────────

let floatUI = null;
function createFloatUI() {
  if (document.getElementById('gaetin-float-ui')) { floatUI = document.getElementById('gaetin-float-ui'); return; }
  floatUI = document.createElement('div');
  floatUI.id = 'gaetin-float-ui';
  floatUI.style.cssText = `
    position:fixed;top:24px;right:24px;z-index:999999;
    background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);
    border:1px solid rgba(16,185,129,0.3);border-radius:12px;
    padding:16px;width:280px;box-shadow:0 20px 40px -10px rgba(0,0,0,0.5);
    color:white;font-family:-apple-system,system-ui,sans-serif;display:none;
  `;
  floatUI.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <img src="${chrome.runtime.getURL('icon48.png')}" style="width:36px;height:36px;border-radius:8px;" alt="G">
      <div style="flex:1;overflow:hidden;">
        <div style="font-weight:600;font-size:14px;margin-bottom:2px;">Gaetin Extractor</div>
        <div id="gf-status" style="font-size:11px;color:#10b981;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Menjalankan...</div>
      </div>
    </div>
    <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;margin-bottom:8px;">
      <div id="gf-fill" style="height:100%;background:#10b981;width:0%;transition:width 0.3s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:16px;font-variant-numeric:tabular-nums;">
      <span id="gf-leads">0 tersimpan</span>
      <span id="gf-target">Target: -</span>
    </div>
    <button id="gf-stop" style="width:100%;padding:10px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;">Batalkan</button>
  `;
  document.body.appendChild(floatUI);
  document.getElementById('gf-stop').addEventListener('click', async () => {
    const d = await storageGet(['gaetinJob', 'gaetinChunk']);
    if (d.gaetinJob) {
      setFloatStatus('Membatalkan...', '#ef4444');
      await sendToApi(d.gaetinJob.jobId, d.gaetinChunk || [], true, d.gaetinJob.token);
    }
    await chrome.storage.local.remove(['gaetinJob', 'gaetinQueue', 'gaetinPhase', 'gaetinSaved', 'gaetinChunk']);
    window.close();
  });
}
function setFloatStatus(msg, color = '#10b981') {
  if (!floatUI) return;
  floatUI.style.display = 'block';
  const el = document.getElementById('gf-status');
  if (el) { el.textContent = msg; el.style.color = color; }
}
function updateFloatUI(current, max, status) {
  if (!floatUI) return;
  floatUI.style.display = 'block';
  const leadsEl = document.getElementById('gf-leads');
  const targetEl = document.getElementById('gf-target');
  const fillEl = document.getElementById('gf-fill');
  if (leadsEl) leadsEl.textContent = `${current} tersimpan`;
  if (targetEl) targetEl.textContent = `Target: ${max}`;
  if (fillEl) fillEl.style.width = `${Math.min(100, (current / max) * 100)}%`;
  if (status) setFloatStatus(status);
}

// ── Storage helpers ───────────────────────────────────────────────────────────

function storageGet(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}
function storageSet(obj) {
  return new Promise(resolve => chrome.storage.local.set(obj, resolve));
}
function storageRemove(keys) {
  return new Promise(resolve => chrome.storage.local.remove(keys, resolve));
}

// ── Coords ────────────────────────────────────────────────────────────────────

function parseCoords(url) {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return m ? { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) } : {};
}

// ── Detail panel helpers ──────────────────────────────────────────────────────

function hasContactData() {
  return !!(
    document.querySelector('a[href^="tel:"]') ||
    document.querySelector('[data-item-id^="phone:tel:"]') ||
    document.querySelector('[data-item-id="address"]')
  );
}

function getDetailScroller() {
  const h1 = document.querySelector('h1');
  if (!h1) return null;
  let el = h1.parentElement;
  for (let i = 0; i < 12; i++) {
    if (!el || el === document.body) break;
    const { overflowY, overflow } = window.getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll') &&
        el.scrollHeight > el.clientHeight + 30) return el;
    el = el.parentElement;
  }
  return document.querySelector('[role="main"]') || null;
}

async function waitForContent(maxMs = 5000) {
  const end = Date.now() + maxMs;
  // Phase 1: wait for h1
  while (Date.now() < end) {
    if (document.querySelector('h1')?.textContent?.trim()) break;
    await sleep(150);
  }
  G('h1:', document.querySelector('h1')?.textContent?.trim() || '(none)');

  // Phase 2: scroll to trigger lazy content
  const scroller = getDetailScroller();
  if (scroller) { scroller.scrollTop = 800; await sleep(600); scroller.scrollTop = 0; await sleep(200); }
  else await sleep(800);

  // Phase 3: poll for contact data
  const p3end = Date.now() + Math.min(3000, end - Date.now());
  while (Date.now() < p3end) {
    if (hasContactData()) { G('contact data found'); await sleep(100); return; }
    await sleep(150);
  }

  // Retry scroll once more
  if (scroller) { scroller.scrollTop = 1200; await sleep(500); scroller.scrollTop = 400; await sleep(300); }
  G('waitForContent done (timeout)');
}

// ── Text scan ─────────────────────────────────────────────────────────────────

function panelTextNodes() {
  const panel = document.querySelector('[role="main"]') || document.querySelector('h1')?.closest('div[class]') || document.body;
  const results = [];
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent.trim();
    if (t) results.push(t);
  }
  return results;
}

// ── Extractors ────────────────────────────────────────────────────────────────

function extractPhone() {
  const tel = document.querySelector('a[href^="tel:"]');
  if (tel) { G('phone via tel:', tel.href); return decodeURIComponent(tel.href.replace('tel:', '')).trim(); }

  const pid = document.querySelector('[data-item-id^="phone:tel:"]');
  if (pid) { G('phone via data-item-id'); return pid.getAttribute('data-item-id').replace('phone:tel:', '').trim(); }

  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Telepon|Phone|Nomor(?:\s*telepon)?|Hubungi|Tel)[:.\s]+(.+)/i);
    if (m) { G('phone via aria-label'); return m[1].trim(); }
    if (/^(\+62|0)[2-9][\d\s\-\.]{7,}$/.test(lbl.trim())) { G('phone via aria bare'); return lbl.trim(); }
  }

  for (const t of panelTextNodes()) {
    if (/^(?:\+?62|0)[2-9][\d\-\s]{7,12}$/.test(t) && t.replace(/\D/g, '').length >= 9) {
      G('phone via text scan', t); return t;
    }
  }
  G('phone: NOT FOUND'); return null;
}

function normalizePhone(raw) {
  if (!raw) return null;
  let d = raw.replace(/[\s\-\.\(\)]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return /^62\d{8,12}$/.test(d) ? d : null;
}

function extractWebsite() {
  const auth = document.querySelector('[data-item-id="authority"]');
  if (auth) return auth.getAttribute('href') || auth.textContent.trim() || null;
  for (const el of document.querySelectorAll('[aria-label]')) {
    const m = (el.getAttribute('aria-label') || '').match(/^(?:Website|Situs\s*web|Web):\s*(.+)/i);
    if (m) return m[1].trim();
  }
  const panel = document.querySelector('[role="main"]') || document.body;
  for (const a of panel.querySelectorAll('a[href^="http"]')) {
    const h = a.href;
    if (!h.includes('google.') && !h.includes('goo.gl') && !h.includes('googleapis.') && !h.includes('maps.app')) return h;
  }
  return null;
}

function extractAddress() {
  const el = document.querySelector('[data-item-id="address"]');
  if (el) {
    const lbl = (el.getAttribute('aria-label') || '').replace(/^(?:Alamat|Address):\s*/i, '').trim();
    if (lbl) { G('address via data-item-id'); return lbl; }
    const txt = el.textContent.replace(/\s+/g, ' ').trim();
    if (txt) return txt;
  }
  for (const el of document.querySelectorAll('[aria-label]')) {
    const m = (el.getAttribute('aria-label') || '').match(/^(?:Alamat|Address):\s*(.+)/i);
    if (m) { G('address via aria-label'); return m[1].trim(); }
  }
  for (const t of panelTextNodes()) {
    if (
      t.length > 20 && t.length < 250 &&
      /(?:Jl\.\s|(?<![a-z])Jalan\s|Gg\.\s|RT\s*\d|RW\s*\d|Kec\.\s|Kecamatan\s|Kel\.\s|Dusun\s|Desa\s|Kabupaten\s|Perumahan\s|Komplek\s)/i.test(t) &&
      !/^(?:Buka|Tutup|Rating|Rp|Sebagian|Konfirmasi)/i.test(t) &&
      !/perjalanan|penelusuran|gmail\.com|google\.com/i.test(t)
    ) { G('address via text scan', t.substring(0, 50)); return t; }
  }
  G('address: NOT FOUND'); return null;
}

function extractRatingAndReviews() {
  const ratingBtn = document.querySelector('button[jsaction*="pane.rating"]');
  if (ratingBtn) {
    const lbl = ratingBtn.getAttribute('aria-label') || '';
    const rm = lbl.match(/([\d,\.]+)\s*(?:bintang|stars)/i);
    const cm = lbl.match(/\(([\d.,]+)\)/) || lbl.match(/([\d.,]+)\s*(?:ulasan|reviews?)/i);
    if (rm) {
      return { rating: parseFloat(rm[1].replace(',', '.')), reviewCount: cm ? parseInt(cm[1].replace(/[.,]/g, ''), 10) : null };
    }
    for (const span of ratingBtn.querySelectorAll('span[aria-label]')) {
      const slbl = span.getAttribute('aria-label') || '';
      const srm = slbl.match(/([\d,\.]+)\s*(?:bintang|stars)/i);
      if (srm) {
        const reviewSpan = ratingBtn.querySelector('span[aria-label*="ulasan"]') || ratingBtn.querySelector('span[aria-label*="review"]');
        const reviewCount = reviewSpan ? parseInt((reviewSpan.getAttribute('aria-label') || '').replace(/\D/g, ''), 10) : null;
        return { rating: parseFloat(srm[1].replace(',', '.')), reviewCount };
      }
    }
  }
  const h1 = document.querySelector('h1');
  let el = h1?.parentElement;
  for (let i = 0; i < 8 && el && el !== document.body; i++) {
    const span = el.querySelector('span[aria-label*="bintang"]') || el.querySelector('span[aria-label*="stars"]');
    if (span) {
      const rm = (span.getAttribute('aria-label') || '').match(/([\d,\.]+)\s*(?:bintang|stars)/i);
      if (rm) {
        const reviewSpan = el.querySelector('span[aria-label*="ulasan"]') || el.querySelector('span[aria-label*="review"]');
        const reviewCount = reviewSpan ? parseInt((reviewSpan.getAttribute('aria-label') || '').replace(/\D/g, ''), 10) : null;
        return { rating: parseFloat(rm[1].replace(',', '.')), reviewCount };
      }
    }
    el = el.parentElement;
  }
  return { rating: null, reviewCount: null };
}

function extractCategory() {
  for (const sel of ['button[jsaction*="pane.heroHeader.category"]', 'button[jsaction*="pane.rating.category"]', 'button[jsaction*="pane.widgetHeader.category"]']) {
    const t = document.querySelector(sel)?.textContent?.trim();
    if (t && !/Harga|Rp|\$|€|£|\d/i.test(t)) return t;
  }
  const h1 = document.querySelector('h1');
  let el = h1?.parentElement;
  for (let i = 0; i < 5 && el && el !== document.body; i++) {
    for (const btn of el.querySelectorAll('button, a[href*="category"]')) {
      const t = btn.textContent?.trim();
      if (!t || t.length < 3 || t.length > 60) continue;
      if (/Harga|Rp|\$|€|Rute|Simpan|Bagikan|Ulasan|Foto|Lihat|Tambah|Menu|Buka|Tutup|Pesan|Kirim|Mulai|Cari|\d/i.test(t)) continue;
      if (/[↑→↓↔▲▼]/.test(t)) continue;
      return t;
    }
    el = el.parentElement;
  }
  return null;
}

function extractMapsUrl() {
  return window.location.href.split('?')[0] || null;
}

function extractPlusCode() {
  for (const el of document.querySelectorAll('[data-item-id]')) {
    const id = el.getAttribute('data-item-id') || '';
    if (id === 'oloc' || id.startsWith('plus_code')) {
      const lbl = el.getAttribute('aria-label') || el.textContent?.trim() || '';
      const m = lbl.match(/([A-Z0-9]{4,}\+[A-Z0-9]{2,})/);
      if (m) return m[1];
    }
  }
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/([A-Z0-9]{4,}\+[A-Z0-9]{2,})/);
    if (m) return m[1];
  }
  for (const t of panelTextNodes()) {
    const m = t.match(/^([A-Z0-9]{4,8}\+[A-Z0-9]{2,4})$/);
    if (m) return m[1];
  }
  return null;
}

function extractPriceRange() {
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    if (/harga|price range/i.test(lbl)) {
      const m = lbl.match(/(?:Harga|Price range)[:\s]+(.+)/i);
      if (m) return m[1].trim();
    }
    // Dollar/rupiah signs pattern
    if (/^(Rp|[\$€£]{1,4}|Murah|Sedang|Mahal)/i.test(lbl.trim()) && lbl.length < 40) return lbl.trim();
  }
  for (const btn of document.querySelectorAll('button')) {
    const t = (btn.textContent || '').trim();
    if (/^[\$€£]{1,4}$/.test(t) || /^Rp\s*[\d·]+/.test(t)) return t;
  }
  return null;
}

function extractOpeningHours() {
  // Look for the hours table button/section
  const hoursBtn = document.querySelector('[data-item-id="oh"] table') ||
    document.querySelector('table[aria-label*="jam"]') ||
    document.querySelector('table[aria-label*="hour"]') ||
    document.querySelector('table[aria-label*="buka"]');
  if (hoursBtn) {
    const rows = hoursBtn.querySelectorAll('tr');
    const hours = {};
    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      if (cells.length >= 2) {
        const day = cells[0].textContent?.trim();
        const time = cells[1].textContent?.trim();
        if (day && time) hours[day] = time;
      }
    }
    if (Object.keys(hours).length > 0) return hours;
  }
  // Fallback: find expandable hours section
  for (const el of document.querySelectorAll('[jsaction*="openhours"], [jsaction*="hours"]')) {
    const rows = el.querySelectorAll('tr');
    const hours = {};
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const day = cells[0].textContent?.trim();
        const time = cells[1].textContent?.trim();
        if (day && time && day.length < 15) hours[day] = time;
      }
    }
    if (Object.keys(hours).length > 0) return hours;
  }
  return null;
}

function extractServiceOptions() {
  const options = [];
  // Common service option selectors in Google Maps
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    if (/^(Makan di tempat|Dine.?in|Takeout|Bawa pulang|Delivery|Pengiriman|Pesan antar|Tanpa kontak|Pesan meja|No.contact delivery|Reservasi|Pemesanan|Drive.?through|Kunjungi|In.store|Online care|Online appointment)/i.test(lbl.trim())) {
      if (!options.includes(lbl.trim())) options.push(lbl.trim());
    }
  }
  // Also look in text nodes around the service section
  const panel = document.querySelector('[role="main"]') || document.body;
  for (const el of panel.querySelectorAll('span, li, div')) {
    const t = (el.textContent || '').trim();
    if (t.length < 60 && /^(Makan di tempat|Dine.?in|Takeout|Bawa pulang|Delivery|Pengiriman|No.contact|Drive.?through)/i.test(t)) {
      if (!options.includes(t)) options.push(t);
    }
  }
  return options.length > 0 ? options : null;
}

function extractAmenities() {
  const amenities = [];
  const keywords = /Wi.?Fi|Parkir|Parking|Tempat Duduk|Seating|Aksesibilitas|Accessible|Toilet|Kamar Mandi|Restroom|AC|Rooftop|Outdoor|Indoor|Smoking|Non-smoking|Halal|Kasir|Credit Card|Kartu Kredit|QRIS|GoPay|OVO|Dana|ShopeePay/i;
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    if (keywords.test(lbl) && lbl.length < 80 && !amenities.includes(lbl.trim())) {
      amenities.push(lbl.trim());
    }
  }
  return amenities.length > 0 ? amenities : null;
}

function extractDescription() {
  // Look for editorial summary / description
  for (const el of document.querySelectorAll('[data-attrid*="description"], [jsaction*="description"]')) {
    const t = el.textContent?.trim();
    if (t && t.length > 20 && t.length < 2000) return t;
  }
  // Aria-label description patterns
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    if (/^(Deskripsi|Description|Tentang|About):\s*/i.test(lbl)) {
      return lbl.replace(/^(Deskripsi|Description|Tentang|About):\s*/i, '').trim();
    }
  }
  return null;
}

function extractTopReviews() {
  const reviews = [];
  // Review cards in Google Maps detail panel
  for (const el of document.querySelectorAll('[data-review-id], [jsaction*="review"]')) {
    const text = el.querySelector('[data-expandable-section] span, .MyEned span, span[jsan]')?.textContent?.trim();
    const author = el.querySelector('[class*="author"], [class*="name"]')?.textContent?.trim() ||
      el.querySelector('button[aria-label]')?.getAttribute('aria-label') || '';
    const ratingEl = el.querySelector('[aria-label*="bintang"], [aria-label*="star"]');
    const rating = ratingEl ? parseFloat((ratingEl.getAttribute('aria-label') || '').replace(/[^\d.]/g, '')) : null;
    if (text && text.length > 5) {
      reviews.push({ author: author || null, rating: rating || null, text });
      if (reviews.length >= 5) break;
    }
  }
  return reviews.length > 0 ? reviews : null;
}

function extractPhotos() {
  const urls = [];
  const seen = new Set();
  for (const img of document.querySelectorAll('img[src*="googleusercontent"], img[src*="lh3.google"]')) {
    const src = img.src;
    if (!src || seen.has(src)) continue;
    // Skip icons/avatars (small images)
    if (img.naturalWidth && img.naturalWidth < 100) continue;
    seen.add(src);
    // Convert to full-size URL by removing size constraints
    const fullUrl = src.replace(/=s\d+-[^&]+/, '=s1600').replace(/=w\d+-h\d+/, '=s1600');
    urls.push(fullUrl);
    if (urls.length >= 5) break;
  }
  return urls.length > 0 ? urls : null;
}

// ── Extractor bundle ──────────────────────────────────────────────────────────

function extractCurrentPlace(ariaLabel, dataFields) {
  const fields = dataFields ? new Set(dataFields) : null;
  const want = (f) => !fields || fields.has(f);

  const rawLabel = (ariaLabel || '').replace(/[··]\s*(Link yang dikunjungi|Baru dikunjungi|Recently visited)/gi, '').trim();
  const businessName = rawLabel || document.querySelector('h1')?.innerText?.trim() || 'Tanpa nama';

  const phone = want('phone') ? normalizePhone(extractPhone()) : null;
  const website = want('website') ? extractWebsite() : null;
  const address = want('address') ? extractAddress() : null;
  const { rating, reviewCount } = want('rating') ? extractRatingAndReviews() : { rating: null, reviewCount: null };
  const category = want('category') ? extractCategory() : null;
  const coords = want('coordinates') ? parseCoords(window.location.href) : {};
  const mapsUrl = want('mapsUrl') ? extractMapsUrl() : null;
  const plusCode = want('plusCode') ? extractPlusCode() : null;
  const priceRange = want('priceRange') ? extractPriceRange() : null;
  const openingHours = want('openingHours') ? extractOpeningHours() : null;
  const serviceOptions = want('serviceOptions') ? extractServiceOptions() : null;
  const amenities = want('amenities') ? extractAmenities() : null;
  const description = want('description') ? extractDescription() : null;
  const topReviews = want('reviews') ? extractTopReviews() : null;
  const photos = want('photos') ? extractPhotos() : null;

  G(`✓ ${businessName} | phone=${phone || '-'} | addr=${(address || '-').substring(0, 35)}`);
  return {
    businessName, phone, website, address, category, rating, reviewCount,
    ...coords,
    mapsUrl, plusCode, priceRange, openingHours, serviceOptions,
    amenities, description, topReviews, photos,
  };
}

// ── API ───────────────────────────────────────────────────────────────────────

async function sendToApi(jobId, leads, isFinished, token) {
  if (leads.length === 0 && !isFinished) return;
  try {
    G(`sendToApi: ${leads.length} leads, finished=${isFinished}`);
    const res = await fetch('https://gaetin.vercel.app/api/scraper/extension', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Extension-Token': token || '' },
      body: JSON.stringify({ jobId, leads, isFinished }),
    });
    if (!res.ok) { G(`API ERROR ${res.status}:`, await res.text().catch(() => '')); return; }
    G('API OK:', (await res.json()).added, 'added');
  } catch (e) { G('sendToApi FAILED:', e.message); }
}

// ── Feed URL collector (used by auto-start) ───────────────────────────────────

async function collectFeedUrls(maxCount) {
  // Wait up to 10s for feed to appear
  let feed = null;
  for (let i = 0; i < 20; i++) {
    feed = document.querySelector('div[role="feed"]');
    if (feed && feed.querySelectorAll('a[href*="/maps/place/"]').length > 0) break;
    await sleep(500);
  }
  if (!feed) { G('Feed not found'); return []; }

  const urls = new Set();
  let stuckRounds = 0;

  while (urls.size < maxCount && stuckRounds < 3) {
    const prev = urls.size;
    for (const a of feed.querySelectorAll('a[href*="/maps/place/"]')) {
      if (a.href) urls.add(a.href);
    }
    G(`Collected ${urls.size} URLs so far`);
    if (urls.size >= maxCount) break;
    if (urls.size === prev) { stuckRounds++; } else { stuckRounds = 0; }

    const txt = (feed.innerText || '').toLowerCase();
    if (txt.includes("you've reached the end") || txt.includes('mencapai akhir') || txt.includes('no more results')) break;

    feed.scrollTo(0, feed.scrollHeight);
    await sleep(2000);
  }

  return [...urls].slice(0, maxCount);
}

// ── Popup-triggered scraper (SPA click mode) ──────────────────────────────────

let isRunning = false;

async function scrapeGoogleMaps(jobId, maxLeads, delaySec, token) {
  isRunning = true;
  createFloatUI();
  floatUI.style.display = 'block';

  let totalSaved = 0;
  let chunkLeads = [];
  const processedUrls = new Set();
  let noNewCount = 0;

  const report = (msg) => {
    updateFloatUI(totalSaved + chunkLeads.length, maxLeads, msg);
    try { chrome.runtime.sendMessage({ type: 'SCRAPE_PROGRESS', current: totalSaved + chunkLeads.length, max: maxLeads, status: msg }); } catch (_) {}
  };

  while (isRunning && (totalSaved + chunkLeads.length) < maxLeads && noNewCount < 4) {
    // Ensure list view
    if (window.location.href.includes('/maps/place/')) {
      report('Kembali ke daftar...');
      history.back();
      const end = Date.now() + 2000;
      while (Date.now() < end) { if (!window.location.href.includes('/maps/place/')) break; await sleep(100); }
      await sleep(500);
    }

    // Re-query feed each iteration
    let feed = null;
    for (let i = 0; i < 6; i++) {
      feed = document.querySelector('div[role="feed"]');
      if (feed && feed.querySelectorAll('a[href*="/maps/place/"]').length > 0) break;
      await sleep(500);
    }
    if (!feed) { noNewCount++; continue; }

    const allLinks = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'));
    const nextLink = allLinks.find(a => a.href && !processedUrls.has(a.href));

    if (!nextLink) {
      feed.scrollTo(0, feed.scrollHeight);
      await sleep(2500);
      const txt = (feed.innerText || '').toLowerCase();
      if (txt.includes("you've reached the end") || txt.includes('mencapai akhir') || txt.includes('no more results')) break;
      noNewCount++;
      continue;
    }

    noNewCount = 0;
    processedUrls.add(nextLink.href);
    const idx = totalSaved + chunkLeads.length + 1;
    report(`Membuka #${idx}...`);
    G(`#${idx} clicking: ${nextLink.getAttribute('aria-label') || 'item'}`);

    nextLink.scrollIntoView({ block: 'center' });
    await sleep(300);
    nextLink.click();

    // Wait for URL to change to this place
    const clickEnd = Date.now() + 4000;
    const expectedPrefix = nextLink.href.substring(0, 55);
    while (Date.now() < clickEnd) {
      if (window.location.href.startsWith(expectedPrefix)) break;
      await sleep(100);
    }

    if (!window.location.href.startsWith(expectedPrefix)) {
      G('Click did not navigate, skipping');
      continue;
    }

    await waitForContent(4000);

    try {
      const lead = extractCurrentPlace(nextLink.getAttribute('aria-label') || '');
      if (!lead.phone && !lead.address && !lead.website) {
        report(`⊘ ${lead.businessName} (dilewati)`);
      } else {
        chunkLeads.push(lead);
        report(`${lead.phone ? '✓' : '○'} ${lead.businessName}`);
        if (chunkLeads.length >= 5) {
          await sendToApi(jobId, [...chunkLeads], false, token);
          totalSaved += chunkLeads.length;
          chunkLeads = [];
        }
      }
    } catch (e) { G('Extract error:', e.message); }

    await sleep(delaySec * 1000);
  }

  report('Menyelesaikan...');
  await sendToApi(jobId, [...chunkLeads], true, token);
  totalSaved += chunkLeads.length;
  floatUI.style.display = 'none';
  G(`Popup mode done: ${totalSaved} leads`);
  try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: true, message: `Selesai: ${totalSaved} lead tersimpan.` }); } catch (_) {}
  return totalSaved;
}

// ── Message listener (popup mode) ────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'START_SCRAPE') {
    if (isRunning) { sendResponse({ success: false, error: 'Sudah berjalan!' }); return true; }
    sendResponse({ success: true });
    scrapeGoogleMaps(request.jobId, request.maxLeads || 100, request.delaySec || 2, request.token || '')
      .then(() => { isRunning = false; })
      .catch(err => {
        isRunning = false;
        try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: false, message: `Error: ${err.message}` }); } catch (_) {}
      });
    return true;
  }
  if (request.action === 'STOP_SCRAPE') { isRunning = false; sendResponse({ success: true }); return true; }
});

// ── AUTO MODE: Phase 2 — process one place per page load ─────────────────────
// Each time Maps loads a /maps/place/ URL, this runs, extracts data,
// saves to storage, then navigates to the next URL in the queue.
// This eliminates SPA click issues by using full page reloads.

(async function processScrapeQueue() {
  if (!window.location.href.includes('/maps/place/')) return;

  const data = await storageGet(['gaetinJob', 'gaetinQueue', 'gaetinPhase', 'gaetinSaved', 'gaetinChunk', 'gaetinCurrentLabel']);
  if (!data.gaetinJob || data.gaetinPhase !== 'scraping') return;

  const { jobId, token, maxLeads, delaySec, dataFields } = data.gaetinJob;
  const queue = data.gaetinQueue || [];
  const saved = data.gaetinSaved || 0;
  const chunk = data.gaetinChunk || [];
  const ariaLabel = data.gaetinCurrentLabel || '';

  createFloatUI();
  floatUI.style.display = 'block';
  updateFloatUI(saved + chunk.length, maxLeads, `Mengekstrak #${saved + chunk.length + 1}...`);

  // Wait for the detail panel to fully load
  await waitForContent(6000);

  // Extract data
  const lead = extractCurrentPlace(ariaLabel, dataFields);
  const newChunk = [...chunk];
  if (lead.phone || lead.address || lead.website) {
    newChunk.push(lead);
    updateFloatUI(saved + newChunk.length, maxLeads, `${lead.phone ? '✓' : '○'} ${lead.businessName}`);
  } else {
    updateFloatUI(saved + newChunk.length, maxLeads, `⊘ ${lead.businessName} (dilewati)`);
  }

  // Send batch every 5 items
  let newSaved = saved;
  let finalChunk = newChunk;
  if (newChunk.length >= 5) {
    await sendToApi(jobId, newChunk, false, token);
    newSaved += newChunk.length;
    finalChunk = [];
  }

  const totalDone = newSaved + finalChunk.length;

  // Navigate to next place OR finish
  if (queue.length > 0 && totalDone < maxLeads) {
    const [nextUrl, ...restQueue] = queue;
    // Store next item's aria-label (it's in the URL as the place name)
    const labelFromUrl = decodeURIComponent((nextUrl.match(/\/maps\/place\/([^/@]+)/) || [])[1] || '').replace(/\+/g, ' ');

    await storageSet({ gaetinQueue: restQueue, gaetinSaved: newSaved, gaetinChunk: finalChunk, gaetinCurrentLabel: labelFromUrl });
    await sleep(Math.max(1500, delaySec * 1000));
    window.location.href = nextUrl;
  } else {
    // Done — send remaining + mark finished
    setFloatStatus(`Menyelesaikan...`);
    await sendToApi(jobId, finalChunk, true, token);
    await storageRemove(['gaetinJob', 'gaetinQueue', 'gaetinPhase', 'gaetinSaved', 'gaetinChunk', 'gaetinCurrentLabel']);

    const total = newSaved + finalChunk.length;
    setFloatStatus(`Selesai! ${total} lead tersimpan. Menutup...`, '#10b981');
    updateFloatUI(total, maxLeads, `Selesai! ${total} lead. Menutup...`);

    let sec = 4;
    const cd = setInterval(() => {
      setFloatStatus(`Selesai! Menutup dalam ${sec} detik...`, '#10b981');
      if (--sec < 0) { clearInterval(cd); window.close(); }
    }, 1000);
  }
})();

// ── AUTO MODE: Phase 1 — collect URLs then start queue ───────────────────────

(async function checkAutoStart() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('gaetin_auto') !== 'true') return;

  const jobId    = params.get('gaetin_job_id');
  const token    = params.get('gaetin_token') || '';
  const maxLeads = parseInt(params.get('gaetin_max')) || 100;
  const delaySec = parseFloat(params.get('gaetin_delay')) || 2;
  const dataFields = params.get('gaetin_fields') ? params.get('gaetin_fields').split(',').filter(Boolean) : null;

  if (!jobId) return;
  G('Auto-start phase 1: collecting URLs. jobId:', jobId);

  await storageSet({ gaetinJob: { jobId, token, maxLeads, delaySec, dataFields }, gaetinPhase: 'collecting', gaetinSaved: 0, gaetinChunk: [], gaetinQueue: [] });

  createFloatUI();
  floatUI.style.display = 'block';
  setFloatStatus('Mengumpulkan daftar bisnis...', '#94a3b8');

  const urls = await collectFeedUrls(maxLeads);
  G('Collected', urls.length, 'place URLs');

  if (urls.length === 0) {
    setFloatStatus('Tidak ada hasil ditemukan', '#ef4444');
    return;
  }

  setFloatStatus(`${urls.length} bisnis ditemukan. Memulai...`, '#10b981');
  updateFloatUI(0, maxLeads, `${urls.length} bisnis ditemukan`);

  const [firstUrl, ...restQueue] = urls;
  const labelFromUrl = decodeURIComponent((firstUrl.match(/\/maps\/place\/([^/@]+)/) || [])[1] || '').replace(/\+/g, ' ');

  await storageSet({ gaetinPhase: 'scraping', gaetinQueue: restQueue, gaetinCurrentLabel: labelFromUrl });
  await sleep(800);
  window.location.href = firstUrl;
})();
