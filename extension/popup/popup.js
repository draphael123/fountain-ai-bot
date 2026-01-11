// Extension popup script

// PHI detection patterns
const PHI_PATTERNS = [
  { type: "SSN", regex: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g },
  { type: "Phone", regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  { type: "Email", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
  { type: "DOB", regex: /\b(?:DOB|D\.O\.B\.?|Date of Birth|born|birthday)[\s:]*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/gi },
];

// Escalation keywords
const ESCALATION_KEYWORDS = [
  "lawsuit", "sue", "suing", "legal action", "attorney", "lawyer",
  "bbb", "better business bureau", "malpractice", "negligence",
  "cease and desist", "stop contacting"
];

// DOM elements
const questionInput = document.getElementById("question-input");
const askBtn = document.getElementById("ask-btn");
const strictModeToggle = document.getElementById("strict-mode");
const settingsBtn = document.getElementById("settings-btn");
const phiWarning = document.getElementById("phi-warning");
const phiWarningText = document.getElementById("phi-warning-text");
const escalationWarning = document.getElementById("escalation-warning");
const escalationText = document.getElementById("escalation-text");
const answerContainer = document.getElementById("answer-container");
const answerText = document.getElementById("answer-text");
const citationsContainer = document.getElementById("citations-container");
const citationsList = document.getElementById("citations-list");
const citationsCount = document.getElementById("citations-count");
const copyBtn = document.getElementById("copy-btn");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const errorText = document.getElementById("error-text");

// State
let apiBaseUrl = "http://localhost:3000";

// Load settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(["apiBaseUrl"]);
  if (result.apiBaseUrl) {
    apiBaseUrl = result.apiBaseUrl;
  }
}

// Check for PHI
function detectPHI(text) {
  const matches = [];
  for (const { type, regex } of PHI_PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(text)) {
      matches.push(type);
    }
  }
  return matches;
}

// Check for escalation keywords
function detectEscalation(text) {
  const lower = text.toLowerCase();
  return ESCALATION_KEYWORDS.filter(kw => lower.includes(kw));
}

// Update button state
function updateButtonState() {
  askBtn.disabled = !questionInput.value.trim();
}

// Check warnings
function checkWarnings() {
  const text = questionInput.value;
  
  // PHI check
  const phiMatches = detectPHI(text);
  if (phiMatches.length > 0) {
    phiWarningText.textContent = `Warning: May contain ${phiMatches.join(", ")}`;
    phiWarning.classList.remove("hidden");
  } else {
    phiWarning.classList.add("hidden");
  }
  
  // Escalation check
  const escMatches = detectEscalation(text);
  if (escMatches.length > 0) {
    escalationText.textContent = `This inquiry may involve legal/compliance issues. Follow the internal escalation workflow before responding.`;
    escalationWarning.classList.remove("hidden");
  } else {
    escalationWarning.classList.add("hidden");
  }
}

// Show loading
function showLoading() {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  answerContainer.classList.add("hidden");
  citationsContainer.classList.add("hidden");
}

// Hide loading
function hideLoading() {
  loading.classList.add("hidden");
}

// Show error
function showError(message) {
  errorText.textContent = message;
  error.classList.remove("hidden");
}

// Create citation item HTML
function createCitationItem(citation, fullContent) {
  const scorePercent = Math.round(citation.score * 100);
  const scoreClass = scorePercent >= 70 ? "score-high" : scorePercent >= 50 ? "score-medium" : "score-low";
  
  return `
    <div class="citation-item" data-id="${citation.id}">
      <div class="citation-header">
        <div class="citation-number">${citation.number}</div>
        <div class="citation-heading">${escapeHtml(citation.heading)}</div>
        <div class="citation-score ${scoreClass}">${scorePercent}%</div>
      </div>
      <div class="citation-excerpt">${escapeHtml(citation.excerpt)}</div>
      ${fullContent ? `<div class="citation-full">${escapeHtml(fullContent)}</div>` : ''}
    </div>
  `;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Ask question
async function askQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;
  
  showLoading();
  askBtn.disabled = true;
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        strict: strictModeToggle.checked,
        topK: 5
      })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Request failed");
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let fullAnswer = "";
    let citations = [];
    let retrieved = [];
    let citationsParsed = false;
    
    // Show answer container
    hideLoading();
    answerContainer.classList.remove("hidden");
    answerText.textContent = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Check for citations marker
      if (!citationsParsed && chunk.includes("__CITATIONS__")) {
        const match = chunk.match(/__CITATIONS__(.*?)__END_CITATIONS__/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            citations = parsed.citations || [];
            retrieved = parsed.retrieved || [];
          } catch (e) {
            console.error("Failed to parse citations:", e);
          }
          citationsParsed = true;
          const textAfter = chunk.replace(/__CITATIONS__.*?__END_CITATIONS__/, "");
          fullAnswer += textAfter;
        } else {
          fullAnswer += chunk;
        }
      } else {
        fullAnswer += chunk;
      }
      
      answerText.textContent = fullAnswer;
    }
    
    // Show citations
    if (citations.length > 0) {
      citationsContainer.classList.remove("hidden");
      citationsCount.textContent = citations.length;
      
      citationsList.innerHTML = citations.map(citation => {
        const fullContent = retrieved.find(r => r.id === citation.id)?.content;
        return createCitationItem(citation, fullContent);
      }).join("");
      
      // Add click handlers for citations
      citationsList.querySelectorAll(".citation-item").forEach(item => {
        item.addEventListener("click", () => {
          item.classList.toggle("expanded");
        });
      });
    }
    
  } catch (err) {
    hideLoading();
    showError(err.message || "Failed to get response");
  } finally {
    askBtn.disabled = false;
    updateButtonState();
  }
}

// Copy answer
async function copyAnswer() {
  try {
    await navigator.clipboard.writeText(answerText.textContent);
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      `;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

// Event listeners
questionInput.addEventListener("input", () => {
  updateButtonState();
  checkWarnings();
});

questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!askBtn.disabled) {
      askQuestion();
    }
  }
});

askBtn.addEventListener("click", askQuestion);
copyBtn.addEventListener("click", copyAnswer);
settingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Initialize
loadSettings();
updateButtonState();

