"use client";

import { Switch } from "@/components/ui/switch";
import { Shield, ShieldAlert } from "lucide-react";

interface StrictModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function StrictModeToggle({ enabled, onToggle }: StrictModeToggleProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className={`p-2 rounded-lg ${enabled ? "bg-blue-100" : "bg-slate-200"}`}>
        {enabled ? (
          <Shield className="h-4 w-4 text-blue-600" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-slate-500" />
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">
          Strict Mode
        </p>
        <p className="text-xs text-slate-500">
          {enabled 
            ? "Only answers from the document" 
            : "May include general context"}
        </p>
      </div>
      
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Toggle strict mode"
      />
    </div>
  );
}

