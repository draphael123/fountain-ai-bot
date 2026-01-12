// Escalation keyword detection for legal/compliance issues
// Triggers a banner recommending internal escalation workflow

interface EscalationMatch {
  keyword: string;
  category: string;
  startIndex: number;
  endIndex: number;
}

// Keywords that indicate potential legal/escalation situations
const escalationPatterns: { category: string; keywords: string[] }[] = [
  {
    category: "Legal Action",
    keywords: [
      "lawsuit",
      "sue",
      "suing",
      "legal action",
      "attorney",
      "lawyer",
      "litigation",
      "court",
      "subpoena",
      "deposition",
    ],
  },
  {
    category: "Regulatory Complaint",
    keywords: [
      "bbb",
      "better business bureau",
      "state board",
      "medical board",
      "dental board",
      "file a complaint",
      "report to",
      "regulatory",
    ],
  },
  {
    category: "Malpractice",
    keywords: [
      "malpractice",
      "negligence",
      "negligent",
      "damages",
      "injury",
      "harm",
      "wrongful",
    ],
  },
  {
    category: "Cease Communication",
    keywords: [
      "cease and desist",
      "stop contacting",
      "do not contact",
      "cease all communication",
      "no further contact",
      "stop calling",
    ],
  },
  {
    category: "Threats",
    keywords: [
      "threatening",
      "threat",
      "going to the media",
      "news",
      "expose",
      "public",
      "social media",
    ],
  },
];

export function detectEscalation(text: string): EscalationMatch[] {
  const matches: EscalationMatch[] = [];
  const lowerText = text.toLowerCase();
  
  for (const { category, keywords } of escalationPatterns) {
    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword.toLowerCase());
      if (index !== -1) {
        matches.push({
          keyword,
          category,
          startIndex: index,
          endIndex: index + keyword.length,
        });
      }
    }
  }
  
  // Sort by start index and remove duplicates by category
  matches.sort((a, b) => a.startIndex - b.startIndex);
  
  const seenCategories = new Set<string>();
  const unique = matches.filter((match) => {
    if (seenCategories.has(match.category)) return false;
    seenCategories.add(match.category);
    return true;
  });
  
  return unique;
}

export function hasEscalationKeywords(text: string): boolean {
  return detectEscalation(text).length > 0;
}

export function getEscalationWarning(text: string): {
  show: boolean;
  categories: string[];
  message: string;
} {
  const matches = detectEscalation(text);
  
  if (matches.length === 0) {
    return { show: false, categories: [], message: "" };
  }
  
  const categories = [...new Set(matches.map((m) => m.category))];
  
  return {
    show: true,
    categories,
    message: `This inquiry involves ${categories.join(", ")}. Please follow the internal escalation workflow as documented. Cease all communication and consult with management before responding.`,
  };
}


