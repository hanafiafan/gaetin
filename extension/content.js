// content.js
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeGoogleMaps(jobId) {
  const leads = [];
  const processedUrls = new Set();
  
  // Find the scrollable feed container
  let feed = document.querySelector('div[role="feed"]');
  if (!feed) {
    throw new Error('Tidak menemukan daftar hasil pencarian. Harap lakukan pencarian dulu di Google Maps.');
  }

  let noNewItemsCount = 0;
  const maxLeads = 100; // Limit for this MVP to avoid crashing the browser

  while (leads.length < maxLeads && noNewItemsCount < 3) {
    // Get all place links currently in the DOM
    const links = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'));
    const newLinks = links.filter(a => !processedUrls.has(a.href));

    if (newLinks.length === 0) {
      // Try to scroll down to load more
      feed.scrollTo(0, feed.scrollHeight);
      await sleep(2000); // Wait for network
      
      // Check if "You've reached the end of the list" is visible
      const endText = feed.innerText.includes("You've reached the end of the list") || feed.innerText.includes("Anda telah mencapai akhir daftar");
      if (endText) break;
      
      noNewItemsCount++;
      continue;
    }

    noNewItemsCount = 0;

    for (const link of newLinks) {
      if (leads.length >= maxLeads) break;
      processedUrls.add(link.href);

      // Click the item to open details pane
      link.click();
      await sleep(2000); // Wait for detail pane to render

      try {
        // Extract Data from Detail Pane
        // Name is usually an h1
        const h1 = document.querySelector('h1');
        const businessName = h1 ? h1.innerText.trim() : 'Tanpa nama';

        // Get all button labels, which contain phone, address, website
        const buttons = Array.from(document.querySelectorAll('button[aria-label]'));
        
        let phone = null;
        let website = null;
        let address = null;

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

        // Get Rating (Optional)
        const ratingSpan = document.querySelector('span[aria-label*="stars"]') || document.querySelector('span[aria-label*="bintang"]');
        let rating = null;
        let reviewCount = null;
        if (ratingSpan && ratingSpan.innerText) {
          rating = parseFloat(ratingSpan.innerText.replace(',', '.'));
          // Siblings often contain review count like "(123)"
          const parentText = ratingSpan.parentElement ? ratingSpan.parentElement.innerText : '';
          const match = parentText.match(/\(([\d,\.]+)\)/);
          if (match) reviewCount = parseInt(match[1].replace(/[\.,]/g, ''), 10);
        }

        const categoryBtn = document.querySelector('button[jsaction*="pane.rating.category"]');
        const category = categoryBtn ? categoryBtn.innerText.trim() : null;

        leads.push({
          businessName,
          phone,
          website,
          address,
          category,
          rating,
          reviewCount
        });

      } catch (e) {
        console.error('Error parsing place', e);
      }
    }
  }

  // Push to Gaetin API
  if (leads.length > 0) {
    try {
      const url = "https://gaetin.vercel.app/api/scraper/extension";
      // Fallback to localhost if running on localhost for testing (the user will use vercel or localhost)
      const targetUrl = window.location.href.includes('localhost') ? 'http://localhost:3000/api/scraper/extension' : url;
      
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, leads })
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Gagal mengirim data ke server Gaetin');
      }
    } catch (e) {
      throw new Error('Gagal koneksi ke server Gaetin: ' + e.message);
    }
  }

  return leads.length;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_SCRAPE') {
    scrapeGoogleMaps(request.jobId)
      .then(count => {
        sendResponse({ success: true, count });
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});
