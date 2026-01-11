// Options page script

const apiUrlInput = document.getElementById("api-url");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const status = document.getElementById("status");

const DEFAULT_API_URL = "http://localhost:3000";

// Load settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(["apiBaseUrl"]);
  apiUrlInput.value = result.apiBaseUrl || DEFAULT_API_URL;
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
  
  await chrome.storage.sync.set({ apiBaseUrl: cleanUrl });
  showStatus("Settings saved successfully!", "success");
}

// Reset settings
async function resetSettings() {
  await chrome.storage.sync.set({ apiBaseUrl: DEFAULT_API_URL });
  apiUrlInput.value = DEFAULT_API_URL;
  showStatus("Settings reset to default", "success");
}

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

// Initialize
loadSettings();

