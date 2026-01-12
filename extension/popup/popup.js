// DOM Elements
const questionInput = document.getElementById("question-input");
const askBtn = document.getElementById("ask-btn");
const settingsBtn = document.getElementById("settings-btn");
const strictModeToggle = document.getElementById("strict-mode");
const patientModeToggle = document.getElementById("patient-mode");
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
const charCounter = document.getElementById("char-counter");

// Default Settings
const DEFAULT_SETTINGS = {
  apiBaseUrl: "https://fountain-ai-bot.vercel.app",
  strictModeDefault: true,
  autoClearInput: true,
  showCitationsDefault: true,
  topK: 5,
  theme: "system"
};

// State
let settings = { ...DEFAULT_SETTINGS };
let isLoading = false;
let currentAnswer = "";
let currentCitations = [];
let recentQuestions = [];
let pinnedQuestions = [];
let answerHistory = [];
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
  loadPinnedQuestions();
  loadRecentQuestions();
  loadAnswerHistory();
  await checkConnection();
  setupEventListeners();
  renderQuickActions();
  updateCharCounter();
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
  applyTheme(settings.theme);
  
  // Apply strict mode default
  if (strictModeToggle) {
    strictModeToggle.checked = settings.strictModeDefault;
  }
}

function applyTheme(theme) {
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    document.body.setAttribute("data-theme", theme);
  }
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (settings.theme === "system") {
    document.body.setAttribute("data-theme", e.matches ? "dark" : "light");
  }
});

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
      // Update badge to show connected
      chrome.action?.setBadgeText?.({ text: "✓" });
      chrome.action?.setBadgeBackgroundColor?.({ color: "#22c55e" });
      setTimeout(() => {
        connectionStatus.classList.add("hidden");
        chrome.action?.setBadgeText?.({ text: "" });
      }, 3000);
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
    // Update badge to show error
    chrome.action?.setBadgeText?.({ text: "!" });
    chrome.action?.setBadgeBackgroundColor?.({ color: "#ef4444" });
  }
}

function loadPinnedQuestions() {
  try {
    const stored = localStorage.getItem("fountain-pinned-questions");
    if (stored) {
      pinnedQuestions = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load pinned questions:", e);
  }
}

function savePinnedQuestions() {
  try {
    localStorage.setItem("fountain-pinned-questions", JSON.stringify(pinnedQuestions));
  } catch (e) {
    console.error("Failed to save pinned questions:", e);
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
    localStorage.setItem("fountain-recent-questions", JSON.stringify(recentQuestions.slice(0, 10)));
  } catch (e) {
    console.error("Failed to save recent questions:", e);
  }
}

function loadAnswerHistory() {
  try {
    const stored = localStorage.getItem("fountain-answer-history");
    if (stored) {
      answerHistory = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load answer history:", e);
  }
}

function saveAnswerHistory() {
  try {
    // Keep last 20 Q&As
    localStorage.setItem("fountain-answer-history", JSON.stringify(answerHistory.slice(0, 20)));
  } catch (e) {
    console.error("Failed to save answer history:", e);
  }
}

function renderQuickActions() {
  if (!quickActions) return;
  
  // Combine pinned and recent, prioritizing pinned
  const pinnedSet = new Set(pinnedQuestions);
  const allQuestions = [
    ...pinnedQuestions,
    ...recentQuestions.filter(q => !pinnedSet.has(q))
  ].slice(0, 5);
  
  const questions = allQuestions.length > 0 ? allQuestions : QUICK_QUESTIONS;
  const hasPinned = pinnedQuestions.length > 0;
  
  quickActions.innerHTML = `
    <div class="quick-actions-header">
      <span>${hasPinned ? "Pinned & Recent" : recentQuestions.length > 0 ? "Recent" : "Try asking"}</span>
      ${answerHistory.length > 0 ? `
        <button id="show-history-btn" class="quick-action-history-btn" title="View history">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
      ` : ''}
    </div>
    <div class="quick-actions-list">
      ${questions.map(q => {
        const isPinned = pinnedQuestions.includes(q);
        return `
          <div class="quick-action-item">
            <button class="quick-action-btn" data-question="${q.replace(/"/g, '&quot;')}">
              ${isPinned ? '<span class="pin-icon">📌</span>' : ''}
              ${q.length > 30 ? q.slice(0, 30) + "..." : q}
            </button>
            <button class="pin-btn ${isPinned ? 'pinned' : ''}" data-question="${q.replace(/"/g, '&quot;')}" title="${isPinned ? 'Unpin' : 'Pin'}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M12 17v5"/>
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
          </div>
        `;
      }).join("")}
    </div>
  `;

  // Add click handlers for quick action buttons
  quickActions.querySelectorAll(".quick-action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      questionInput.value = btn.dataset.question;
      questionInput.focus();
      updateAskButton();
      updateCharCounter();
    });
  });

  // Add click handlers for pin buttons
  quickActions.querySelectorAll(".pin-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const question = btn.dataset.question;
      togglePinQuestion(question);
    });
  });

  // Add history button handler
  document.getElementById("show-history-btn")?.addEventListener("click", showHistoryModal);
}

