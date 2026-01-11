"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, FileText, Send, Loader2, Copy, Check, Eye, EyeOff, 
  RotateCcw, ThumbsUp, ThumbsDown, Download, Clock, MessageSquare,
  Sparkles, X, ChevronRight, Bookmark, BookmarkCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CitationCard } from "@/components/chat/CitationCard";
import { EscalationBanner } from "@/components/chat/EscalationBanner";
import { StrictModeToggle } from "@/components/StrictModeToggle";
import { PatientResponseToggle } from "@/components/PatientResponseToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExtensionBanner } from "@/components/ExtensionBanner";
import { FeedbackButton } from "@/components/FeedbackModal";
import { KeyboardShortcutsButton } from "@/components/KeyboardShortcutsModal";
import { BookmarksSidebar, useBookmarks } from "@/components/BookmarksSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { ReadingTime } from "@/components/ReadingTime";
import { getPHIWarning } from "@/lib/compliance/phi-detector";
import { getEscalationWarning } from "@/lib/compliance/escalation-detector";
import { cn } from "@/lib/utils";

interface Citation {
  id: string;
  number: number;
  heading: string;
  excerpt: string;
  score: number;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
}

interface SearchResult {
  id: string;
  heading: string;
  content: string;
  score: number;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  retrieved?: SearchResult[];
  timestamp: Date;
  feedback?: "up" | "down" | null;
}

const EXAMPLE_QUESTIONS = [
  "What are the key steps in the intake process?",
  "How do I handle a patient escalation?",
  "What is the procedure for scheduling appointments?",
  "How do I process insurance verification?",
  "What are the documentation requirements?",
];

