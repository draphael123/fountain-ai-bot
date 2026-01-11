"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";
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
  googleDocUrl,
}: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const scorePercent = Math.round(score * 100);
  const scoreColor = scorePercent >= 70 
    ? "success" 
    : scorePercent >= 50 
    ? "warning" 
    : "secondary";

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/30 transition-colors">
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
        </div>
        
        <div className="flex-shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 pt-0 animate-fade-in">
          {fullContent && (
            <div className="bg-muted rounded-md p-3 border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileText className="h-3 w-3" />
                Full excerpt from document
              </div>
              <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                {fullContent}
              </p>
            </div>
          )}
          
          {googleDocUrl && (
            <a
              href={googleDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View in Google Docs
            </a>
          )}
        </div>
      )}
    </div>
  );
}
