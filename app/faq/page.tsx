"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, ChevronDown, Search, MessageSquare, 
  Sparkles, HelpCircle, BookOpen, Zap, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_CATEGORIES = [
  { id: "all", label: "All", icon: <Sparkles className="h-4 w-4" /> },
  { id: "using", label: "Using the App", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "workflows", label: "Workflows", icon: <BookOpen className="h-4 w-4" /> },
  { id: "features", label: "Features", icon: <Zap className="h-4 w-4" /> },
  { id: "privacy", label: "Privacy & Security", icon: <Shield className="h-4 w-4" /> },
];

const FAQS: FAQItem[] = [
  // Using the App
  {
    question: "How do I ask a question?",
    answer: "Simply type your question in the input box at the bottom of the chat page and press Enter or click the Send button. You can also use voice input by clicking the microphone icon, or press ⌘K to open the command palette for quick access to features.",
    category: "using",
  },
  {
    question: "What is Strict Mode?",
    answer: "Strict Mode ensures that answers are ONLY derived from the official Fountain Workflows documentation. When enabled, the AI will not make assumptions or provide information outside of what's documented. If the answer isn't in the docs, it will tell you. We recommend keeping this ON for accurate, verified answers.",
    category: "using",
  },
  {
    question: "What is Patient Response Mode?",
    answer: "Patient Response Mode generates answers in simple, patient-friendly language. Instead of technical jargon, it uses everyday words that patients can easily understand. Use this when you need to share information directly with patients or create patient-facing communications.",
    category: "using",
  },
  {
    question: "How do I use voice input?",
    answer: "Click the microphone icon (🎤) next to the Send button. Speak your question clearly, and it will be transcribed into text. Voice input works best in Chrome, Edge, and Safari. Make sure you've granted microphone permissions to the site.",
    category: "using",
  },
  {
    question: "What is the Command Palette?",
    answer: "Press ⌘K (Mac) or Ctrl+K (Windows) to open the Command Palette. It's a quick way to access all features: toggle settings, export chat, clear messages, switch themes, and more. You can also search for commands by typing.",
    category: "using",
  },
  {
    question: "Can I save answers for later?",
    answer: "Yes! Use the Bookmarks feature. After receiving an answer, you can bookmark it for quick reference later. Press ⌘B to open the Bookmarks sidebar and see all your saved Q&A pairs.",
    category: "using",
  },
  {
    question: "How do I export my chat history?",
    answer: "Click the Export button in the controls area. You can export as: 1) Text file (.txt) for simple sharing, 2) HTML file (can be printed as PDF) for formatted output with styling, or 3) Copy All to clipboard for pasting elsewhere.",
    category: "using",
  },
  
  // Workflows
  {
    question: "What workflows are covered?",
    answer: "The assistant covers all Fountain Workflows documentation including: pharmacy workflows (Belmar, Curexa, Absolute), patient intake processes, escalation procedures, scheduling, insurance verification, refill processes, and more. The source document is regularly updated.",
    category: "workflows",
  },
  {
    question: "How current is the information?",
    answer: "The information is based on the latest ingested Fountain Workflows document. You can check the Sources page to see when the document was last updated. If you notice outdated information, please submit feedback so we can update the documentation.",
    category: "workflows",
  },
  {
    question: "What if I can't find an answer?",
    answer: "If the AI responds that it couldn't find information in the documentation, it means that specific topic isn't covered in the current Fountain Workflows document. You should: 1) Try rephrasing your question, 2) Check with your supervisor, or 3) Submit feedback requesting that topic be added to the documentation.",
    category: "workflows",
  },
  {
    question: "Can I trust the answers?",
    answer: "With Strict Mode ON, all answers are grounded in official documentation with citations. You can click on citations to verify the source. However, always use your professional judgment and escalate to supervisors for complex or unusual situations.",
    category: "workflows",
  },
  
  // Features
  {
    question: "Is there a Chrome extension?",
    answer: "Yes! Download the Fountain AI Chrome Extension from the homepage or chat page. It gives you quick access to the assistant from any browser tab. The extension has the same features as the website including Strict Mode, Patient Response Mode, and history.",
    category: "features",
  },
  {
    question: "Can I install this as an app on my phone?",
    answer: "Yes! This is a Progressive Web App (PWA). On mobile, tap the Share button and select 'Add to Home Screen'. The app will work offline for cached content and feel like a native app.",
    category: "features",
  },
  {
    question: "What are citations?",
    answer: "Citations show exactly where in the documentation each piece of information came from. Each citation includes the section heading and a relevant excerpt. Click 'Open Source Document' to view the full context in the original Google Doc.",
    category: "features",
  },
  {
    question: "Does the app work offline?",
    answer: "Partially. The app interface loads offline thanks to PWA caching, but asking new questions requires an internet connection since answers are generated in real-time. Your chat history and bookmarks are stored locally and available offline.",
    category: "features",
  },
  
  // Privacy & Security
  {
    question: "Is my data secure?",
    answer: "Yes. Your chat history and bookmarks are stored locally in your browser - not on our servers. Questions are processed through secure API calls but are not stored permanently. The app is designed for internal use only.",
    category: "privacy",
  },
  {
    question: "What is the PHI warning?",
    answer: "The PHI (Protected Health Information) warning appears when you type something that looks like patient-specific information (names, dates of birth, etc.). This is a reminder to avoid including sensitive patient data in your questions. Keep questions general and workflow-focused.",
    category: "privacy",
  },
  {
    question: "Who can see my questions?",
    answer: "Your questions are processed by OpenAI's API to generate answers. They are not stored on Fountain servers or visible to other team members. Chat history exists only in your local browser storage.",
    category: "privacy",
  },
  {
    question: "Can I clear my data?",
    answer: "Yes! Click the 'Clear' button in the chat controls to delete all messages. You can also clear bookmarks from the Bookmarks sidebar. To reset the onboarding tour, click the 'Tour' button. All data is stored locally and can be cleared by clearing your browser data.",
    category: "privacy",
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const expandAll = () => {
    setOpenItems(new Set(filteredFAQs.map((_, i) => i)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-purple-500/10 hover:text-purple-600">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30" />
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={40} 
                  height={40}
                  className="relative rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold gradient-text">Frequently Asked Questions</h1>
                <p className="text-sm text-muted-foreground">Everything you need to know</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/chat">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                  <MessageSquare className="h-4 w-4" />
                  Ask a Question
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredFAQs.length} {filteredFAQs.length === 1 ? "question" : "questions"} found
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No FAQs match your search</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try different keywords or{" "}
                <Link href="/chat" className="text-primary hover:underline">
                  ask the AI directly
                </Link>
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-purple-500/30"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 mt-0.5">
                      <HelpCircle className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ml-4",
                      openItems.has(index) && "rotate-180"
                    )} 
                  />
                </button>
                
                {openItems.has(index) && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="pl-11 pr-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                          {FAQ_CATEGORIES.find(c => c.id === faq.category)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20">
          <h2 className="text-xl font-semibold text-foreground mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Ask the AI assistant for instant answers about Fountain workflows
          </p>
          <Link href="/chat">
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <MessageSquare className="h-4 w-4" />
              Ask a Question
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

