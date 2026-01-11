"use client";

import { useState, useEffect } from "react";
import { Chrome, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "fountain-extension-banner-dismissed";

export function ExtensionBanner() {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!mounted || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4 animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Chrome className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">
            Get the Chrome Extension
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Access Fountain Workflows from anywhere in your browser with our Chrome extension.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <a href="/fountain-extension.zip" download>
              <Button size="sm" className="gap-2">
                <Chrome className="h-4 w-4" />
                Download Extension
              </Button>
            </a>
            <a 
              href="/"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}

