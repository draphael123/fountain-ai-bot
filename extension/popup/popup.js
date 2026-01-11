// DOM Elements
const questionInput = document.getElementById("question-input");
const askBtn = document.getElementById("ask-btn");
const settingsBtn = document.getElementById("settings-btn");
const strictModeToggle = document.getElementById("strict-mode");
const phiWarning = document.getElementById("phi-warning");
const phiWarningText = document.getElementById("phi-warning-text");
const escalationWarning = document.getElementById("escalation-warning");
const escalationText = document.getElementById("escalation-text");
const answerContainer = document.getElementById("answer-container");
const answerText = document.getElementById("answer-text");
const citationsContainer = document.getElementById("citations-container");
const citationsCount = document.getElementById("citations-count");
const citationsList = document.getElementById("citations-list");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorText = document.getElementById("error-text");
const copyBtn = document.getElementById("copy-btn");
const connectionStatus = document.getElementById("connection-status");
const quickActions = document.getElementById("quick-actions");

// Default Settings
const DEFAULT_SETTINGS = {
  apiBaseUrl: "https://fountain-ai-bot.vercel.app",
  strictModeDefault: true,
  autoClearInput: true,
  showCitationsDefault: true,
  topK: 5,
  theme: "light"
};

// State
let settings = { ...DEFAULT_SETTINGS };
let isLoading = false;
let currentAnswer = "";
let recentQuestions = [];
let googleDocUrl = null;

// PHI Detection patterns
const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b\d{9}\b/,
  /\b[A-Z]{1,2}\d{6,8}\b/i,
  /\b\d{10,11}\b/,
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
];

// Escalation keywords
const ESCALATION_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life",
  "emergency", "911", "overdose", "unconscious",
  "abuse", "violence", "threat", "weapon",
];

// Quick action questions
const QUICK_QUESTIONS = [
  "What is the intake process?",
  "How do I handle escalations?",
  "What are the documentation requirements?",
];

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  applySettings();
  await checkConnection();
  loadRecentQuestions();
  setupEventListeners();
  renderQuickActions();
});

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
    settings = { ...DEFAULT_SETTINGS, ...result };
  } catch (e) {
    console.error("Failed to load settings:", e);
    settings = { ...DEFAULT_SETTINGS };
  }
}

function applySettings() {
  // Apply theme
  document.body.setAttribute("data-theme", settings.theme);
  
  // Apply strict mode default
  if (strictModeToggle) {
    strictModeToggle.checked = settings.strictModeDefault;
  }
}

async function checkConnection() {
  if (!connectionStatus) return;
  
  connectionStatus.classList.remove("hidden");
  connectionStatus.innerHTML = `
    <div class="connection-checking">
      <div class="spinner-small"></div>
      <span>Checking connection...</span>
    </div>
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${settings.apiBaseUrl}/api/sources`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // Store the Google Doc URL for citations
      if (data.googleDocUrl) {
        googleDocUrl = data.googleDocUrl;
      }
      connectionStatus.innerHTML = `
        <div class="connection-success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Connected (${data.chunkCount || 0} chunks)</span>
        </div>
      `;
      setTimeout(() => connectionStatus.classList.add("hidden"), 3000);
    } else {
      throw new Error("API not responding");
    }
  } catch (e) {
    connectionStatus.innerHTML = `
      <div class="connection-error">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" x2="9" y1="9" y2="15"/>
          <line x1="9" x2="15" y1="9" y2="15"/>
        </svg>
        <span>Cannot connect to API</span>
        <button onclick="openSettings()" class="connection-settings-btn">Settings</button>
      </div>
    `;
  }
}

function loadRecentQuestions() {
  try {
    const stored = localStorage.getItem("fountain-recent-questions");
    if (stored) {
      recentQuestions = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load recent questions:", e);
  }
}

function saveRecentQuestions() {
  try {
    localStorage.setItem("fountain-recent-questions", JSON.stringify(recentQuestions.slice(0, 5)));
  } catch (e) {
    console.error("Failed to save recent questions:", e);
  }
}

function renderQuickActions() {
  if (!quickActions) return;
  
  const questions = recentQuestions.length > 0 ? recentQuestions.slice(0, 3) : QUICK_QUESTIONS;
  
  quickActions.innerHTML = `
    <div class="quick-actions-header">
      <span>${recentQuestions.length > 0 ? "Recent" : "Try asking"}</span>
    </div>
    <div class="quick-actions-list">
      ${questions.map(q => `
        <button class="quick-action-btn" data-question="${q.replace(/"/g, '&quot;')}">
          ${q.length > 35 ? q.slice(0, 35) + "..." : q}
        </button>
      `).join("")}
    </div>
  `;

  // Add click handlers
  quickActions.querySelectorAll(".quick-action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      questionInput.value = btn.dataset.question;
      questionInput.focus();
      updateAskButton();
    });
  });
}

