"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Send, Loader2, Copy, Check, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CitationCard } from "@/components/chat/CitationCard";
import { EscalationBanner } from "@/components/chat/EscalationBanner";
import { StrictModeToggle } from "@/components/StrictModeToggle";
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
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phiWarning, setPHIWarning] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<{show: boolean; categories: string[]; message: string}>({
    show: false, categories: [], message: ""
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop();

  return (
    <div className="min-h-screen bg-slate-50 pb-48">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Fountain Workflows Q&A</h1>
                <p className="text-sm text-slate-500">Ask questions about internal procedures</p>
              </div>
            </div>
            <Link href="/sources">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Sources
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
          <StrictModeToggle enabled={strictMode} onToggle={setStrictMode} />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowContext(!showContext)} className="gap-2">
              {showContext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showContext ? "Hide" : "Show"} Context
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">Ask a question about Fountain workflows</p>
              <p className="text-slate-400 text-sm mt-2">Your question will be answered using only the official documentation</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={cn("animate-fade-in", message.role === "user" ? "flex justify-end" : "")}>
              {message.role === "user" ? (
                <div className="max-w-[80%] bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    {message.content ? (
                      <>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                          {message.content}
                          {isLoading && message.id === lastAssistantMessage?.id && <span className="typing-cursor" />}
                        </p>
                        {!isLoading && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                            <Button variant="ghost" size="sm" onClick={() => handleCopy(message.content)} className="gap-2">
                              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                              {copied ? "Copied" : "Copy"}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching document...
                      </div>
                    )}
                  </div>

                  {message.citations && message.citations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Citations ({message.citations.length})</p>
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
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-3">Retrieved Context Chunks</p>
                      <div className="space-y-3">
                        {message.retrieved.map((chunk, i) => (
                          <div key={chunk.id} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">#{i + 1}</Badge>
                              <span className="font-medium text-slate-700">{chunk.heading}</span>
                              <span className="text-slate-400">({Math.round(chunk.score * 100)}% match)</span>
                            </div>
                            <p className="text-slate-600 line-clamp-3 pl-6">{chunk.content}</p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Warnings */}
          {phiWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg mb-3">
              ⚠️ {phiWarning}
            </div>
          )}
          {escalation.show && (
            <div className="mb-3">
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about workflows..."
                className="flex-1 min-h-[50px] max-h-[120px] resize-none bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading} className="px-6 h-[50px]">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </form>
        </div>
      </div>
    </div>
  );
}
