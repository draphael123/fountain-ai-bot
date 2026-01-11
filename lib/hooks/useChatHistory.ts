"use client";

import { useState, useEffect, useCallback } from "react";

interface Citation {
  id: string;
  number: number;
  heading: string;
  excerpt: string;
  score: number;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
}

interface SearchResult {
  id: string;
  heading: string;
  content: string;
  score: number;
  sourcePath: string;
  offsetStart: number;
  offsetEnd: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  retrieved?: SearchResult[];
  timestamp: Date;
  feedback?: "up" | "down" | null;
}

interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title: string;
}

const STORAGE_KEY = "fountain-chat-history";
const MAX_SESSIONS = 20;

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const sessionsWithDates = parsed.map((s: ChatSession) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setSessions(sessionsWithDates);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [sessions, loaded]);

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      title: "New conversation",
    };
    setSessions((prev) => {
      const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
      return updated;
    });
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  const getCurrentSession = useCallback(() => {
    return sessions.find((s) => s.id === currentSessionId);
  }, [sessions, currentSessionId]);

  const addMessage = useCallback((message: Message) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          const messages = [...session.messages, message];
          // Update title from first user message
          const title =
            session.messages.length === 0 && message.role === "user"
              ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
              : session.title;
          return {
            ...session,
            messages,
            updatedAt: new Date(),
            title,
          };
        }
        return session;
      })
    );
  }, [currentSessionId]);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: session.messages.map((m) =>
              m.id === messageId ? { ...m, ...updates } : m
            ),
            updatedAt: new Date(),
          };
        }
        return session;
      })
    );
  }, [currentSessionId]);

  const setFeedback = useCallback((messageId: string, feedback: "up" | "down" | null) => {
    updateMessage(messageId, { feedback });
  }, [updateMessage]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  const clearCurrentSession = useCallback(() => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? { ...session, messages: [], updatedAt: new Date(), title: "New conversation" }
          : session
      )
    );
  }, [currentSessionId]);

  const getRecentQuestions = useCallback((limit = 5) => {
    const questions: { question: string; sessionId: string; timestamp: Date }[] = [];
    for (const session of sessions) {
      for (const message of session.messages) {
        if (message.role === "user") {
          questions.push({
            question: message.content,
            sessionId: session.id,
            timestamp: message.timestamp,
          });
        }
      }
    }
    return questions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [sessions]);

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createSession,
    getCurrentSession,
    addMessage,
    updateMessage,
    setFeedback,
    deleteSession,
    clearCurrentSession,
    getRecentQuestions,
    loaded,
  };
}

