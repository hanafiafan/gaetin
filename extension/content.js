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
    transition: opacity 0.3s ease;
  `;
  floatUI.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
      <img src="${chrome.runtime.getURL('icon48.png')}" style="width: 36px; height: 36px; border-radius: 8px;" alt="G">
      <div style="flex: 1; overflow: hidden;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Gaetin Extractor</div>
        <div style="font-size: 11px; color: #10b981; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="gf-status">Menjalankan...</div>
      </div>
    </div>
    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
      <div id="gf-progress-fill" style="height: 100%; background: #10b981; width: 0%; transition: width 0.3s ease;"></div>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 16px; font-variant-numeric: tabular-nums;">
      <span id="gf-leads">0 tersimpan</span>
      <span id="gf-target">Target: 100</span>
    </div>
    <button id="gf-stop-btn" style="width: 100%; padding: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 12px;">Batalkan & Simpan</button>
  `;
  document.body.appendChild(floatUI);

  document.getElementById('gf-stop-btn').addEventListener('click', () => {
    isRunning = false;
    document.getElementById('gf-status').textContent = "Dibatalkan user. Mengirim sisa data...";
    document.getElementById('gf-status').style.color = "#ef4444";
  });
}

function updateFloatUI(current, max, status) {
  if (!floatUI) return;
  floatUI.style.display = 'block';
  document.getElementById('gf-leads').textContent = `${current} tersimpan`;
  document.getElementById('gf-target').textContent = `Target: ${max}`;
  const pct = Math.min(100, (current / max) * 100);
  document.getElementById('gf-progress-fill').style.width = `${pct}%`;
  if (status) document.getElementById('gf-status').textContent = status;
}

function hideFloatUI() {
  if (floatUI) floatUI.style.display = 'none';
}

function parseCoords(url) {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return m ? { latitude: parseFloat(m[1]), longitude: parseFloat(m[2]) } : {};
}

// Wait for the detail panel to finish loading.
// Detects [data-item-id] elements which only appear when content is rendered.
// Falls back to fixed timeout if detection fails.
async function waitForPanelData(maxMs) {
  const prevTitle = document.querySelector('h1')?.textContent?.trim() || '';
  await sleep(500); // minimum: let click register and navigation start
  const start = Date.now();
  while (Date.now() - start < maxMs - 500) {
    const curTitle = document.querySelector('h1')?.textContent?.trim() || '';
    const hasData = document.querySelector('[data-item-id]') !== null;
    // Panel is ready when title changed (new place loaded) and data items appeared
    if (hasData && curTitle !== prevTitle) {
      await sleep(200); // brief stabilization
      return;
    }
    // Fallback: panel has data even if title didn't change (e.g. same-named place)
    if (hasData && Date.now() - start > maxMs * 0.6) {
      await sleep(200);
      return;
    }
    await sleep(150);
  }
  // Timeout: proceed with whatever is in the DOM
}

// Extract phone — tries three strategies in order of reliability
function extractPhone() {
  // 1. data-item-id="phone:tel:+628xxx" — most reliable, set by Maps itself
  const el = document.querySelector('[data-item-id^="phone:tel:"]');
  if (el) return el.getAttribute('data-item-id').replace('phone:tel:', '').trim();

  // 2. Clickable tel: hyperlink
  const link = document.querySelector('a[href^="tel:"]');
  if (link) return decodeURIComponent(link.href.replace('tel:', '')).trim();

  // 3. aria-label scan: "Telepon: 0811-xxx" or "Phone: +62xxx"
  for (const node of document.querySelectorAll('[aria-label]')) {
    const lbl = node.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Telepon|Phone|Nomor telepon|Call(?:\s+number)?):\s*(.+)/i);
    if (m) return m[1].trim();
    // Bare phone number as aria-label (Indonesian format)
    if (/^(\+62|0)[\d\s\-\.]{8,}$/.test(lbl.trim())) return lbl.trim();
  }
  return null;
}

// Normalize phone to digits-only local format (0xxx) for CRM consistency
function normalizePhone(raw) {
  if (!raw) return null;
  let d = raw.replace(/[\s\-\.\(\)]/g, '');
  if (d.startsWith('+62')) d = '0' + d.slice(3);
  else if (/^62\d{9,}/.test(d)) d = '0' + d.slice(2);
  return d.length >= 9 ? d : null;
}

