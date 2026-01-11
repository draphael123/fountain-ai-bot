"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, ExternalLink, Copy, Check } from "lucide-react";
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[${heading}]\n${fullContent || excerpt}${googleDocUrl ? `\n\nSource: ${googleDocUrl}` : ''}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/30 transition-colors">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left flex items-start gap-3 hover:bg-muted/50 transition-colors"
      >
        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
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
          {googleDocUrl && (
            <div className="flex items-center gap-3 mt-2">
              <a
                href={googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors bg-primary/5 px-2 py-1 rounded"
              >
                <ExternalLink className="h-3 w-3" />
                View Source
              </a>
              <span className="text-xs text-muted-foreground">
                {sourcePath}
              </span>
            </div>
          )}
          {!googleDocUrl && sourcePath && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {sourcePath}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Copy citation"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <div className="text-muted-foreground">
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
        <div className="px-3 pb-3 pt-0 animate-fade-in">
          <div className="bg-muted rounded-md p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                Full excerpt from document
              </div>
              {googleDocUrl && (
                <a
                  href={googleDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
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
