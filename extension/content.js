let isRunning = false;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let floatUI = null;
function createFloatUI() {
  if (document.getElementById('gaetin-float-ui')) return;
  floatUI = document.createElement('div');
  floatUI.id = 'gaetin-float-ui';
  floatUI.style.cssText = `
    position: fixed; top: 24px; right: 24px; z-index: 999999;
    background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px);
    border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px;
    padding: 16px; width: 280px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    color: white; font-family: -apple-system, system-ui, sans-serif; display: none;
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
    document.getElementById('gf-status').textContent = 'Dibatalkan. Mengirim sisa data...';
    document.getElementById('gf-status').style.color = '#ef4444';
  });
}

function updateFloatUI(current, max, status) {
  if (!floatUI) return;
  floatUI.style.display = 'block';
  document.getElementById('gf-leads').textContent = `${current} tersimpan`;
  document.getElementById('gf-target').textContent = `Target: ${max}`;
  document.getElementById('gf-progress-fill').style.width = `${Math.min(100, (current / max) * 100)}%`;
  if (status) document.getElementById('gf-status').textContent = status;
}

function hideFloatUI() {
  if (floatUI) floatUI.style.display = 'none';
}

function parseCoords(url) {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return m ? { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) } : {};
}

// Wait for the detail panel to fully load after clicking a place.
// Uses URL change (SPA navigation) as Phase 1 signal, then polls for
// panel-specific data-item-id elements as Phase 2 confirmation.
async function waitForDetailPanel(maxMs) {
  const prevUrl = window.location.href;
  const start = Date.now();

  await sleep(150);

  // Phase 1 – wait for SPA navigation to /maps/place/ URL (typ. 200-500ms)
  while (Date.now() - start < 3000) {
    const cur = window.location.href;
    if (cur !== prevUrl && cur.includes('/maps/place/')) break;
    await sleep(100);
  }

  // Phase 2 – wait for contact/address items that ONLY appear in the detail panel
  // data-item-id="address" and data-item-id^="phone:tel:" are set by Maps on those buttons
  const phase2End = start + Math.min(maxMs, (Date.now() - start) + 3000);
  while (Date.now() < phase2End) {
    if (
      document.querySelector('[data-item-id^="phone:tel:"]') ||
      document.querySelector('[data-item-id="address"]')    ||
      document.querySelector('[data-item-id="authority"]')  ||
      document.querySelector('a[href^="tel:"]')
    ) {
      await sleep(100); // brief stabilisation
      return;
    }
    await sleep(100);
  }
  // Timeout – place may genuinely have no contact data; proceed anyway
}

// ── Extraction helpers ────────────────────────────────────────────────────────

function extractPhone() {
  // 1. data-item-id="phone:tel:+62xxx" – set directly by Google Maps
  const pid = document.querySelector('[data-item-id^="phone:tel:"]');
  if (pid) return pid.getAttribute('data-item-id').replace('phone:tel:', '').trim();

  // 2. Clickable tel: link
  const tel = document.querySelector('a[href^="tel:"]');
  if (tel) return decodeURIComponent(tel.href.replace('tel:', '')).trim();

  // 3. aria-label scan – handles "Telepon: 0811-xxx", "Phone: +62xxx", etc.
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Telepon|Phone|Nomor telepon|Call(?:\s+number)?):\s*(.+)/i);
    if (m) return m[1].trim();
    // Bare number (Indonesian format)
    if (/^(\+62|0)[\d\s\-\.]{8,}$/.test(lbl.trim())) return lbl.trim();
  }
  return null;
}

// Normalise to international digits without + : "628119001681"
function normalizePhone(raw) {
  if (!raw) return null;
  let d = raw.replace(/[\s\-\.\(\)]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return /^62\d{8,12}$/.test(d) ? d : null;
}

function extractWebsite() {
  // 1. data-item-id="authority" – the official website button
  const auth = document.querySelector('[data-item-id="authority"]');
  if (auth) return auth.getAttribute('href') || auth.textContent.trim() || null;

  // 2. aria-label scan
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Website|Situs\s*web|Web):\s*(.+)/i);
    if (m) return m[1].trim();
  }

  // 3. External link inside the main panel (exclude Google domains)
  const panel = document.querySelector('[role="main"]') || document.body;
  for (const a of panel.querySelectorAll('a[href^="http"]')) {
    const h = a.href;
    if (
      !h.includes('google.') &&
      !h.includes('goo.gl') &&
      !h.includes('googleapis.') &&
      !h.includes('maps.app')
    ) return h;
  }
  return null;
}

function extractAddress() {
  // 1. data-item-id="address"
  const el = document.querySelector('[data-item-id="address"]');
  if (el) {
    const lbl = el.getAttribute('aria-label') || '';
    const clean = lbl.replace(/^(?:Alamat|Address):\s*/i, '').trim();
    if (clean) return clean;
    const txt = el.textContent.replace(/\s+/g, ' ').trim();
    if (txt) return txt;
  }
  // 2. aria-label scan
  for (const el of document.querySelectorAll('[aria-label]')) {
    const lbl = el.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Alamat|Address):\s*(.+)/i);
    if (m) return m[1].trim();
  }
  return null;
}

function extractRatingAndReviews() {
  const span =
    document.querySelector('span[aria-label*="stars"]') ||
    document.querySelector('span[aria-label*="bintang"]');
  if (!span) return { rating: null, reviewCount: null };

  const lbl = span.getAttribute('aria-label') || '';
  const rm = lbl.match(/([\d,\.]+)\s*(?:bintang|stars)/i);
  const rating = rm ? parseFloat(rm[1].replace(',', '.')) : null;

  const container = span.closest('[data-value]') || span.parentElement?.parentElement;
  const txt = container?.textContent || span.parentElement?.textContent || '';
  const cm = txt.match(/\(([\d.,]+)\)/) || txt.match(/([\d.,]+)\s+(?:ulasan|reviews?)/i);
  const reviewCount = cm ? parseInt(cm[1].replace(/[.,]/g, ''), 10) : null;

  return { rating, reviewCount };
}

function extractCategory() {
  const btn = document.querySelector('button[jsaction*="pane.rating.category"]');
  return btn?.textContent.trim() || null;
}

// ── API ───────────────────────────────────────────────────────────────────────

async function sendToApi(jobId, currentLeads, isFinished, token) {
  if (currentLeads.length === 0 && !isFinished) return;
  try {
    const base = window.location.href.includes('localhost')
      ? 'http://localhost:3000'
      : 'https://gaetin.vercel.app';
    const res = await fetch(`${base}/api/scraper/extension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Extension-Token': token || '' },
      body: JSON.stringify({ jobId, leads: currentLeads, isFinished }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
  } catch (e) {
    console.error('[Gaetin] API error:', e.message);
  }
}