// Extract website — tries authority link first, then aria-label, then external links
function extractWebsite() {
  // 1. data-item-id="authority" — official website link button
  const auth = document.querySelector('[data-item-id="authority"]');
  if (auth) return auth.getAttribute('href') || auth.textContent.trim() || null;

  // 2. aria-label: "Website: https://..." or "Situs web: ..."
  for (const node of document.querySelectorAll('[aria-label]')) {
    const lbl = node.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Website|Situs\s*web|Web):\s*(.+)/i);
    if (m) return m[1].trim();
  }

  // 3. External links in the panel (exclude all Google domains)
  const panel = document.querySelector('[role="main"]') || document.body;
  for (const a of panel.querySelectorAll('a[href^="http"]')) {
    const h = a.href;
    if (!h.includes('google.') && !h.includes('goo.gl') && !h.includes('googleapis.') && !h.includes('maps.app')) {
      return h;
    }
  }
  return null;
}

// Extract address — data-item-id="address" first, then aria-label scan
function extractAddress() {
  const el = document.querySelector('[data-item-id="address"]');
  if (el) {
    const lbl = el.getAttribute('aria-label') || '';
    const cleaned = lbl.replace(/^(?:Alamat|Address):\s*/i, '').trim();
    if (cleaned) return cleaned;
    // Fallback to textContent (normalize whitespace)
    const txt = el.textContent.replace(/\s+/g, ' ').trim();
    if (txt) return txt;
  }

  for (const node of document.querySelectorAll('[aria-label]')) {
    const lbl = node.getAttribute('aria-label') || '';
    const m = lbl.match(/^(?:Alamat|Address):\s*(.+)/i);
    if (m) return m[1].trim();
  }
  return null;
}

// Extract rating and review count from aria-label
function extractRatingAndReviews() {
  const span = document.querySelector('span[aria-label*="stars"]') ||
               document.querySelector('span[aria-label*="bintang"]');
  if (!span) return { rating: null, reviewCount: null };

  const lbl = span.getAttribute('aria-label') || '';
  // "4,9 bintang" or "4.9 stars"
  const rm = lbl.match(/([\d,\.]+)\s*(?:bintang|stars)/i);
  const rating = rm ? parseFloat(rm[1].replace(',', '.')) : null;

  // Review count: look for "(3.089)" or "3,089 reviews" in surrounding text
  const container = span.closest('[data-value]') || span.parentElement?.parentElement;
  const txt = container?.textContent || span.parentElement?.textContent || '';
  const cm = txt.match(/\(([\d.,]+)\)/) || txt.match(/([\d.,]+)\s+(?:ulasan|reviews?)/i);
  const reviewCount = cm ? parseInt(cm[1].replace(/[.,]/g, ''), 10) : null;

  return { rating, reviewCount };
}

// Extract business category from Maps category button
function extractCategory() {
  const btn = document.querySelector('button[jsaction*="pane.rating.category"]');
  if (btn) return btn.textContent.trim() || null;
  // Fallback: span with data-value that looks like a category (no digits)
  const spans = document.querySelectorAll('span[jsan]');
  for (const s of spans) {
    const t = s.textContent.trim();
    if (t && t.length < 50 && !/\d/.test(t) && !/^(Rp|Rating|Buka|Tutup)/i.test(t)) {
      return t;
    }
  }
  return null;
}

