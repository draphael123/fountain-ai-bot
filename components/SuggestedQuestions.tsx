"use client";

import { Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedQuestionsProps {
  currentQuestion: string;
  onSelectQuestion: (question: string) => void;
  className?: string;
}

// Predefined follow-up questions based on common topics
const FOLLOW_UP_MAP: Record<string, string[]> = {
  intake: [
    "What forms are required for intake?",
    "How long does the intake process take?",
    "What if a patient is missing documentation?",
  ],
  escalation: [
    "What are the escalation levels?",
    "Who should I contact for urgent escalations?",
    "How do I document an escalation?",
  ],
  appointment: [
    "How do I reschedule an appointment?",
    "What is the cancellation policy?",
    "How far in advance can appointments be scheduled?",
  ],
  insurance: [
    "What insurance providers are accepted?",
    "How do I verify insurance coverage?",
    "What if insurance is denied?",
  ],
  documentation: [
    "What are the required fields for documentation?",
    "How long should documentation be retained?",
    "What is the documentation deadline?",
  ],
  patient: [
    "How do I update patient information?",
    "What is the patient consent process?",
    "How do I handle patient complaints?",
  ],
};

// Default suggestions when no specific topic is matched
const DEFAULT_SUGGESTIONS = [
  "What are the key workflows I should know?",
  "How do I handle common exceptions?",
  "What are the compliance requirements?",
];

export function SuggestedQuestions({ currentQuestion, onSelectQuestion, className }: SuggestedQuestionsProps) {
  // Find relevant follow-up questions based on keywords in current question
  const getSuggestions = (): string[] => {
    const lowerQuestion = currentQuestion.toLowerCase();
    
    for (const [keyword, questions] of Object.entries(FOLLOW_UP_MAP)) {
      if (lowerQuestion.includes(keyword)) {
        // Filter out questions that are too similar to the current question
        return questions.filter(q => 
          !lowerQuestion.includes(q.toLowerCase().slice(0, 20))
        ).slice(0, 3);
      }
    }
    
    return DEFAULT_SUGGESTIONS;
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("mt-4 p-4 rounded-lg bg-muted/50 border border-border", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-foreground">Related Questions</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors flex items-center justify-between group"
          >
            <span>{question}</span>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

