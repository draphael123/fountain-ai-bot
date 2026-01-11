"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Shield, MessageSquare, AlertTriangle, Sparkles, Chrome, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeedbackButton } from "@/components/FeedbackModal";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
      <header className="absolute top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-16">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-4 animate-fade-in-up">
              <Image 
                src="/logo.png" 
                alt="Fountain Workflows Logo" 
                width={120} 
                height={120}
                className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Shield className="h-4 w-4" />
              Internal Operations Tool
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Fountain Workflows
              <span className="block gradient-text">Assistant</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Get instant, accurate answers about internal workflows and procedures.
              All responses are grounded in official documentation with full citations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/chat">
                <Button size="lg" className="gap-2 btn-hover-lift">
                  <Sparkles className="h-4 w-4" />
                  Start Asking Questions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sources">
                <Button variant="outline" size="lg" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Document Sources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="max-w-4xl mx-auto px-6 -mt-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Internal Use Only</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This tool is for internal operations staff only. Do not share externally.
                Do not enter any Protected Health Information (PHI) or patient data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Document-Grounded</CardTitle>
              <CardDescription>
                Every answer comes directly from official workflow documentation.
                No hallucinations or made-up information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg text-foreground">Full Citations</CardTitle>
              <CardDescription>
                See exactly which section each piece of information comes from.
                Click to view the original text.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg text-foreground">Strict Mode</CardTitle>
              <CardDescription>
                Enforces answers only from the document. 
                If it&apos;s not in the doc, it says so clearly.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Chrome Extension Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <Card className="border-border bg-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.85s" }}>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Chrome className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">Chrome Extension</CardTitle>
                <CardDescription>
                  Access Fountain Workflows from anywhere in your browser
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Quick access from any webpage
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Same powerful Q&A functionality
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    PHI detection & escalation warnings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Keyboard shortcuts for quick access
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Installation</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Download and unzip the extension</li>
                  <li>Open <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code></li>
                  <li>Enable &quot;Developer mode&quot; (top right)</li>
                  <li>Click &quot;Load unpacked&quot; and select the unzipped folder</li>
                </ol>
                <div className="flex gap-3 pt-2">
                  <a href="/fountain-extension.zip" download>
                    <Button variant="default" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Extension (.zip)
                    </Button>
                  </a>
                  <a 
                    href="https://github.com/draphael123/fountain-ai-bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View on GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8 animate-fade-in">
          How It Works
        </h2>
        
        <div className="space-y-4">
          {[
            { num: 1, title: "Ask your question", desc: "Type any question about workflows, procedures, or policies." },
            { num: 2, title: "System finds relevant sections", desc: "The most relevant parts of the documentation are retrieved using semantic search." },
            { num: 3, title: "Get a grounded answer", desc: "Receive a clear answer with numbered citations linking to source sections." },
          ].map((step, i) => (
            <div 
              key={step.num} 
              className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.9 + i * 0.1}s` }}
            >
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {step.num}
              </div>
              <div>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image 
              src="/logo.png" 
              alt="Fountain Workflows Logo" 
              width={24} 
              height={24}
              className="rounded"
            />
            <span className="font-medium text-foreground">Fountain Workflows Assistant</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Internal Use Only &bull; Do Not Share Externally
          </p>
        </div>
      </footer>

      {/* Feedback Button */}
      <FeedbackButton />
    </main>
  );
}
