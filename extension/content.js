let isRunning = false;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const G = (...a) => console.log('%c[Gaetin]', 'color:#10b981;font-weight:bold', ...a);
G('content.js v3 loaded ✓', new Date().toLocaleTimeString());

// ── Float UI ──────────────────────────────────────────────────────────────────

let floatUI = null;
function createFloatUI() {
  if (document.getElementById('gaetin-float-ui')) {
    floatUI = document.getElementById('gaetin-float-ui');
    return;
  }
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
      <div id="gf-progress-fill" style="height:100%;background:#10b981;width:0%;transition:width 0.3s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:16px;font-variant-numeric:tabular-nums;">
      <span id="gf-leads">0 tersimpan</span>
      <span id="gf-target">Target: 100</span>
    </div>
    <button id="gf-stop-btn" style="width:100%;padding:10px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;">Batalkan & Simpan</button>
  `;
  document.body.appendChild(floatUI);
  document.getElementById('gf-stop-btn').addEventListener('click', () => {
    isRunning = false;
    setFloatStatus('Dibatalkan, menyimpan data...', '#ef4444');
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
  const fillEl = document.getElementById('gf-progress-fill');
  if (leadsEl) leadsEl.textContent = `${current} tersimpan`;
  if (targetEl) targetEl.textContent = `Target: ${max}`;
  if (fillEl) fillEl.style.width = `${Math.min(100, (current / max) * 100)}%`;
  if (status) setFloatStatus(status);
}
function hideFloatUI() { if (floatUI) floatUI.style.display = 'none'; }

// ── Coords ────────────────────────────────────────────────────────────────────

function parseCoords(url) {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return m ? { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) } : {};
}

// ── Navigation helpers ────────────────────────────────────────────────────────

// Go back to the search list view. Returns true if successful.
async function ensureListView() {
  if (!window.location.href.includes('/maps/place/')) return true;
  G('history.back() → list view');
  history.back();
  const end = Date.now() + 2000;
  while (Date.now() < end) {
    if (!window.location.href.includes('/maps/place/')) {
      await sleep(400); // let DOM re-render
      return true;
    }
    await sleep(100);
  }
  G('back() timeout — still on place URL');
  return false;
}

// Wait for the feed element to be present and contain links
async function waitForFeed(maxMs = 5000) {
  const end = Date.now() + maxMs;
  while (Date.now() < end) {
    const feed = document.querySelector('div[role="feed"]');
    if (feed && feed.querySelectorAll('a[href*="/maps/place/"]').length > 0) return feed;
    await sleep(200);
  }
  return null;
}

// ── Detail panel wait ─────────────────────────────────────────────────────────

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
  for (const sel of ['[role="main"]', '[role="region"]']) {
    const found = document.querySelector(sel);
    if (found && found.scrollHeight > found.clientHeight + 30) return found;
  }
  return null;
}

async function waitForDetailPanel(maxMs, placeUrl) {
  const start = Date.now();
  await sleep(200);

  // Phase 1: wait for URL to change to this place
  G('P1: waiting for URL change...');
  while (Date.now() - start < 4000) {
    if (window.location.href.includes('/maps/place/') &&
        (!placeUrl || window.location.href.startsWith(placeUrl.substring(0, 60)))) break;
    await sleep(100);
  }
  G('P1 URL:', window.location.href.substring(35, 75));

  // Phase 2: wait for h1
  const h1End = Date.now() + 2500;
  while (Date.now() < h1End) {
    if (document.querySelector('h1')?.textContent?.trim()) break;
    await sleep(100);
  }
  G('P2 h1:', document.querySelector('h1')?.textContent?.trim() || '(none)');

  // Phase 3: scroll detail panel to trigger lazy rendering of phone/address
  const scroller = getDetailScroller();
  if (scroller) {
    G('P3: scroll', scroller.tagName, 'scrollH=', scroller.scrollHeight);
    scroller.scrollTop = 600;
    await sleep(400);
    scroller.scrollTop = 0;
  } else {
    await sleep(600);
  }

  // Phase 4: poll for contact data or timeout
  const p4end = Date.now() + Math.max(500, start + maxMs - Date.now());
  while (Date.now() < p4end) {
    if (hasContactData()) { G('P4: contact data found'); await sleep(100); return; }
    await sleep(120);
  }
  G('P4: timeout — proceeding with text scan');
}

// ── Text-node scanner ─────────────────────────────────────────────────────────

function panelTextNodes() {
  const panel = document.querySelector('[role="main"]') ||
                document.querySelector('h1')?.closest('div[class]') ||
                document.body;
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
      G('phone via text scan', t);
      return t;
    }
  }

  G('phone: NOT FOUND');
  return null;
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
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Website|Situs\s*web|Web):\s*(.+)/i);
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
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Alamat|Address):\s*(.+)/i);
    if (m) { G('address via aria-label'); return m[1].trim(); }
  }

  // Text-node scan — word-bounded patterns to avoid false positives
  for (const t of panelTextNodes()) {
    if (
      t.length > 20 && t.length < 250 &&
      /(?:Jl\.\s|(?<![a-z])Jalan\s|Gg\.\s|RT\s*\d|RW\s*\d|Kec\.\s|Kecamatan\s|Kel\.\s|Kelurahan\s|Dusun\s|Desa\s|Kabupaten\s|Perumahan\s|Komplek\s)/i.test(t) &&
      !/^(?:Buka|Tutup|Rating|Rp|Harga|Sebagian|Konfirmasi)/i.test(t) &&
      !/perjalanan|penelusuran|gmail\.com|google\.com/i.test(t)
    ) { G('address via text scan', t.substring(0, 50)); return t; }
  }

  G('address: NOT FOUND');
  return null;
}

function extractRatingAndReviews() {
  // Scope to detail panel only — avoid reading feed list ratings
  const panel = document.querySelector('[role="main"]');
  const scope = panel || document;
  const span = scope.querySelector('span[aria-label*="stars"]') ||
               scope.querySelector('span[aria-label*="bintang"]');
  if (!span) return { rating: null, reviewCount: null };

  const lbl = span.getAttribute('aria-label') || '';
  const rm = lbl.match(/([\d,\.]+)\s*(?:bintang|stars)/i);
  const rating = rm ? parseFloat(rm[1].replace(',', '.')) : null;

  const container = span.closest('[data-value]') || span.parentElement?.parentElement;
  const txt = container?.textContent || span.parentElement?.textContent || '';
  const cm = txt.match(/\(([\d.,]+)\)/) || txt.match(/([\d.,]+)\s+(?:ulasan|reviews?)/i);
  const reviewCount = cm ? parseInt(cm[1].replace(/[.,]/g, ''), 10) : null;

  G('rating:', rating, 'reviews:', reviewCount);
  return { rating, reviewCount };
}

function extractCategory() {
  const btn = document.querySelector('button[jsaction*="pane.rating.category"]');
  if (btn?.textContent?.trim()) return btn.textContent.trim();

  // Fallback: button near rating area
  const panel = document.querySelector('[role="main"]');
  if (panel) {
    for (const btn of panel.querySelectorAll('button')) {
      const t = btn.textContent?.trim();
      if (t && t.length > 2 && t.length < 40 && !/\d/.test(t) &&
          !/(Rute|Simpan|Bagikan|Ulasan|Foto|Lihat|Klik|Tambah|Menu|Buka|Tutup)/i.test(t)) {
        return t;
      }
    }
  }
  return null;
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
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      G(`API ERROR ${res.status}:`, txt);
      return;
    }
    const json = await res.json();
    G('API OK:', json.added, 'added');
  } catch (e) {
    G('sendToApi FAILED:', e.message);
  }
}

// ── Main scraper ──────────────────────────────────────────────────────────────

async function scrapeGoogleMaps(jobId, maxLeads, delaySec, token) {
  isRunning = true;
  createFloatUI();
  if (floatUI) floatUI.style.display = 'block';

  let totalSaved = 0;
  let chunkLeads = [];
  const processedUrls = new Set();
  const maxWaitPerItem = Math.max(2500, delaySec * 1000);
  let noNewCount = 0;

  const report = (msg) => {
    updateFloatUI(totalSaved + chunkLeads.length, maxLeads, msg);
    try { chrome.runtime.sendMessage({ type: 'SCRAPE_PROGRESS', current: totalSaved + chunkLeads.length, max: maxLeads, status: msg }); } catch (_) {}
  };

  // ── ONE ITEM PER LOOP ITERATION ──────────────────────────────────────────
  // Each iteration: ensure list view → re-query feed → click fresh link → extract
  // This avoids stale DOM references (root cause of same-data-for-all bug).

  while (isRunning && (totalSaved + chunkLeads.length) < maxLeads && noNewCount < 4) {

    // 1. Return to list view if we're on a detail panel
    const onDetail = window.location.href.includes('/maps/place/');
    if (onDetail) {
      report('Kembali ke daftar...');
      await ensureListView();
    }

    // 2. Get the feed — fresh reference every iteration
    const feed = await waitForFeed(3000);
    if (!feed) {
      G('Feed not found after wait');
      noNewCount++;
      await sleep(500);
      continue;
    }

    // 3. Find next unprocessed link — fresh query every iteration
    const allLinks = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'));
    const nextLink = allLinks.find(a => a.href && !processedUrls.has(a.href));

    if (!nextLink) {
      // Scroll to load more results
      report('Menggulir untuk memuat lebih...');
      feed.scrollTo(0, feed.scrollHeight);
      await sleep(2500);
      const txt = (feed.innerText || '').toLowerCase();
      if (txt.includes("you've reached the end") || txt.includes('mencapai akhir') ||
          txt.includes('sudah berada') || txt.includes('no more results')) {
        G('End of list');
        report('Akhir daftar');
        break;
      }
      noNewCount++;
      continue;
    }

    noNewCount = 0;
    processedUrls.add(nextLink.href);
    const idx = totalSaved + chunkLeads.length + 1;
    const linkLabel = nextLink.getAttribute('aria-label') || `item #${idx}`;
    report(`Membuka ${linkLabel}...`);
    G(`#${idx} clicking: ${linkLabel}`);

    // 4. Click to open detail panel
    nextLink.scrollIntoView({ block: 'center' });
    await sleep(200);
    nextLink.click();

    // 5. Wait for detail panel to fully load
    await waitForDetailPanel(maxWaitPerItem, nextLink.href);

    // 6. Extract all data
    try {
      const businessName = nextLink.getAttribute('aria-label')?.trim() ||
                           document.querySelector('h1')?.innerText?.trim() ||
                           'Tanpa nama';
      const phone        = normalizePhone(extractPhone());
      const website      = extractWebsite();
      const address      = extractAddress();
      const { rating, reviewCount } = extractRatingAndReviews();
      const category     = extractCategory();
      const coords       = parseCoords(window.location.href);

      G(`✓ ${businessName} | phone=${phone || '-'} | addr=${(address || '-').substring(0, 35)}`);
      chunkLeads.push({ businessName, phone, website, address, category, rating, reviewCount, ...coords });
      report(`${phone ? '✓' : '○'} ${businessName}`);

      // Send batch every 5 items
      if (chunkLeads.length >= 5) {
        await sendToApi(jobId, [...chunkLeads], false, token);
        totalSaved += chunkLeads.length;
        chunkLeads = [];
      }
    } catch (e) {
      G('Parse error:', e.message);
    }
  }

  // Send remaining leads + mark job finished
  report('Menyelesaikan...');
  await sendToApi(jobId, [...chunkLeads], true, token);
  totalSaved += chunkLeads.length;

  hideFloatUI();
  G(`Done! Total: ${totalSaved} leads`);
  try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: true, message: `Selesai: ${totalSaved} lead tersimpan.` }); } catch (_) {}
  return totalSaved;
}