function togglePinQuestion(question) {
  const index = pinnedQuestions.indexOf(question);
  if (index > -1) {
    pinnedQuestions.splice(index, 1);
  } else {
    pinnedQuestions.unshift(question);
    if (pinnedQuestions.length > 5) {
      pinnedQuestions.pop();
    }
  }
  savePinnedQuestions();
  renderQuickActions();
}

function updateCharCounter() {
  if (!charCounter) return;
  const length = questionInput.value.length;
  const maxLength = 2000;
  charCounter.textContent = `${length}/${maxLength}`;
  charCounter.classList.toggle("warning", length > maxLength * 0.8);
  charCounter.classList.toggle("error", length > maxLength);
}

function setupEventListeners() {
  // Input handling
  questionInput.addEventListener("input", () => {
    updateAskButton();
    checkForWarnings();
    updateCharCounter();
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
      updateCharCounter();
    }
  });

  // Global keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Focus input with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      questionInput.focus();
    }
    // Open history with Ctrl/Cmd + H
    if ((e.ctrlKey || e.metaKey) && e.key === "h") {
      e.preventDefault();
      showHistoryModal();
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
    if (item && !e.target.closest(".citation-copy-btn")) {
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
  recentQuestions = [question, ...recentQuestions.filter(q => q !== question)].slice(0, 10);
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
        patientResponse: patientModeToggle.checked,
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
            currentCitations = citations;
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

    // Save to history
    answerHistory.unshift({
      question,
      answer: fullContent,
      citations,
      timestamp: new Date().toISOString(),
    });
    saveAnswerHistory();

    // Clear input if auto-clear is enabled
    if (settings.autoClearInput) {
      questionInput.value = "";
      updateAskButton();
      updateCharCounter();
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
  // Create a more user-friendly error message with suggestions
  let displayError = message;
  let suggestion = "";
  
  if (message.includes("API key") || message.includes("401") || message.includes("Invalid API")) {
    suggestion = "The API key may be invalid. Please contact the administrator.";
  } else if (message.includes("quota") || message.includes("429") || message.includes("billing")) {
    suggestion = "Service quota exceeded. Please try again later.";
  } else if (message.includes("network") || message.includes("connect") || message.includes("Failed to fetch")) {
    suggestion = "Check your internet connection and try again.";
  } else if (message.includes("ingested") || message.includes("No document")) {
    suggestion = "Document database not found. Contact the administrator.";
  } else if (message.includes("timeout")) {
    suggestion = "Request timed out. Try a shorter question.";
  }
  
  const fullError = suggestion 
    ? `${displayError}\n\n💡 ${suggestion}`
    : displayError;
  
  errorText.innerHTML = fullError.replace(/\n/g, '<br>');
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
    const sourceButton = googleDocUrl ? `
      <div class="citation-source">
        <a href="${googleDocUrl}" target="_blank" rel="noopener noreferrer" class="citation-source-btn" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" x2="21" y1="14" y2="3"/>
          </svg>
          Click to Open Source Document
        </a>
      </div>
    ` : `
      <div class="citation-source-info">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>Source: Fountain Workflows Document</span>
      </div>
    `;
    return `
      <div class="citation-item">
        <div class="citation-header">
          <span class="citation-number">${i + 1}</span>
          <span class="citation-heading">${escapeHtml(c.heading)}</span>
          <span class="citation-score ${scoreClass}">${Math.round(c.score * 100)}%</span>
          <button class="citation-copy-btn" data-index="${i}" title="Copy citation">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>
        </div>
        <p class="citation-excerpt">${escapeHtml(c.excerpt)}</p>
        ${sourceButton}
      </div>
    `;
  }).join("");

  // Add copy handlers for citations
  citationsList.querySelectorAll(".citation-copy-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      const citation = citations[index];
      const text = `[${citation.heading}]\n${citation.excerpt}`;
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        setTimeout(() => {
          btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          `;
        }, 1500);
      });
    });
  });

  citationsContainer.classList.remove("hidden");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function handleCopy() {
  try {
    // Copy answer with citations if available
    let textToCopy = currentAnswer;
    if (currentCitations.length > 0) {
      textToCopy += "\n\n--- Citations ---\n";
      currentCitations.forEach((c, i) => {
        textToCopy += `\n[${i + 1}] ${c.heading}\n${c.excerpt}\n`;
      });
    }
    
    await navigator.clipboard.writeText(textToCopy);
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

// History Modal
function showHistoryModal() {
  if (answerHistory.length === 0) return;
  
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "history-modal";
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content history-modal-content">
      <div class="modal-header">
        <div class="modal-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Answer History
        </div>
        <div class="modal-header-actions">
          <button id="export-history-btn" class="modal-action-btn" title="Export history">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
          </button>
          <button id="clear-history-btn" class="modal-action-btn danger" title="Clear history">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button class="modal-close close-history-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" x2="6" y1="6" y2="18"/>
              <line x1="6" x2="18" y1="6" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="modal-body history-list">
        ${answerHistory.map((item, index) => `
          <div class="history-item" data-index="${index}">
            <div class="history-question">
              <span class="history-icon">Q</span>
              <span class="history-text">${escapeHtml(item.question)}</span>
              <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
            </div>
            <div class="history-answer">
              <span class="history-icon">A</span>
              <span class="history-text">${escapeHtml(item.answer.slice(0, 150))}${item.answer.length > 150 ? '...' : ''}</span>
            </div>
            <div class="history-actions">
              <button class="history-reask-btn" data-question="${escapeHtml(item.question)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Ask Again
              </button>
              <button class="history-copy-btn" data-index="${index}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                Copy
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event handlers
  modal.querySelector(".modal-backdrop").addEventListener("click", () => closeHistoryModal());
  modal.querySelector(".close-history-modal").addEventListener("click", () => closeHistoryModal());
  
  modal.querySelectorAll(".history-reask-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      questionInput.value = btn.dataset.question;
      updateAskButton();
      updateCharCounter();
      closeHistoryModal();
      questionInput.focus();
    });
  });
  
  modal.querySelectorAll(".history-copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      const item = answerHistory[index];
      const text = `Q: ${item.question}\n\nA: ${item.answer}`;
      navigator.clipboard.writeText(text);
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
    });
  });
  
  document.getElementById("export-history-btn").addEventListener("click", exportHistory);
  document.getElementById("clear-history-btn").addEventListener("click", clearHistory);
}

