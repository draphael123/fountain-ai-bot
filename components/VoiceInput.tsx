"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported(
      typeof window !== "undefined" && 
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      
      setTranscript(text);
      
      if (result.isFinal) {
        onTranscript(text);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={cn(
          "h-[50px] w-[50px] rounded-xl transition-all",
          isListening 
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
            : "hover:bg-purple-500/10 hover:text-purple-600"
        )}
        title={isListening ? "Stop listening" : "Voice input"}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      
      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg animate-fade-in whitespace-nowrap">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            <span className="text-muted-foreground">
              {transcript || "Listening..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

