"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, ArrowRight, MessageSquare, FileText, Shield, 
  Zap, Target, Users, BookOpen, CheckCircle2, Sparkles,
  Clock, Heart, Search, Chrome, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AboutPage() {
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
                <h1 className="text-lg font-semibold gradient-text">About Fountain AI</h1>
                <p className="text-sm text-muted-foreground">Understanding the tool</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-lg shadow-purple-500/25">
            <MessageSquare className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            What is <span className="gradient-text">Fountain AI</span>?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An intelligent assistant that provides instant, accurate answers about Fountain workflows 
            and procedures—powered by your official documentation.
          </p>
        </section>

        {/* Purpose Section */}
        <section className="mb-16">
          <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Our Purpose</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Fountain AI was built to solve a common problem: finding accurate information quickly. 
                Instead of searching through lengthy documents or asking colleagues, team members can 
                now get instant answers to their workflow questions—all backed by official documentation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Reduce Search Time</p>
                    <p className="text-sm text-muted-foreground">Get answers in seconds, not minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Ensure Accuracy</p>
                    <p className="text-sm text-muted-foreground">Every answer cites its source</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Stay Consistent</p>
                    <p className="text-sm text-muted-foreground">Everyone gets the same correct information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Empower Teams</p>
                    <p className="text-sm text-muted-foreground">Work independently with confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Ask a Question</h3>
              <p className="text-sm text-muted-foreground">
                Type your question naturally, just like you&apos;d ask a colleague. Use voice input or pick from suggested questions.
              </p>
            </div>
            
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Searches Docs</h3>
              <p className="text-sm text-muted-foreground">
                The AI searches through the official Fountain Workflows document to find the most relevant information.
              </p>
            </div>
            
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Get Cited Answer</h3>
              <p className="text-sm text-muted-foreground">
                Receive a clear answer with citations linking to the exact sections in the source document.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Key Features</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Shield className="h-5 w-5" />}
              title="Strict Mode"
              description="Answers only from official documentation. No assumptions, no hallucinations—just facts."
              color="from-green-500 to-emerald-500"
            />
            <FeatureCard 
              icon={<Heart className="h-5 w-5" />}
              title="Patient Response Mode"
              description="Get answers in simple, patient-friendly language that's easy to understand and share."
              color="from-pink-500 to-rose-500"
            />
            <FeatureCard 
              icon={<FileText className="h-5 w-5" />}
              title="Source Citations"
              description="Every answer includes citations. Click to open the original source document."
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard 
              icon={<Zap className="h-5 w-5" />}
              title="Instant Answers"
              description="Get responses in seconds with streaming text. No waiting, no delays."
              color="from-amber-500 to-orange-500"
            />
            <FeatureCard 
              icon={<Search className="h-5 w-5" />}
              title="Voice Input"
              description="Speak your question instead of typing. Perfect for quick lookups."
              color="from-purple-500 to-violet-500"
            />
            <FeatureCard 
              icon={<Chrome className="h-5 w-5" />}
              title="Chrome Extension"
              description="Access the assistant from any browser tab with our Chrome extension."
              color="from-indigo-500 to-blue-500"
            />
          </div>
        </section>

        {/* Who Is This For */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Who Is This For?</h2>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Fountain AI is designed for internal team members who need quick access to workflow information:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-foreground">Patient care coordinators</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-foreground">Customer support representatives</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-foreground">Operations team members</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-foreground">New employees during onboarding</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-foreground">Pharmacy workflow specialists</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-foreground">Anyone with workflow questions</span>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-16">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <BookOpen className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Important Notes</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Internal Use Only</p>
                  <p className="text-sm text-muted-foreground">
                    This tool is for Fountain team members only. Do not share access with external parties.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">No PHI in Questions</p>
                  <p className="text-sm text-muted-foreground">
                    Never include patient names, DOBs, or other protected health information in your questions. Keep questions general and workflow-focused.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Use Professional Judgment</p>
                  <p className="text-sm text-muted-foreground">
                    While this tool provides accurate information, always use your training and judgment. Escalate complex situations to supervisors.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Information May Update</p>
                  <p className="text-sm text-muted-foreground">
                    Workflows are updated periodically. Check the Sources page to see when the documentation was last refreshed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Start asking questions and get instant answers about Fountain workflows.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Sparkles className="h-4 w-4" />
                Start Asking Questions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg" className="gap-2">
                View FAQ
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-purple-500/30 transition-colors">
      <div className={`p-2.5 rounded-lg bg-gradient-to-r ${color} text-white`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