function closeHistoryModal() {
  document.getElementById("history-modal")?.remove();
}

function formatTimeAgo(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function exportHistory() {
  if (answerHistory.length === 0) return;
  
  let content = "# Fountain Workflows Q&A History\n";
  content += `# Exported: ${new Date().toLocaleString()}\n\n`;
  
  answerHistory.forEach((item, i) => {
    content += `## ${i + 1}. ${new Date(item.timestamp).toLocaleString()}\n\n`;
    content += `**Question:** ${item.question}\n\n`;
    content += `**Answer:** ${item.answer}\n\n`;
    if (item.citations && item.citations.length > 0) {
      content += "**Citations:**\n";
      item.citations.forEach((c, j) => {
        content += `- [${j + 1}] ${c.heading}: ${c.excerpt}\n`;
      });
    }
    content += "\n---\n\n";
  });
  
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fountain-history-${new Date().toISOString().split("T")[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all history?")) {
    answerHistory = [];
    saveAnswerHistory();
    closeHistoryModal();
    renderQuickActions();
  }
}

// Feedback Modal
const feedbackModal = document.getElementById("feedback-modal");
const feedbackFormContainer = document.getElementById("feedback-form-container");
const feedbackSuccess = document.getElementById("feedback-success");
const feedbackMessage = document.getElementById("feedback-message");
const feedbackEmail = document.getElementById("feedback-email");
const feedbackTypeBtns = document.querySelectorAll(".feedback-type-btn");
let selectedFeedbackType = "suggestion";

function openFeedbackModal() {
  feedbackModal.classList.remove("hidden");
  feedbackFormContainer.classList.remove("hidden");
  feedbackSuccess.classList.add("hidden");
  feedbackMessage.value = "";
  feedbackEmail.value = "";
  selectedFeedbackType = "suggestion";
  updateFeedbackTypeButtons();
}

function closeFeedbackModal() {
  feedbackModal.classList.add("hidden");
}

function updateFeedbackTypeButtons() {
  feedbackTypeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === selectedFeedbackType);
  });
}

async function submitFeedback() {
  const message = feedbackMessage.value.trim();
  const email = feedbackEmail.value.trim();
  
  if (!message) {
    feedbackMessage.style.borderColor = "var(--error-text)";
    return;
  }
  
  feedbackMessage.style.borderColor = "";
  
  const feedback = {
    type: selectedFeedbackType,
    message,
    email: email || "",
    source: "extension",
    userAgent: navigator.userAgent,
  };
  
  // Send to Google Sheets
  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxsHJEi2aurIYL4iCRa6zlDp8CStam5FfLSIzKTyNVZbkKyQ1jTT3nEKbLBiZvAjRyu/exec";
  
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    });
  } catch (e) {
    console.error("Failed to send feedback:", e);
  }
  
  // Show success
  feedbackFormContainer.classList.add("hidden");
  feedbackSuccess.classList.remove("hidden");
  
  // Close after delay
  setTimeout(() => {
    closeFeedbackModal();
  }, 2000);
}

// Setup feedback event listeners
document.getElementById("open-feedback")?.addEventListener("click", openFeedbackModal);
document.getElementById("close-feedback")?.addEventListener("click", closeFeedbackModal);
document.getElementById("cancel-feedback")?.addEventListener("click", closeFeedbackModal);
document.getElementById("submit-feedback")?.addEventListener("click", submitFeedback);
document.querySelector(".modal-backdrop")?.addEventListener("click", closeFeedbackModal);

feedbackTypeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedFeedbackType = btn.dataset.type;
    updateFeedbackTypeButtons();
  });
});
