"use client";

import { useState, useEffect } from "react";
import { Bookmark, X, Trash2, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookmarkedAnswer {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

interface BookmarksSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookmark: (question: string) => void;
}

const STORAGE_KEY = "fountain-bookmarks";

export function BookmarksSidebar({ isOpen, onClose, onSelectBookmark }: BookmarksSidebarProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkedAnswer[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, [isOpen]);

  const loadBookmarks = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load bookmarks:", e);
    }
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAllBookmarks = () => {
    if (confirm("Are you sure you want to clear all bookmarks?")) {
      setBookmarks([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Saved Answers</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {bookmarks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {bookmarks.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearAllBookmarks}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-65px)] overflow-y-auto p-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No saved answers yet</p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Click the bookmark icon on any answer to save it
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {bookmark.question}
                    </p>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove bookmark"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {bookmark.answer}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(bookmark.timestamp)}
                    </span>
                    <button
                      onClick={() => {
                        onSelectBookmark(bookmark.question);
                        onClose();
                      }}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      Ask again
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Hook for managing bookmarks
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedAnswer[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load bookmarks:", e);
    }
  }, []);

  const addBookmark = (question: string, answer: string) => {
    const newBookmark: BookmarkedAnswer = {
      id: `bookmark-${Date.now()}`,
      question,
      answer,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newBookmark, ...bookmarks.filter(b => b.question !== question)].slice(0, 50);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newBookmark.id;
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isBookmarked = (question: string) => {
    return bookmarks.some(b => b.question === question);
  };

  const getBookmarkId = (question: string) => {
    return bookmarks.find(b => b.question === question)?.id;
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, getBookmarkId };
}

