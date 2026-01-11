// PHI/PII detection patterns
// These patterns detect common PHI/PII elements to warn users before sending

interface PHIMatch {
  type: string;
  match: string;
  startIndex: number;
  endIndex: number;
}

const patterns: { type: string; regex: RegExp }[] = [
  // Social Security Number patterns
  {
    type: "SSN",
    regex: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  },
  // Phone numbers (US)
  {
    type: "Phone Number",
    regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  },
  // Email addresses
  {
    type: "Email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  },
  // Date of Birth patterns (various formats)
  {
    type: "Date of Birth",
    regex: /\b(?:DOB|D\.O\.B\.?|Date of Birth|born|birthday)[\s:]*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/gi,
  },
  // Medical Record Number patterns
  {
    type: "Medical Record Number",
    regex: /\b(?:MRN|Medical Record|Patient ID|Chart)[\s:#]*[A-Z0-9]{6,12}\b/gi,
  },
  // Credit Card Numbers
  {
    type: "Credit Card",
    regex: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
  },
  // Dates that could be DOB (mm/dd/yyyy or similar)
  {
    type: "Potential Date",
    regex: /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
  },
];

export function detectPHI(text: string): PHIMatch[] {
  const matches: PHIMatch[] = [];
  
  for (const { type, regex } of patterns) {
    // Reset regex lastIndex for global patterns
    regex.lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type,
        match: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }
  
  // Sort by start index
  matches.sort((a, b) => a.startIndex - b.startIndex);
  
  // Remove duplicates (same position)
  const unique = matches.filter((match, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    return match.startIndex !== prev.startIndex;
  });
  
  return unique;
}

export function hasPHI(text: string): boolean {
  return detectPHI(text).length > 0;
}

export function getPHIWarning(text: string): string | null {
  const matches = detectPHI(text);
  
  if (matches.length === 0) return null;
  
  const types = [...new Set(matches.map((m) => m.type))];
  
  return `Warning: Your message may contain ${types.join(", ")}. Please ensure you are not sharing Protected Health Information.`;
}

