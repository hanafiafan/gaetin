document.addEventListener('DOMContentLoaded', () => {
  const jobIdInput = document.getElementById('jobId');
  const maxLeadsInput = document.getElementById('maxLeads');
  const delaySecInput = document.getElementById('delaySec');
  
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  const statusCard = document.getElementById('statusCard');
  const statusMsg = document.getElementById('statusMsg');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  // Load saved settings
  chrome.storage.local.get(['gaetinJobId', 'gaetinMaxLeads', 'gaetinDelay'], (res) => {
    if (res.gaetinJobId) jobIdInput.value = res.gaetinJobId;
    if (res.gaetinMaxLeads) maxLeadsInput.value = res.gaetinMaxLeads;
    if (res.gaetinDelay) delaySecInput.value = res.gaetinDelay;
  });

  const saveSettings = () => {
    chrome.storage.local.set({
      gaetinJobId: jobIdInput.value.trim(),
      gaetinMaxLeads: parseInt(maxLeadsInput.value, 10) || 100,
      gaetinDelay: parseFloat(delaySecInput.value) || 2
    });
  };

  jobIdInput.addEventListener('input', saveSettings);
  maxLeadsInput.addEventListener('input', saveSettings);
  delaySecInput.addEventListener('input', saveSettings);

  let activeTabId = null;

  // Listen for progress updates
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SCRAPE_PROGRESS') {
      const { current, max, status } = msg;
      const pct = Math.min(100, Math.round((current / max) * 100));
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `${current} / ${max}`;
      if (status) statusMsg.textContent = status;
    }
    if (msg.type === 'SCRAPE_COMPLETE') {
      finishScraping(msg.success, msg.message);
    }
  });

  const finishScraping = (success, message) => {
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    startBtn.disabled = false;
    jobIdInput.disabled = false;
    maxLeadsInput.disabled = false;
    delaySecInput.disabled = false;
    
    progressBar.style.display = 'none';
    progressText.style.display = 'none';
    
    statusCard.className = `status-card active ${success ? '' : 'error'}`;
    statusMsg.textContent = message;
    statusMsg.style.color = success ? '#10b981' : '#ef4444';
  };

  startBtn.addEventListener('click', async () => {
    const jobId = jobIdInput.value.trim();
    if (!jobId) {
      statusCard.className = 'status-card active error';
      statusMsg.textContent = 'Harap isi Job ID Gaetin!';
      statusMsg.style.color = '#ef4444';
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('google.com/maps')) {
      statusCard.className = 'status-card active error';
      statusMsg.textContent = 'Harap buka halaman pencarian Google Maps!';
      statusMsg.style.color = '#ef4444';
      return;
    }

    activeTabId = tab.id;
    saveSettings();

    startBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    jobIdInput.disabled = true;
    maxLeadsInput.disabled = true;
    delaySecInput.disabled = true;

    statusCard.className = 'status-card active';
    statusMsg.style.color = '#10b981';
    statusMsg.textContent = 'Menyuntikkan alat ke halaman...';
    progressBar.style.display = 'block';
    progressText.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = `0 / ${maxLeadsInput.value}`;

    chrome.tabs.sendMessage(activeTabId, { 
      action: 'START_SCRAPE', 
      jobId,
      maxLeads: parseInt(maxLeadsInput.value, 10) || 100,
      delaySec: parseFloat(delaySecInput.value) || 2
    }, (response) => {
      if (chrome.runtime.lastError || !response) {
        finishScraping(false, 'Gagal terhubung. Pastikan halaman Google Maps sudah selesai dimuat, atau refresh halamannya.');
      } else if (!response.success) {
        finishScraping(false, response.error || 'Error');
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    if (activeTabId) {
      statusMsg.textContent = 'Menghentikan proses...';
      chrome.tabs.sendMessage(activeTabId, { action: 'STOP_SCRAPE' });
    }
  });
});
