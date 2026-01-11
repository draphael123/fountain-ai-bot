// Options page script

const apiUrlInput = document.getElementById("api-url");
const strictModeDefault = document.getElementById("strict-mode-default");
const autoClearInput = document.getElementById("auto-clear");
const showCitationsDefault = document.getElementById("show-citations-default");
const topKInput = document.getElementById("top-k");
const themeSelect = document.getElementById("theme");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const status = document.getElementById("status");
const testConnectionBtn = document.getElementById("test-connection-btn");
const connectionResult = document.getElementById("connection-result");

const DEFAULT_SETTINGS = {
  apiBaseUrl: "https://fountain-ai-bot.vercel.app",
  strictModeDefault: true,
  autoClearInput: true,
  showCitationsDefault: true,
  topK: 5,
  theme: "light"
};

// Load settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  
  apiUrlInput.value = result.apiBaseUrl || DEFAULT_SETTINGS.apiBaseUrl;
  strictModeDefault.checked = result.strictModeDefault !== undefined ? result.strictModeDefault : DEFAULT_SETTINGS.strictModeDefault;
  autoClearInput.checked = result.autoClearInput !== undefined ? result.autoClearInput : DEFAULT_SETTINGS.autoClearInput;
  showCitationsDefault.checked = result.showCitationsDefault !== undefined ? result.showCitationsDefault : DEFAULT_SETTINGS.showCitationsDefault;
  topKInput.value = result.topK || DEFAULT_SETTINGS.topK;
  themeSelect.value = result.theme || DEFAULT_SETTINGS.theme;
  
  applyTheme(result.theme || DEFAULT_SETTINGS.theme);
}

// Save settings
async function saveSettings() {
  const url = apiUrlInput.value.trim();
  
  // Validate URL
  try {
    new URL(url);
  } catch {
    showStatus("Please enter a valid URL", "error");
    return;
  }
  
  // Remove trailing slash
  const cleanUrl = url.replace(/\/$/, "");
  
  // Validate topK
  const topK = parseInt(topKInput.value);
  if (isNaN(topK) || topK < 1 || topK > 10) {
    showStatus("Number of results must be between 1 and 10", "error");
    return;
  }
  
  const settings = {
    apiBaseUrl: cleanUrl,
    strictModeDefault: strictModeDefault.checked,
    autoClearInput: autoClearInput.checked,
    showCitationsDefault: showCitationsDefault.checked,
    topK: topK,
    theme: themeSelect.value
  };
  
  await chrome.storage.sync.set(settings);
  applyTheme(settings.theme);
  showStatus("Settings saved successfully!", "success");
}

// Reset settings
async function resetSettings() {
  await chrome.storage.sync.set(DEFAULT_SETTINGS);
  
  apiUrlInput.value = DEFAULT_SETTINGS.apiBaseUrl;
  strictModeDefault.checked = DEFAULT_SETTINGS.strictModeDefault;
  autoClearInput.checked = DEFAULT_SETTINGS.autoClearInput;
  showCitationsDefault.checked = DEFAULT_SETTINGS.showCitationsDefault;
  topKInput.value = DEFAULT_SETTINGS.topK;
  themeSelect.value = DEFAULT_SETTINGS.theme;
  
  applyTheme(DEFAULT_SETTINGS.theme);
  showStatus("Settings reset to default", "success");
}

// Test connection
async function testConnection() {
  const url = apiUrlInput.value.trim();
  
  connectionResult.classList.remove("hidden");
  connectionResult.className = "connection-result testing";
  connectionResult.innerHTML = `
    <div class="spinner-small"></div>
    <span>Testing connection...</span>
  `;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${url}/api/sources`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      connectionResult.className = "connection-result success";
      connectionResult.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>Connected! Document: ${data.documentName || 'Unknown'} (${data.chunkCount || 0} chunks)</span>
      `;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (e) {
    connectionResult.className = "connection-result error";
    connectionResult.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" x2="9" y1="9" y2="15"/>
        <line x1="9" x2="15" y1="9" y2="15"/>
      </svg>
      <span>Connection failed: ${e.message}</span>
    `;
  }
}

// Apply theme
function applyTheme(theme) {
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    document.body.setAttribute("data-theme", theme);
  }
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", async (e) => {
  const result = await chrome.storage.sync.get(["theme"]);
  if ((result.theme || DEFAULT_SETTINGS.theme) === "system") {
    document.body.setAttribute("data-theme", e.matches ? "dark" : "light");
  }
});

// Show status message
function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove("hidden");
  
  setTimeout(() => {
    status.classList.add("hidden");
  }, 3000);
}

// Event listeners
saveBtn.addEventListener("click", saveSettings);
resetBtn.addEventListener("click", resetSettings);
testConnectionBtn.addEventListener("click", testConnection);

// Initialize
loadSettings();