function setupEventListeners() {
  // Input handling
  questionInput.addEventListener("input", () => {
    updateAskButton();
    checkForWarnings();
  });

  // Keyboard shortcuts
  questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && questionInput.value.trim()) {
        handleAsk();
      }
    }
    if (e.key === "Escape") {
      questionInput.value = "";
      updateAskButton();
      hideWarnings();
    }
  });

  // Global keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Focus input with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      questionInput.focus();
    }
  });

  // Ask button
  askBtn.addEventListener("click", handleAsk);

  // Settings button
  settingsBtn.addEventListener("click", openSettings);

  // Footer settings link
  const openSettingsFooter = document.getElementById("open-settings");
  if (openSettingsFooter) {
    openSettingsFooter.addEventListener("click", openSettings);
  }

  // Copy button
  copyBtn.addEventListener("click", handleCopy);

  // Citation expansion
  citationsList.addEventListener("click", (e) => {
    const item = e.target.closest(".citation-item");
    if (item) {
      item.classList.toggle("expanded");
    }
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") {
      loadSettings().then(() => applySettings());
    }
  });
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function updateAskButton() {
  askBtn.disabled = !questionInput.value.trim() || isLoading;
}

function checkForWarnings() {
  const text = questionInput.value;
  
  // Check for PHI
  const hasPHI = PHI_PATTERNS.some(pattern => pattern.test(text));
  if (hasPHI) {
    phiWarningText.textContent = "Your input may contain PHI. Please remove any personal health information before submitting.";
    phiWarning.classList.remove("hidden");
  } else {
    phiWarning.classList.add("hidden");
  }

  // Check for escalation keywords
  const escalationFound = ESCALATION_KEYWORDS.filter(kw => 
    text.toLowerCase().includes(kw.toLowerCase())
  );
  if (escalationFound.length > 0) {
    escalationText.textContent = `This appears to require immediate escalation. Please contact your supervisor or emergency services immediately.`;
    escalationWarning.classList.remove("hidden");
  } else {
    escalationWarning.classList.add("hidden");
  }
}

function hideWarnings() {
  phiWarning.classList.add("hidden");
  escalationWarning.classList.add("hidden");
}

async function handleAsk() {
  const question = questionInput.value.trim();
  if (!question || isLoading) return;

  // Save to recent questions
  recentQuestions = [question, ...recentQuestions.filter(q => q !== question)].slice(0, 5);
  saveRecentQuestions();
  renderQuickActions();

  isLoading = true;
  updateAskButton();
  showLoading();
  hideError();
  hideAnswer();

  try {
    const response = await fetch(`${settings.apiBaseUrl}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        strict: strictModeToggle.checked,
        topK: settings.topK,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get response");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let citations = [];
    let citationsParsed = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      
      if (!citationsParsed && chunk.includes("__CITATIONS__")) {
        const match = chunk.match(/__CITATIONS__(.*?)__END_CITATIONS__/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            citations = parsed.citations || [];
          } catch (e) {
            console.error("Failed to parse citations:", e);
          }
          citationsParsed = true;
          fullContent += chunk.replace(/__CITATIONS__.*?__END_CITATIONS__/, "");
        } else {
          fullContent += chunk;
        }
      } else {
        fullContent += chunk;
      }

      currentAnswer = fullContent;
      showAnswer(fullContent);
    }

    // Show or hide citations based on settings
    if (citations.length > 0 && settings.showCitationsDefault) {
      showCitations(citations);
    }

    // Clear input if auto-clear is enabled
    if (settings.autoClearInput) {
      questionInput.value = "";
      updateAskButton();
    }

  } catch (error) {
    showError(error.message);
  } finally {
    isLoading = false;
    updateAskButton();
    hideLoading();
  }
}

function showLoading() {
  loadingEl.classList.remove("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorEl.classList.remove("hidden");
}

function hideError() {
  errorEl.classList.add("hidden");
}

function showAnswer(text) {
  answerText.textContent = text;
  answerContainer.classList.remove("hidden");
}

function hideAnswer() {
  answerContainer.classList.add("hidden");
  citationsContainer.classList.add("hidden");
}

function showCitations(citations) {
  citationsCount.textContent = citations.length;
  
  citationsList.innerHTML = citations.map((c, i) => {
    const scoreClass = c.score > 0.8 ? "score-high" : c.score > 0.6 ? "score-medium" : "score-low";
    const docLink = googleDocUrl ? `
      <a href="${googleDocUrl}" target="_blank" rel="noopener noreferrer" class="citation-doc-link" onclick="event.stopPropagation()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" x2="21" y1="14" y2="3"/>
        </svg>
        View Source
      </a>
    ` : '';
    return `
      <div class="citation-item">
        <div class="citation-header">
          <span class="citation-number">${i + 1}</span>
          <span class="citation-heading">${escapeHtml(c.heading)}</span>
          <span class="citation-score ${scoreClass}">${Math.round(c.score * 100)}%</span>
        </div>
        <p class="citation-excerpt">${escapeHtml(c.excerpt)}</p>
        ${docLink}
      </div>
    `;
  }).join("");

  citationsContainer.classList.remove("hidden");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(currentAnswer);
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      `;
      copyBtn.classList.remove("copied");
    }, 2000);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
}
