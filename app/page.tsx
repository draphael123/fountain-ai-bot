"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Shield, MessageSquare, AlertTriangle, Sparkles, Chrome, Download, ExternalLink, Zap, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeedbackButton } from "@/components/FeedbackModal";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background mesh */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      
      {/* Decorative blobs */}
      <div className="fixed top-20 -left-32 w-96 h-96 blob blob-purple blur-3xl opacity-30 animate-float pointer-events-none" />
      <div className="fixed top-40 -right-32 w-80 h-80 blob blob-cyan blur-3xl opacity-30 animate-float-delayed pointer-events-none" />
      <div className="fixed bottom-20 left-1/4 w-72 h-72 blob blob-orange blur-3xl opacity-20 animate-float pointer-events-none" />
      
      {/* Header */}
      <header className="absolute top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-16">
          <div className="text-center space-y-6">
            {/* Logo with glow effect */}
            <div className="flex justify-center mb-4 animate-fade-in-up">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-xl opacity-40 animate-pulse-soft" />
                <Image 
                  src="/logo.png" 
                  alt="Fountain Workflows Logo" 
                  width={120} 
                  height={120}
                  className="relative rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full text-sm font-medium animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Shield className="h-4 w-4 icon-purple" />
              <span className="gradient-text font-semibold">Internal Operations Tool</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Fountain Workflows
              <span className="block gradient-text rainbow-underline inline-block mt-2">Assistant</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Get instant, accurate answers about internal workflows and procedures.
              All responses are grounded in official documentation with full citations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/chat">
                <Button size="lg" className="gap-2 btn-hover-lift bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
                  <Sparkles className="h-4 w-4" />
                  Start Asking Questions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sources">
                <Button variant="outline" size="lg" className="gap-2 border-2 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all">
                  <FileText className="h-4 w-4" />
                  View Document Sources
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg badge-purple">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">Instant</p>
                  <p className="text-sm text-muted-foreground">Responses</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg badge-cyan">
                  <Star className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Document-Based</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg badge-pink">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">Easy</p>
                  <p className="text-sm text-muted-foreground">To Use</p>
                </div>
              </div>
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
      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12 animate-fade-in">
          <span className="gradient-text">Why Choose</span> Our Assistant?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative border-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up group" style={{ animationDelay: "0.6s" }}>
            <div className="absolute inset-0 rounded-lg border-gradient opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-foreground">Document-Grounded</CardTitle>
              <CardDescription className="text-muted-foreground">
                Every answer comes directly from official workflow documentation.
                No hallucinations or made-up information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative border-0 bg-gradient-to-br from-cyan-500/5 to-green-500/5 hover:from-cyan-500/10 hover:to-green-500/10 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up group" style={{ animationDelay: "0.7s" }}>
            <div className="absolute inset-0 rounded-lg border-gradient opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/30">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-foreground">Full Citations</CardTitle>
              <CardDescription className="text-muted-foreground">
                See exactly which section each piece of information comes from.
                Click to view the original text.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative border-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 hover:from-orange-500/10 hover:to-yellow-500/10 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up group" style={{ animationDelay: "0.8s" }}>
            <div className="absolute inset-0 rounded-lg border-gradient opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-foreground">Strict Mode</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enforces answers only from the document. 
                If it&apos;s not in the doc, it says so clearly.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Chrome Extension Section */}
      <div className="relative max-w-4xl mx-auto px-6 pb-16">
        <Card className="relative border-0 overflow-hidden animate-fade-in-up shadow-2xl" style={{ animationDelay: "0.85s" }}>
          {/* Colorful background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
          
          <CardHeader className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <Chrome className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Chrome Extension</CardTitle>
                <CardDescription className="text-white/80">
                  Access Fountain Workflows from anywhere in your browser
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6 bg-card">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 icon-purple" />
                  Features
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full badge-purple flex items-center justify-center text-xs font-bold">1</div>
                    Quick access from any webpage
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full badge-pink flex items-center justify-center text-xs font-bold">2</div>
                    Same powerful Q&A functionality
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full badge-cyan flex items-center justify-center text-xs font-bold">3</div>
                    PHI detection & escalation warnings
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full badge-orange flex items-center justify-center text-xs font-bold">4</div>
                    Keyboard shortcuts for quick access
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Download className="h-4 w-4 icon-cyan" />
                  Installation
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Download and unzip the extension</li>
                  <li>Open <code className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-2 py-0.5 rounded text-xs font-mono">chrome://extensions</code></li>
                  <li>Enable &quot;Developer mode&quot; (top right)</li>
                  <li>Click &quot;Load unpacked&quot; and select the unzipped folder</li>
                </ol>
                <div className="flex gap-3 pt-2">
                  <a href="/fountain-extension.zip" download>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
                      <Download className="h-4 w-4" />
                      Download Extension
                    </Button>
                  </a>
                  <a 
                    href="https://github.com/draphael123/fountain-ai-bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400">
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
      <div className="relative max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-12 animate-fade-in">
          <span className="gradient-text">How It Works</span>
        </h2>
        
        <div className="space-y-4">
          {[
            { num: 1, title: "Ask your question", desc: "Type any question about workflows, procedures, or policies.", color: "from-purple-500 to-pink-500", badge: "badge-purple" },
            { num: 2, title: "System finds relevant sections", desc: "The most relevant parts of the documentation are retrieved using semantic search.", color: "from-cyan-500 to-green-500", badge: "badge-cyan" },
            { num: 3, title: "Get a grounded answer", desc: "Receive a clear answer with numbered citations linking to source sections.", color: "from-orange-500 to-yellow-500", badge: "badge-orange" },
          ].map((step, i) => (
            <div 
              key={step.num} 
              className="flex items-start gap-4 p-5 bg-card rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up group"
              style={{ animationDelay: `${0.9 + i * 0.1}s` }}
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                {step.num}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">{step.title}</p>
                <p className="text-muted-foreground mt-1">{step.desc}</p>
              </div>
              <div className={`hidden md:block px-3 py-1 rounded-full ${step.badge} text-xs font-medium`}>
                Step {step.num}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-border bg-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-lg blur opacity-30" />
              <Image 
                src="/logo.png" 
                alt="Fountain Workflows Logo" 
                width={32} 
                height={32}
                className="relative rounded-lg"
              />
            </div>
            <span className="font-semibold text-foreground gradient-text text-lg">Fountain Workflows Assistant</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Internal Use Only &bull; Do Not Share Externally
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="px-3 py-1 rounded-full badge-purple text-xs">Secure</span>
            <span className="px-3 py-1 rounded-full badge-cyan text-xs">Fast</span>
            <span className="px-3 py-1 rounded-full badge-pink text-xs">Reliable</span>
          </div>
        </div>
      </footer>

      {/* Feedback Button */}
      <FeedbackButton />
    </main>
  );
}