async function sendToApi(jobId, currentLeads, isFinished, token) {
  if (currentLeads.length === 0 && !isFinished) return;
  try {
    const base = window.location.href.includes('localhost')
      ? 'http://localhost:3000'
      : 'https://gaetin.vercel.app';
    const res = await fetch(`${base}/api/scraper/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Token': token || '',
      },
      body: JSON.stringify({ jobId, leads: currentLeads, isFinished })
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
  } catch (e) {
    console.error('Koneksi API gagal: ', e.message);
  }
}

async function scrapeGoogleMaps(jobId, maxLeads, delaySec, token) {
  isRunning = true;
  createFloatUI();

  let totalSaved = 0;
  let chunkLeads = [];
  const processedUrls = new Set();

  const feed = document.querySelector('div[role="feed"]');
  if (!feed) throw new Error('Tidak menemukan daftar hasil pencarian. Harap cari sesuatu dulu di Maps.');

  // delaySec is the user-controlled wait per item; minimum 1.5s regardless
  const waitPerItem = Math.max(1500, delaySec * 1000);

  let noNewItemsCount = 0;

  const reportProgress = (statusMsg) => {
    updateFloatUI(totalSaved + chunkLeads.length, maxLeads, statusMsg);
    try {
      chrome.runtime.sendMessage({
        type: 'SCRAPE_PROGRESS',
        current: totalSaved + chunkLeads.length,
        max: maxLeads,
        status: statusMsg
      });
    } catch(e) {}
  };

  reportProgress("Memindai daftar bisnis...");

  while (isRunning && (totalSaved + chunkLeads.length) < maxLeads && noNewItemsCount < 3) {
    const links = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'));
    const newLinks = links.filter(a => !processedUrls.has(a.href));

    if (newLinks.length === 0) {
      reportProgress("Menggulir halaman ke bawah...");
      feed.scrollTo(0, feed.scrollHeight);
      await sleep(2500);

      const textLower = feed.innerText.toLowerCase();
      if (
        textLower.includes("you've reached the end of the list") ||
        textLower.includes("mencapai akhir daftar") ||
        textLower.includes("sudah berada di dasar") ||
        textLower.includes("sudah berada di akhir") ||
        textLower.includes("no more results")
      ) {
        reportProgress("Mencapai akhir daftar.");
        break;
      }

      noNewItemsCount++;
      continue;
    }

    noNewItemsCount = 0;

    for (const link of newLinks) {
      if (!isRunning || (totalSaved + chunkLeads.length) >= maxLeads) break;
      processedUrls.add(link.href);

      reportProgress(`Mengekstrak ke-${totalSaved + chunkLeads.length + 1}...`);

      link.scrollIntoView({ block: 'center' });
      await sleep(200);
      link.click();

      // Dynamic wait: returns as soon as panel data is ready, capped at waitPerItem
      await waitForPanelData(waitPerItem);

      try {
        const businessName =
          link.getAttribute('aria-label')?.trim() ||
          document.querySelector('h1')?.innerText?.trim() ||
          'Tanpa nama';

        const phone = normalizePhone(extractPhone());
        const website = extractWebsite();
        const address = extractAddress();
        const { rating, reviewCount } = extractRatingAndReviews();
        const category = extractCategory();
        const coords = parseCoords(window.location.href);

        chunkLeads.push({ businessName, phone, website, address, category, rating, reviewCount, ...coords });
        reportProgress(`OK: ${businessName}`);

        if (chunkLeads.length >= 5) {
          await sendToApi(jobId, [...chunkLeads], false, token);
          totalSaved += chunkLeads.length;
          chunkLeads = [];
        }
      } catch (e) {
        console.error('Error parsing place', e);
      }
    }
  }

  reportProgress('Menyelesaikan proses...');
  await sendToApi(jobId, [...chunkLeads], true, token);
  totalSaved += chunkLeads.length;

  hideFloatUI();
  return totalSaved;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_SCRAPE') {
    if (isRunning) {
      sendResponse({ success: false, error: 'Proses scraping sedang berjalan!' });
      return true;
    }
    sendResponse({ success: true });

    scrapeGoogleMaps(request.jobId, request.maxLeads || 100, request.delaySec || 2, request.token || '')
      .then(count => {
        isRunning = false;
        try { chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: true, message: `Sukses menyimpan ${count} leads ke Gaetin CRM!` }); } catch(e) {}
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

// AUTO-START LOGIC
(function checkAutoStart() {
  const params = new URLSearchParams(window.location.search);
  const isAuto = params.get('gaetin_auto') === 'true';
  const jobId = params.get('gaetin_job_id');
  const token = params.get('gaetin_token') || '';
  const maxLeads = parseInt(params.get('gaetin_max')) || 100;
  const delaySec = parseFloat(params.get('gaetin_delay')) || 2;

  if (isAuto && jobId) {
    chrome.storage.local.set({ gaetinSessionKey: `${jobId}:${token}`, gaetinMaxLeads: maxLeads, gaetinDelay: delaySec });

    let checkAttempts = 0;
    const waitForFeed = setInterval(() => {
      checkAttempts++;
      if (document.querySelector('div[role="feed"]')) {
        clearInterval(waitForFeed);

        scrapeGoogleMaps(jobId, maxLeads, delaySec, token)
          .then(count => {
            isRunning = false;
            createFloatUI();
            if (floatUI) floatUI.style.display = 'block';
            let secondsLeft = 5;
            const statusEl = document.getElementById('gf-status');
            const leadsEl = document.getElementById('gf-leads');
            if (leadsEl) leadsEl.textContent = `${count} tersimpan`;

            const countdownInterval = setInterval(() => {
              if (statusEl) {
                statusEl.textContent = `Sukses! Menutup tab dalam ${secondsLeft} detik...`;
                statusEl.style.color = '#10b981';
              }
              secondsLeft--;
              if (secondsLeft < 0) {
                clearInterval(countdownInterval);
                window.close();
              }
            }, 1000);
          })
          .catch(err => {
            isRunning = false;
            createFloatUI();
            if (floatUI) floatUI.style.display = 'block';
            const statusEl = document.getElementById('gf-status');
            if (statusEl) {
              statusEl.textContent = `Error: ${err.message}`;
              statusEl.style.color = '#ef4444';
            }
          });
      } else if (checkAttempts > 30) {
        clearInterval(waitForFeed);
      }
    }, 1000);
  }
})();