// ── Main scraper ──────────────────────────────────────────────────────────────

async function scrapeGoogleMaps(jobId, maxLeads, delaySec, token) {
  isRunning = true;
  createFloatUI();

  let totalSaved = 0;
  let chunkLeads = [];
  const processedUrls = new Set();

  const feed = document.querySelector('div[role="feed"]');
  if (!feed) throw new Error('Tidak menemukan daftar hasil. Pastikan Google Maps sudah menampilkan hasil pencarian.');

  // User-controlled delay: minimum 1.5s so Google has time to render the panel
  const maxWaitPerItem = Math.max(1500, delaySec * 1000);

  let noNewItemsCount = 0;

  const report = (msg) => {
    updateFloatUI(totalSaved + chunkLeads.length, maxLeads, msg);
    try { chrome.runtime.sendMessage({ type: 'SCRAPE_PROGRESS', current: totalSaved + chunkLeads.length, max: maxLeads, status: msg }); } catch(e) {}
  };

  report('Memindai daftar bisnis...');

  while (isRunning && (totalSaved + chunkLeads.length) < maxLeads && noNewItemsCount < 3) {
    const links = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'));
    const newLinks = links.filter(a => !processedUrls.has(a.href));

    if (newLinks.length === 0) {
      report('Menggulir halaman...');
      feed.scrollTo(0, feed.scrollHeight);
      await sleep(2500);

      const txt = feed.innerText.toLowerCase();
      if (
        txt.includes("you've reached the end") ||
        txt.includes('mencapai akhir daftar') ||
        txt.includes('sudah berada di') ||
        txt.includes('no more results')
      ) { report('Akhir daftar.'); break; }

      noNewItemsCount++;
      continue;
    }

    noNewItemsCount = 0;

    for (const link of newLinks) {
      if (!isRunning || (totalSaved + chunkLeads.length) >= maxLeads) break;
      processedUrls.add(link.href);

      const idx = totalSaved + chunkLeads.length + 1;
      report(`Memuat detail #${idx}...`);

      link.scrollIntoView({ block: 'center' });
      await sleep(150);
      link.click();

      // Dynamic wait: Phase 1 = URL change, Phase 2 = detail data elements
      await waitForDetailPanel(maxWaitPerItem);

      try {
        const businessName =
          link.getAttribute('aria-label')?.trim() ||
          document.querySelector('h1')?.innerText?.trim() ||
          'Tanpa nama';

        const phone   = normalizePhone(extractPhone());
        const website = extractWebsite();
        const address = extractAddress();
        const { rating, reviewCount } = extractRatingAndReviews();
        const category = extractCategory();
        const coords  = parseCoords(window.location.href);

        chunkLeads.push({ businessName, phone, website, address, category, rating, reviewCount, ...coords });
        report(`OK: ${businessName}${phone ? ' · ' + phone : ''}`);

        if (chunkLeads.length >= 5) {
          await sendToApi(jobId, [...chunkLeads], false, token);
          totalSaved += chunkLeads.length;
          chunkLeads = [];
        }
      } catch (e) {
        console.error('[Gaetin] Parse error:', e);
      }
    }
  }

  report('Menyelesaikan...');
  await sendToApi(jobId, [...chunkLeads], true, token);
  totalSaved += chunkLeads.length;

  hideFloatUI();
  return totalSaved;
}

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_SCRAPE') {
    if (isRunning) { sendResponse({ success: false, error: 'Sudah berjalan!' }); return true; }
    sendResponse({ success: true });

    scrapeGoogleMaps(request.jobId, request.maxLeads || 100, request.delaySec || 2, request.token || '')
      .then(count => {
        isRunning = false;
        try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: true, message: `Sukses: ${count} lead tersimpan.` }); } catch(e) {}
      })
      .catch(err => {
        isRunning = false;
        hideFloatUI();
        try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: false, message: `Error: ${err.message}` }); } catch(e) {}
      });
    return true;
  }

  if (request.action === 'STOP_SCRAPE') {
    isRunning = false;
    sendResponse({ success: true });
    return true;
  }
});