const STORAGE_KEY = "fountain-chat-messages";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [patientResponse, setPatientResponse] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [phiWarning, setPHIWarning] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [googleDocUrl, setGoogleDocUrl] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<{show: boolean; categories: string[]; message: string}>({
    show: false, categories: [], message: ""
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [charCount, setCharCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Bookmarks hook
  const { bookmarks, addBookmark, removeBookmark, isBookmarked, getBookmarkId } = useBookmarks();

  // Fetch sources info including Google Doc URL
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch("/api/sources");
        if (response.ok) {
          const data = await response.json();
          if (data.googleDocUrl) {
            setGoogleDocUrl(data.googleDocUrl);
          }
        }
      } catch (e) {
        console.error("Failed to fetch sources:", e);
      }
    };
    fetchSources();
  }, []);

  // Load messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      }
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      // Update recent questions
      const questions = messages
        .filter(m => m.role === "user")
        .map(m => m.content)
        .slice(-10);
      setRecentQuestions([...new Set(questions)].slice(-5));
    } catch (e) {
      console.error("Failed to save messages:", e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (input.trim()) {
      setPHIWarning(getPHIWarning(input));
      setEscalation(getEscalationWarning(input));
    } else {
      setPHIWarning(null);
      setEscalation({ show: false, categories: [], message: "" });
    }
  }, [input]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Cmd/Ctrl + B to toggle bookmarks
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setShowBookmarks(prev => !prev);
      }
      // Cmd/Ctrl + E to export
      if ((e.metaKey || e.ctrlKey) && e.key === "e" && messages.length > 0) {
        e.preventDefault();
        handleExport();
      }
      // Escape to clear input or close sidebars
      if (e.key === "Escape") {
        if (showBookmarks) {
          setShowBookmarks(false);
        } else if (showHistory) {
          setShowHistory(false);
        } else if (input) {
          setInput("");
          setCharCount(0);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, showHistory, showBookmarks, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      citations: [],
      retrieved: [],
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, strict: strictMode, patientResponse, topK: 5 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";
      let citations: Citation[] = [];
      let retrieved: SearchResult[] = [];
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
              citations = parsed.citations;
              retrieved = parsed.retrieved;
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

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: fullContent, citations, retrieved } : msg
          )
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      // Create a more user-friendly error message with suggestions
      let displayError = errorMessage;
      let suggestion = "";
      
      if (errorMessage.includes("API key") || errorMessage.includes("401") || errorMessage.includes("Invalid API")) {
        suggestion = "The API key may be invalid or expired. Please contact the administrator.";
      } else if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("billing")) {
        suggestion = "The service quota has been exceeded. Please try again later or contact the administrator.";
      } else if (errorMessage.includes("network") || errorMessage.includes("connect") || errorMessage.includes("ENOTFOUND")) {
        suggestion = "Please check your internet connection and try again.";
      } else if (errorMessage.includes("ingested") || errorMessage.includes("No document")) {
        suggestion = "The document database may not be set up. Please contact the administrator.";
      } else if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
        suggestion = "The request timed out. Please try again with a shorter question.";
      }
      
      const fullError = suggestion 
        ? `${displayError}\n\n💡 ${suggestion}`
        : displayError;
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: `❌ ${fullError}` } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFeedback = (messageId: string, feedback: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
          : msg
      )
    );
  };

  const handleExport = () => {
    const content = messages
      .map((m) => {
        const role = m.role === "user" ? "You" : "Assistant";
        const time = new Date(m.timestamp).toLocaleString();
        return `[${time}] ${role}:\n${m.content}\n`;
      })
      .join("\n---\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fountain-chat-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
    setCharCount(question.length);
    inputRef.current?.focus();
  };

  const handleBookmarkToggle = (messageId: string, question: string, answer: string) => {
    if (isBookmarked(question)) {
      const id = getBookmarkId(question);
      if (id) removeBookmark(id);
    } else {
      addBookmark(question, answer);
    }
  };

  const getLastUserQuestion = (messageId: string): string => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        return messages[i].content;
      }
    }
    return "";
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop();

  return (
    <div className="min-h-screen bg-background pb-48 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400">
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
                <h1 className="text-lg font-semibold gradient-text">Fountain Workflows Q&A</h1>
                <p className="text-sm text-muted-foreground">Ask questions about internal procedures</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/sources">
                <Button variant="outline" size="sm" className="gap-2 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400">
                  <FileText className="h-4 w-4" />
                  Sources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Extension Banner */}
        <ExtensionBanner />

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <StrictModeToggle enabled={strictMode} onToggle={setStrictMode} />
            <PatientResponseToggle enabled={patientResponse} onToggle={setPatientResponse} />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)} 
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowContext(!showContext)} className="gap-2">
              {showContext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showContext ? "Hide" : "Show"} Context
            </Button>
            {messages.length > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recent Questions Sidebar */}
        {showHistory && recentQuestions.length > 0 && (
          <div className="mb-6 p-4 bg-card border border-border rounded-lg animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Questions
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {recentQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(q)}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-xl opacity-40 animate-pulse-soft" />
                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
              </div>
              <p className="text-foreground text-xl font-semibold gradient-text">Ask a question about Fountain workflows</p>
              <p className="text-muted-foreground text-sm mt-2 mb-8">
                Your question will be answered using only the official documentation
              </p>
              
              {/* Example Questions */}
              <div className="max-w-lg mx-auto">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-3 w-3 icon-purple" />
                  Try asking
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {EXAMPLE_QUESTIONS.slice(0, 3).map((q, i) => {
                    const colors = [
                      "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/20 hover:border-purple-500/40",
                      "from-cyan-500/10 to-green-500/10 hover:from-cyan-500/20 hover:to-green-500/20 border-cyan-500/20 hover:border-cyan-500/40",
                      "from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 border-orange-500/20 hover:border-orange-500/40"
                    ];
                    return (
                      <button
                        key={i}
                        onClick={() => handleExampleClick(q)}
                        className={`px-4 py-2.5 text-sm bg-gradient-to-r ${colors[i]} text-foreground rounded-full border transition-all hover:scale-105 hover:shadow-lg`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={cn(
                message.role === "user" ? "flex justify-end animate-slide-in-right" : "animate-slide-in-left",
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {message.role === "user" ? (
                <div className="max-w-[80%]">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-lg shadow-purple-500/20">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="bg-card border-0 rounded-xl p-4 shadow-lg relative overflow-hidden">
                    {message.content ? (
                      <>
                        <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                          {message.content}
                          {isLoading && message.id === lastAssistantMessage?.id && <span className="typing-cursor" />}
                        </p>
                        {!isLoading && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleFeedback(message.id, "up")}
                                className={cn("gap-1", message.feedback === "up" && "text-green-600 bg-green-50")}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleFeedback(message.id, "down")}
                                className={cn("gap-1", message.feedback === "down" && "text-red-600 bg-red-50")}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCopy(message.content, message.id)} 
                                className="gap-2"
                              >
                                {copied === message.id ? (
                                  <Check className="h-4 w-4 text-green-600 animate-success" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                {copied === message.id ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching document...
                        </div>
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-full" />
                          <div className="skeleton h-4 w-3/4" />
                          <div className="skeleton h-4 w-5/6" />
                        </div>
                      </div>
                    )}
                  </div>

                  {message.citations && message.citations.length > 0 && (
                    <div className="space-y-2 animate-fade-in-up">
                      <p className="text-sm font-medium text-foreground">Citations ({message.citations.length})</p>
                      <div className="grid gap-2">
                        {message.citations.map((citation) => (
                          <CitationCard
                            key={citation.id}
                            number={citation.number}
                            heading={citation.heading}
                            excerpt={citation.excerpt}
                            fullContent={message.retrieved?.find((r) => r.id === citation.id)?.content}
                            score={citation.score}
                            sourcePath={citation.sourcePath}
                            googleDocUrl={googleDocUrl || undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {showContext && message.retrieved && message.retrieved.length > 0 && (
                    <div className="bg-muted rounded-lg p-4 border border-border animate-fade-in">
                      <p className="text-sm font-medium text-foreground mb-3">Retrieved Context Chunks</p>
                      <div className="space-y-3">
                        {message.retrieved.map((chunk, i) => (
                          <div key={chunk.id} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">#{i + 1}</Badge>
                              <span className="font-medium text-foreground">{chunk.heading}</span>
                              <span className="text-muted-foreground">({Math.round(chunk.score * 100)}% match)</span>
                            </div>
                            <p className="text-muted-foreground line-clamp-3 pl-6">{chunk.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border p-4 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
        <div className="relative max-w-4xl mx-auto">
          {/* Warnings */}
          {phiWarning && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm p-3 rounded-xl mb-3 animate-fade-in shadow-lg">
              ⚠️ {phiWarning}
            </div>
          )}
          {escalation.show && (
            <div className="mb-3 animate-fade-in">
              <EscalationBanner
                categories={escalation.categories}
                message={escalation.message}
                onDismiss={() => setEscalation({ show: false, categories: [], message: "" })}
              />
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl opacity-0 focus-within:opacity-30 blur transition-opacity" />
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about workflows... (⌘K to focus)"
                  className="relative flex-1 min-h-[50px] max-h-[120px] resize-none bg-background rounded-xl border-2 focus:border-purple-500/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading} 
                className="px-6 h-[50px] btn-hover-lift bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 rounded-xl"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded badge-purple text-xs">Enter</span> to send
              <span className="text-muted-foreground/50">•</span>
              <span className="px-2 py-0.5 rounded badge-cyan text-xs">⌘K</span> to focus
              <span className="text-muted-foreground/50">•</span>
              <span className="px-2 py-0.5 rounded badge-pink text-xs">Esc</span> to clear
            </p>
          </form>
        </div>
      </div>

      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  );
}
