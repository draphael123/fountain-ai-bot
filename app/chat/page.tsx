"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, FileText, Send, Loader2, Copy, Check, Eye, EyeOff, 
  RotateCcw, ThumbsUp, ThumbsDown, Download, Clock, MessageSquare,
  Sparkles, X, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CitationCard } from "@/components/chat/CitationCard";
import { EscalationBanner } from "@/components/chat/EscalationBanner";
import { StrictModeToggle } from "@/components/StrictModeToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const [showContext, setShowContext] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [phiWarning, setPHIWarning] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [escalation, setEscalation] = useState<{show: boolean; categories: string[]; message: string}>({
    show: false, categories: [], message: ""
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      // Escape to clear input or close history
      if (e.key === "Escape") {
        if (showHistory) {
          setShowHistory(false);
        } else if (input) {
          setInput("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, showHistory]);

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
        body: JSON.stringify({ question, strict: strictMode, topK: 5 }),
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
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: `Error: ${errorMessage}` } : msg
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
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop();

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Fountain Workflows Q&A</h1>
                <p className="text-sm text-muted-foreground">Ask questions about internal procedures</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/sources">
                <Button variant="outline" size="sm" className="gap-2">
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
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-border mb-6">
          <StrictModeToggle enabled={strictMode} onToggle={setStrictMode} />
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground text-lg font-medium">Ask a question about Fountain workflows</p>
              <p className="text-muted-foreground text-sm mt-2 mb-8">
                Your question will be answered using only the official documentation
              </p>
              
              {/* Example Questions */}
              <div className="max-w-md mx-auto">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Try asking
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLE_QUESTIONS.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(q)}
                      className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all hover:scale-105"
                    >
                      {q}
                    </button>
                  ))}
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
                  <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
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
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Warnings */}
          {phiWarning && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm p-3 rounded-lg mb-3 animate-fade-in">
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
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about workflows... (⌘K to focus)"
                className="flex-1 min-h-[50px] max-h-[120px] resize-none bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading} 
                className="px-6 h-[50px] btn-hover-lift"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line • ⌘K to focus • Esc to clear
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