// ── Auto-start ────────────────────────────────────────────────────────────────

(function checkAutoStart() {
  const params   = new URLSearchParams(window.location.search);
  const isAuto   = params.get('gaetin_auto') === 'true';
  const jobId    = params.get('gaetin_job_id');
  const token    = params.get('gaetin_token') || '';
  const maxLeads = parseInt(params.get('gaetin_max'))   || 100;
  const delaySec = parseFloat(params.get('gaetin_delay')) || 2;

  if (!isAuto || !jobId) return;

  chrome.storage.local.set({ gaetinSessionKey: `${jobId}:${token}`, gaetinMaxLeads: maxLeads, gaetinDelay: delaySec });

  let attempts = 0;
  const waitForFeed = setInterval(() => {
    attempts++;
    if (document.querySelector('div[role="feed"]')) {
      clearInterval(waitForFeed);

      scrapeGoogleMaps(jobId, maxLeads, delaySec, token)
        .then(count => {
          isRunning = false;
          createFloatUI();
          if (floatUI) floatUI.style.display = 'block';
          const statusEl = document.getElementById('gf-status');
          const leadsEl  = document.getElementById('gf-leads');
          if (leadsEl) leadsEl.textContent = `${count} tersimpan`;

          let sec = 5;
          const countdown = setInterval(() => {
            if (statusEl) { statusEl.textContent = `Sukses! Menutup dalam ${sec} detik...`; statusEl.style.color = '#10b981'; }
            sec--;
            if (sec < 0) { clearInterval(countdown); window.close(); }
          }, 1000);
        })
        .catch(err => {
          isRunning = false;
          createFloatUI();
          if (floatUI) floatUI.style.display = 'block';
          const statusEl = document.getElementById('gf-status');
          if (statusEl) { statusEl.textContent = `Error: ${err.message}`; statusEl.style.color = '#ef4444'; }
        });
    } else if (attempts > 30) clearInterval(waitForFeed);
  }, 1000);
})();
