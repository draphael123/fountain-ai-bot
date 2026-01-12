"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, FileText, Download, Trash2, Moon, Sun, 
  Bookmark, MessageSquare, Keyboard, Settings, X,
  Sparkles, HelpCircle, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: "navigation" | "actions" | "settings";
}

interface CommandPaletteProps {
  onExport?: () => void;
  onClear?: () => void;
  onToggleBookmarks?: () => void;
  onFocusInput?: () => void;
  exampleQuestions?: string[];
  onAskQuestion?: (question: string) => void;
}

export function CommandPalette({
  onExport,
  onClear,
  onToggleBookmarks,
  onFocusInput,
  exampleQuestions = [],
  onAskQuestion,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const commands: Command[] = [
    {
      id: "focus-input",
      label: "Focus Input",
      description: "Start typing a question",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => { onFocusInput?.(); setIsOpen(false); },
      shortcut: "⌘K",
      category: "navigation",
    },
    {
      id: "toggle-bookmarks",
      label: "Toggle Bookmarks",
      description: "View saved Q&A pairs",
      icon: <Bookmark className="h-4 w-4" />,
      action: () => { onToggleBookmarks?.(); setIsOpen(false); },
      shortcut: "⌘B",
      category: "navigation",
    },
    {
      id: "view-sources",
      label: "View Sources",
      description: "See document sources",
      icon: <FileText className="h-4 w-4" />,
      action: () => { window.location.href = "/sources"; },
      category: "navigation",
    },
    {
      id: "export-chat",
      label: "Export Chat",
      description: "Download conversation as text",
      icon: <Download className="h-4 w-4" />,
      action: () => { onExport?.(); setIsOpen(false); },
      shortcut: "⌘E",
      category: "actions",
    },
    {
      id: "clear-chat",
      label: "Clear Chat",
      description: "Remove all messages",
      icon: <Trash2 className="h-4 w-4" />,
      action: () => { onClear?.(); setIsOpen(false); },
      category: "actions",
    },
    {
      id: "toggle-theme",
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      description: "Switch color theme",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => { setTheme(theme === "dark" ? "light" : "dark"); setIsOpen(false); },
      category: "settings",
    },
    {
      id: "keyboard-shortcuts",
      label: "Keyboard Shortcuts",
      description: "View all shortcuts",
      icon: <Keyboard className="h-4 w-4" />,
      action: () => { setIsOpen(false); },
      shortcut: "?",
      category: "settings",
    },
    {
      id: "help",
      label: "Help & Documentation",
      description: "Get help using this app",
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => { window.location.href = "/"; },
      category: "settings",
    },
  ];

  // Add example questions as commands
  const questionCommands: Command[] = exampleQuestions.slice(0, 5).map((q, i) => ({
    id: `question-${i}`,
    label: q,
    icon: <Sparkles className="h-4 w-4 text-purple-500" />,
    action: () => { onAskQuestion?.(q); setIsOpen(false); },
    category: "actions" as const,
  }));

  const allCommands = [...commands, ...questionCommands];

  const filteredCommands = allCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === "navigation"),
    actions: filteredCommands.filter(c => c.category === "actions"),
    settings: filteredCommands.filter(c => c.category === "settings"),
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open palette with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch("");
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      // Navigate with arrow keys
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      // Execute with Enter
      if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
      // Close with Escape
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No commands found
            </div>
          ) : (
            <>
              {/* Navigation */}
              {groupedCommands.navigation.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 py-1">Navigation</p>
                  {groupedCommands.navigation.map((cmd, i) => (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      isSelected={filteredCommands.indexOf(cmd) === selectedIndex}
                      onClick={cmd.action}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              {groupedCommands.actions.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 py-1">Actions</p>
                  {groupedCommands.actions.map((cmd, i) => (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      isSelected={filteredCommands.indexOf(cmd) === selectedIndex}
                      onClick={cmd.action}
                    />
                  ))}
                </div>
              )}

              {/* Settings */}
              {groupedCommands.settings.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 py-1">Settings</p>
                  {groupedCommands.settings.map((cmd, i) => (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      isSelected={filteredCommands.indexOf(cmd) === selectedIndex}
                      onClick={cmd.action}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandItem({ 
  command, 
  isSelected, 
  onClick 
}: { 
  command: Command; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
        isSelected 
          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" 
          : "hover:bg-muted text-foreground"
      )}
    >
      <span className={cn(
        "p-1.5 rounded-md",
        isSelected ? "bg-purple-500/20" : "bg-muted"
      )}>
        {command.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{command.label}</p>
        {command.description && (
          <p className="text-xs text-muted-foreground truncate">{command.description}</p>
        )}
      </div>
      {command.shortcut && (
        <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}

