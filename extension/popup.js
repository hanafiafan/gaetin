document.addEventListener('DOMContentLoaded', () => {
  const jobIdInput = document.getElementById('jobId');
  const startBtn = document.getElementById('startBtn');
  const statusMsg = document.getElementById('statusMsg');

  chrome.storage.local.get(['gaetinJobId'], (res) => {
    if (res.gaetinJobId) jobIdInput.value = res.gaetinJobId;
  });

  jobIdInput.addEventListener('input', () => {
    chrome.storage.local.set({ gaetinJobId: jobIdInput.value.trim() });
  });

  startBtn.addEventListener('click', async () => {
    const jobId = jobIdInput.value.trim();
    if (!jobId) {
      statusMsg.textContent = 'Harap isi Job ID Gaetin terlebih dahulu!';
      statusMsg.className = 'status error';
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('google.com/maps')) {
      statusMsg.textContent = 'Harap buka tab Google Maps!';
      statusMsg.className = 'status error';
      return;
    }

    startBtn.disabled = true;
    startBtn.textContent = 'Scraping... Jangan pindah tab!';
    statusMsg.textContent = 'Mengklik hasil satu per satu...';
    statusMsg.className = 'status';

    chrome.tabs.sendMessage(tab.id, { action: 'START_SCRAPE', jobId }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statusMsg.textContent = 'Gagal terhubung. Pastikan halaman Google Maps sudah selesai dimuat, atau coba refresh.';
        statusMsg.className = 'status error';
        startBtn.disabled = false;
        startBtn.textContent = 'Mulai Scraping';
        return;
      }

      if (response.success) {
        statusMsg.textContent = `Selesai! ${response.count} prospek berhasil dikirim ke Gaetin.`;
        statusMsg.className = 'status success';
      } else {
        statusMsg.textContent = `Error: ${response.error}`;
        statusMsg.className = 'status error';
      }
      startBtn.disabled = false;
      startBtn.textContent = 'Mulai Scraping';
    });
  });
});
