"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, ExternalLink, Copy, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CitationCardProps {
  number: number;
  heading: string;
  excerpt: string;
  fullContent?: string;
  score: number;
  sourcePath: string;
  googleDocUrl?: string;
}

const CITATION_COLORS = [
  { gradient: "from-purple-500 to-pink-500", badge: "badge-purple", shadow: "shadow-purple-500/20" },
  { gradient: "from-cyan-500 to-green-500", badge: "badge-cyan", shadow: "shadow-cyan-500/20" },
  { gradient: "from-orange-500 to-yellow-500", badge: "badge-orange", shadow: "shadow-orange-500/20" },
  { gradient: "from-pink-500 to-rose-500", badge: "badge-pink", shadow: "shadow-pink-500/20" },
  { gradient: "from-green-500 to-emerald-500", badge: "badge-green", shadow: "shadow-green-500/20" },
];

export function CitationCard({
  number,
  heading,
  excerpt,
  fullContent,
  score,
  sourcePath,
  googleDocUrl,
}: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const scorePercent = Math.round(score * 100);
  const scoreColor = scorePercent >= 70 
    ? "success" 
    : scorePercent >= 50 
    ? "warning" 
    : "secondary";
  
  const colorScheme = CITATION_COLORS[(number - 1) % CITATION_COLORS.length];

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[${heading}]\n${fullContent || excerpt}${googleDocUrl ? `\n\nSource: ${googleDocUrl}` : ''}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "border-0 rounded-xl overflow-hidden bg-card shadow-lg transition-all duration-300 hover:-translate-y-0.5",
      `hover:${colorScheme.shadow}`
    )}>
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className={cn(
          "h-8 w-8 rounded-lg bg-gradient-to-br text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg",
          colorScheme.gradient,
          colorScheme.shadow
        )}>
          {number}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground text-sm truncate">
              {heading}
            </p>
            <Badge variant={scoreColor} className="text-xs">
              {scorePercent}% match
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {excerpt}
          </p>
          
          {/* Source link - Always visible */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {googleDocUrl ? (
              <a
                href={googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:scale-105",
                  `bg-gradient-to-r ${colorScheme.gradient}`
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Source Document
              </a>
            ) : (
              <span className={cn(
                "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium",
                colorScheme.badge
              )}>
                <FileText className="h-3 w-3" />
                Source: {sourcePath}
              </span>
            )}
            {googleDocUrl && sourcePath && (
              <span className="text-xs text-muted-foreground">
                from {sourcePath}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-lg transition-all",
              copied ? "bg-green-500/10 text-green-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Copy citation"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            expanded ? "bg-muted text-foreground" : "text-muted-foreground"
          )}>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>
      
      {/* Expanded content */}
      {expanded && fullContent && (
        <div className="px-4 pb-4 pt-0 animate-fade-in">
          <div className={cn(
            "rounded-xl p-4 border-2",
            "bg-gradient-to-br from-muted/50 to-muted border-border"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className={cn("h-3.5 w-3.5", `text-${colorScheme.gradient.split('-')[1]}-500`)} />
                <span className="font-medium">Full excerpt from document</span>
              </div>
              {googleDocUrl && (
                <a
                  href={googleDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium hover:underline flex items-center gap-1 gradient-text"
                >
                  Open in Google Docs
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
              {fullContent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
