"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  category: string;
  color: string;
}

const FAQS: FAQ[] = [
  { question: "What are the key steps in the intake process?", category: "Intake", color: "from-purple-500 to-pink-500" },
  { question: "How do I handle a patient escalation?", category: "Escalations", color: "from-red-500 to-orange-500" },
  { question: "What is the procedure for scheduling appointments?", category: "Scheduling", color: "from-blue-500 to-cyan-500" },
  { question: "How do I process insurance verification?", category: "Insurance", color: "from-green-500 to-emerald-500" },
  { question: "What are the documentation requirements?", category: "Documentation", color: "from-amber-500 to-yellow-500" },
  { question: "How do I submit a prescription refill?", category: "Pharmacy", color: "from-violet-500 to-purple-500" },
  { question: "What is the Belmar pharmacy workflow?", category: "Pharmacy", color: "from-teal-500 to-green-500" },
  { question: "How do I handle a cancellation request?", category: "Cancellations", color: "from-rose-500 to-pink-500" },
  { question: "What is the protocol for urgent patient concerns?", category: "Urgent", color: "from-red-600 to-red-500" },
  { question: "How do I transfer a patient to another provider?", category: "Transfers", color: "from-indigo-500 to-blue-500" },
];

interface QuickFAQsProps {
  onAskQuestion: (question: string) => void;
  collapsed?: boolean;
}

export function QuickFAQs({ onAskQuestion, collapsed = true }: QuickFAQsProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const displayedFAQs = isExpanded ? FAQS : FAQS.slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-foreground">Quick Questions</h3>
          <span className="text-xs text-muted-foreground">({FAQS.length} FAQs)</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show All <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      </div>

      {/* FAQ Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayedFAQs.map((faq, i) => (
          <button
            key={i}
            onClick={() => onAskQuestion(faq.question)}
            className={cn(
              "group flex items-start gap-3 p-3 rounded-lg border border-border",
              "hover:border-transparent hover:shadow-lg transition-all duration-200",
              "text-left bg-background hover:bg-gradient-to-r hover:text-white",
              `hover:${faq.color}`
            )}
            style={{
              ["--tw-gradient-from" as any]: faq.color.includes("purple") ? "#a855f7" : undefined,
            }}
          >
            <div className={cn(
              "flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium",
              "bg-muted text-muted-foreground group-hover:bg-white/20 group-hover:text-white transition-colors"
            )}>
              {faq.category}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-white line-clamp-2 transition-colors">
                {faq.question}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
          </button>
        ))}
      </div>

      {/* Categories quick filter */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex flex-wrap gap-2">
          {["Intake", "Pharmacy", "Escalations", "Scheduling"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                const faq = FAQS.find(f => f.category === cat);
                if (faq) onAskQuestion(faq.question);
              }}
              className="px-3 py-1 text-xs font-medium rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

