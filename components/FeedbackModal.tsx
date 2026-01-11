"use client";

import { useState } from "react";
import { MessageSquarePlus, X, Send, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = "suggestion" | "bug" | "question" | "other";

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedbackTypes: { value: FeedbackType; label: string; emoji: string }[] = [
    { value: "suggestion", label: "Suggestion", emoji: "💡" },
    { value: "bug", label: "Bug Report", emoji: "🐛" },
    { value: "question", label: "Question", emoji: "❓" },
    { value: "other", label: "Other", emoji: "📝" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Store feedback locally (could be extended to send to a backend)
      const feedback = {
        type: feedbackType,
        message: message.trim(),
        email: email.trim() || undefined,
        timestamp: new Date().toISOString(),
        source: "website",
        userAgent: navigator.userAgent,
      };

      // Store in localStorage for now (can be sent to backend later)
      const existingFeedback = JSON.parse(localStorage.getItem("fountain-feedback") || "[]");
      existingFeedback.push(feedback);
      localStorage.setItem("fountain-feedback", JSON.stringify(existingFeedback));

      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSubmitted(true);
      
      // Reset after showing success
      setTimeout(() => {
        setMessage("");
        setEmail("");
        setFeedbackType("suggestion");
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card rounded-xl shadow-2xl border border-border animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Send Feedback</h2>
              <p className="text-sm text-muted-foreground">Help us improve the app</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Thank you!</h3>
            <p className="text-muted-foreground">Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What type of feedback?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFeedbackType(type.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                      feedbackType === type.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    <span>{type.emoji}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your feedback
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  feedbackType === "suggestion" ? "I think it would be great if..." :
                  feedbackType === "bug" ? "I found an issue when..." :
                  feedbackType === "question" ? "I was wondering about..." :
                  "I wanted to share..."
                }
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If you'd like us to follow up with you
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !message.trim()}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Floating feedback button component
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        title="Send Feedback"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span className="text-sm font-medium">Feedback</span>
      </button>
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

