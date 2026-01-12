"use client";

import { AlertTriangle, X } from "lucide-react";

interface EscalationBannerProps {
  categories: string[];
  message: string;
  onDismiss: () => void;
}

export function EscalationBanner({ categories, message, onDismiss }: EscalationBannerProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-red-800">
              Escalation Required: {categories.join(", ")}
            </p>
            <button
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800 p-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-red-700 mt-1">
            {message}
          </p>
          <p className="text-sm text-red-600 mt-2 font-medium">
            ⚠️ Follow the documented escalation workflow before responding to the patient/customer.
          </p>
        </div>
      </div>
    </div>
  );
}


