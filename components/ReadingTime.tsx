"use client";

import { Clock } from "lucide-react";

interface ReadingTimeProps {
  text: string;
  className?: string;
}

export function ReadingTime({ text, className }: ReadingTimeProps) {
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  if (minutes < 1) return null;

  return (
    <span className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <Clock className="h-3 w-3" />
      {minutes} min read
    </span>
  );
}

// Calculate word count
export function WordCount({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).length;
  
  return (
    <span className="text-xs text-muted-foreground">
      {words} words
    </span>
  );
}


