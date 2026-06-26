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

async function sendToApi(jobId, currentLeads, isFinished) {
  if (currentLeads.length === 0 && !isFinished) return;
  try {
    const url = "https://gaetin.vercel.app/api/scraper/extension";
    const targetUrl = window.location.href.includes('localhost') ? 'http://localhost:3000/api/scraper/extension' : url;
    
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, leads: currentLeads, isFinished })
    });
    
    if (!res.ok) throw new Error('API menolak request');
  } catch (e) {
    console.error('Koneksi API gagal: ', e.message);
  }
}

async function scrapeGoogleMaps(jobId, maxLeads, delaySec) {
  isRunning = true;
  createFloatUI();
  
  let totalSaved = 0;
  let chunkLeads = [];
  const processedUrls = new Set();
  
  let feed = document.querySelector('div[role="feed"]');
  if (!feed) {
    throw new Error('Tidak menemukan daftar hasil pencarian. Harap cari sesuatu dulu di Maps.');
  }

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
      const endText = textLower.includes("you've reached the end of the list") || 
                      textLower.includes("mencapai akhir daftar") || 
                      textLower.includes("sudah berada di dasar") ||
                      textLower.includes("sudah berada di akhir") ||
                      textLower.includes("no more results");
      
      if (endText) {
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

      reportProgress(`Mengekstrak data ke-${totalSaved + chunkLeads.length + 1}...`);
      
      link.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(300);

      link.click();
      await sleep(delaySec * 1000); 

      try {
        const h1 = document.querySelector('h1');
        const businessName = h1 ? h1.innerText.trim() : 'Tanpa nama';

        const buttons = Array.from(document.querySelectorAll('button[aria-label]'));
        let phone = null, website = null, address = null;

        for (const btn of buttons) {
          const label = btn.getAttribute('aria-label') || '';
          if (label.startsWith('Phone: ') || label.startsWith('Telepon: ')) {
            phone = label.replace('Phone: ', '').replace('Telepon: ', '').trim();
          }
          if (label.startsWith('Website: ') || label.startsWith('Situs web: ')) {
            website = label.replace('Website: ', '').replace('Situs web: ', '').trim();
          }
          if (label.startsWith('Address: ') || label.startsWith('Alamat: ')) {
            address = label.replace('Address: ', '').replace('Alamat: ', '').trim();
          }
        }

        const ratingSpan = document.querySelector('span[aria-label*="stars"]') || document.querySelector('span[aria-label*="bintang"]');
        let rating = null, reviewCount = null;
        if (ratingSpan && ratingSpan.innerText) {
          rating = parseFloat(ratingSpan.innerText.replace(',', '.'));
          const parentText = ratingSpan.parentElement ? ratingSpan.parentElement.innerText : '';
          const match = parentText.match(/\(([\d,\.]+)\)/);
          if (match) reviewCount = parseInt(match[1].replace(/[\.,]/g, ''), 10);
        }

        const categoryBtn = document.querySelector('button[jsaction*="pane.rating.category"]');
        const category = categoryBtn ? categoryBtn.innerText.trim() : null;

        chunkLeads.push({ businessName, phone, website, address, category, rating, reviewCount });
        reportProgress(`Disimpan: ${businessName}`);
        
        // Kirim data setiap 5 lead agar realtime di dashboard
        if (chunkLeads.length >= 5) {
          await sendToApi(jobId, [...chunkLeads], false);
          totalSaved += chunkLeads.length;
          chunkLeads = [];
        }
      } catch (e) {
        console.error('Error parsing place', e);
      }
    }
  }

  // Kirim sisa data dan sinyal selesai
  reportProgress(`Menyelesaikan proses...`);
  await sendToApi(jobId, [...chunkLeads], true);
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
    
    // Send immediate acknowledgment
    sendResponse({ success: true });

    // Run async task
    scrapeGoogleMaps(request.jobId, request.maxLeads || 100, request.delaySec || 2)
      .then(count => {
        isRunning = false;
        try {
          chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: true, message: `Sukses menyimpan ${count} leads ke Gaetin CRM!` });
        } catch(e) {}
      })
      .catch(err => {
        isRunning = false;
        hideFloatUI();
        try {
          chrome.runtime.sendMessage({ type: 'SCRAPE_COMPLETE', success: false, message: `Error: ${err.message}` });
        } catch(e) {}
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
  const maxLeads = parseInt(params.get('gaetin_max')) || 100;
  const delaySec = parseFloat(params.get('gaetin_delay')) || 2;

  if (isAuto && jobId) {
    let checkAttempts = 0;
    const waitForFeed = setInterval(() => {
      checkAttempts++;
      if (document.querySelector('div[role="feed"]')) {
        clearInterval(waitForFeed);
        
        // Feed found, start scraping
        scrapeGoogleMaps(jobId, maxLeads, delaySec)
          .then(count => {
            isRunning = false;
            
            // Show countdown
            createFloatUI();
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
                window.close(); // Close the tab automatically
              }
            }, 1000);

          })
          .catch(err => {
            isRunning = false;
            createFloatUI();
            const statusEl = document.getElementById('gf-status');
            if (statusEl) {
              statusEl.textContent = `Error: ${err.message}`;
              statusEl.style.color = '#ef4444';
            }
          });
      } else if (checkAttempts > 30) {
        clearInterval(waitForFeed); // Stop checking after 30 seconds
      }
    }, 1000);
  }
})();
