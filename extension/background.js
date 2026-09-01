// Background Service Worker for Hellens Chrome Extension
// Handles cross-origin API calls to bypass web page CORS restrictions in Manifest V3

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'SEND_TO_API') {
    const { jobId, leads, isFinished, token } = request;
    const apiUrl = request.apiUrl || 'https://scraper.hellens.dev/api/scraper/extension';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Token': token || ''
      },
      body: JSON.stringify({ jobId, leads, isFinished }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          sendResponse({ success: false, status: res.status, error: `HTTP ${res.status}: ${errText.slice(0, 35)}` });
        } else {
          const json = await res.json().catch(() => ({ added: 0 }));
          sendResponse({ success: true, added: json.added || 0 });
        }
      })
      .catch((err) => {
        console.error('Hellens Background API Error:', err);
        sendResponse({ success: false, error: `Gagal API: ${err.message}` });
      });

    return true; // Keeps async message response channel open
  }
});
