"use client";

import { Switch } from "@/components/ui/switch";
import { Heart, Users } from "lucide-react";

interface PatientResponseToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function PatientResponseToggle({ enabled, onToggle }: PatientResponseToggleProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      enabled 
        ? "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800" 
        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
    }`}>
      <div className={`p-2 rounded-lg transition-all ${
        enabled 
          ? "bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30" 
          : "bg-slate-200 dark:bg-slate-700"
      }`}>
        {enabled ? (
          <Heart className="h-4 w-4 text-white" />
        ) : (
          <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        )}
      </div>
      
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          enabled 
            ? "text-pink-700 dark:text-pink-300" 
            : "text-slate-900 dark:text-slate-100"
        }`}>
          Patient Response
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {enabled 
            ? "Simple, patient-friendly language" 
            : "Standard staff response"}
        </p>
      </div>
      
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Toggle patient response mode"
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500"
      />
    </div>
  );
}

