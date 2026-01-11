"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CitationCardProps {
  number: number;
  heading: string;
  excerpt: string;
  fullContent?: string;
  score: number;
  sourcePath: string;
}

export function CitationCard({
  number,
  heading,
  excerpt,
  fullContent,
  score,
}: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const scorePercent = Math.round(score * 100);
  const scoreColor = scorePercent >= 70 
    ? "success" 
    : scorePercent >= 50 
    ? "warning" 
    : "secondary";

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {number}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-slate-900 text-sm truncate">
              {heading}
            </p>
            <Badge variant={scoreColor} className="text-xs">
              {scorePercent}% match
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
            {excerpt}
          </p>
        </div>
        
        <div className="flex-shrink-0 text-slate-400">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
      
      {expanded && fullContent && (
        <div className="px-3 pb-3 pt-0 animate-fade-in">
          <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <FileText className="h-3 w-3" />
              Full excerpt from document
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {fullContent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

