"use client";

import { useState, useEffect } from "react";
import { 
  X, ArrowRight, ArrowLeft, Sparkles, Shield, 
  Mic, Bookmark, Download, Heart, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Fountain AI! 👋",
    description: "Your intelligent assistant for Fountain workflows and procedures. Get instant, accurate answers grounded in official documentation.",
    icon: <Sparkles className="h-8 w-8" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "strict-mode",
    title: "Strict Mode",
    description: "When enabled, answers are strictly limited to information found in the documentation. Turn it off for more flexible responses.",
    icon: <Shield className="h-8 w-8" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "patient-mode",
    title: "Patient Response Mode",
    description: "Enable this to get answers in simple, patient-friendly language. Perfect for sharing information with patients.",
    icon: <Heart className="h-8 w-8" />,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "voice-input",
    title: "Voice Input",
    description: "Click the microphone icon to speak your question. Great for quick questions without typing!",
    icon: <Mic className="h-8 w-8" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "command-palette",
    title: "Command Palette",
    description: "Press ⌘K (or Ctrl+K) to open the command palette. Quickly access any feature, search commands, or ask example questions.",
    icon: <Search className="h-8 w-8" />,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    description: "Save important Q&A pairs for quick reference later. Press ⌘B to toggle your bookmarks sidebar.",
    icon: <Bookmark className="h-8 w-8" />,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "export",
    title: "Export & Share",
    description: "Export your conversation as a text file or PDF. Great for documentation and sharing with colleagues.",
    icon: <Download className="h-8 w-8" />,
    color: "from-teal-500 to-green-500",
  },
];

const STORAGE_KEY = "fountain-onboarding-complete";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay showing the tour slightly for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in-up">
        {/* Header gradient */}
        <div className={cn(
          "h-2 bg-gradient-to-r",
          step.color
        )} />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-gradient-to-br text-white shadow-lg",
            step.color
          )}>
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentStep 
                    ? "w-6 bg-primary" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip Tour
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className={cn(
                "flex-1 gap-2 bg-gradient-to-r text-white border-0",
                step.color
              )}
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step counter */}
        <div className="px-8 pb-4 text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </div>
      </div>
    </div>
  );
}

// Button to restart the tour
export function RestartTourButton() {
  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleRestart} className="gap-2">
      <Sparkles className="h-4 w-4" />
      Tour
    </Button>
  );
}