// ── Message listener (popup-triggered) ───────────────────────────────────────

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'START_SCRAPE') {
    if (isRunning) { sendResponse({ success: false, error: 'Sudah berjalan!' }); return true; }
    sendResponse({ success: true });
    scrapeGoogleMaps(request.jobId, request.maxLeads || 100, request.delaySec || 2, request.token || '')
      .then(() => { isRunning = false; })
      .catch(err => {
        isRunning = false; hideFloatUI();
        try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: false, message: `Error: ${err.message}` }); } catch (_) {}
      });
    return true;
  }
  if (request.action === 'STOP_SCRAPE') { isRunning = false; sendResponse({ success: true }); return true; }
});

// ── Auto-start (dashboard-triggered) ─────────────────────────────────────────

(function checkAutoStart() {
  const params   = new URLSearchParams(window.location.search);
  const isAuto   = params.get('gaetin_auto') === 'true';
  const jobId    = params.get('gaetin_job_id');
  const token    = params.get('gaetin_token') || '';
  const maxLeads = parseInt(params.get('gaetin_max')) || 100;
  const delaySec = parseFloat(params.get('gaetin_delay')) || 2;

  if (!isAuto || !jobId) return;

  G('Auto-start detected, jobId:', jobId);
  chrome.storage.local.set({ gaetinSessionKey: `${jobId}:${token}`, gaetinMaxLeads: maxLeads, gaetinDelay: delaySec });

  createFloatUI();
  if (floatUI) floatUI.style.display = 'block';
  setFloatStatus('Menunggu hasil pencarian...', '#94a3b8');

  // Wait up to 15s for the feed to appear (Google Maps search takes time)
  let attempts = 0;
  const waitForFeedInterval = setInterval(async () => {
    attempts++;
    const feed = document.querySelector('div[role="feed"]');
    if (feed && feed.querySelectorAll('a[href*="/maps/place/"]').length > 0) {
      clearInterval(waitForFeedInterval);
      G('Feed ready, starting auto-scrape');
      setFloatStatus('Memulai ekstraksi...', '#10b981');

      try {
        const count = await scrapeGoogleMaps(jobId, maxLeads, delaySec, token);
        isRunning = false;

        // Show completion and auto-close after 4 seconds
        createFloatUI();
        if (floatUI) floatUI.style.display = 'block';
        setFloatStatus(`Selesai! ${count} lead. Menutup...`, '#10b981');
        updateFloatUI(count, maxLeads, `Selesai! ${count} lead. Menutup...`);

        let sec = 4;
        const countdown = setInterval(() => {
          setFloatStatus(`Selesai! Menutup dalam ${sec} detik...`, '#10b981');
          if (--sec < 0) { clearInterval(countdown); window.close(); }
        }, 1000);
      } catch (err) {
        G('Auto-scrape error:', err.message);
        setFloatStatus(`Error: ${err.message}`, '#ef4444');
      }
    } else if (attempts > 15) {
      clearInterval(waitForFeedInterval);
      G('Timeout: feed not found after 15s');
      setFloatStatus('Timeout: hasil pencarian tidak muncul', '#ef4444');
    }
  }, 1000);
})();
