import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TableInfo {
  id: string;
  number: number;
  capacity: number;
  status: string;
}

interface SessionData {
  sessionId: string;
  sessionSecret: string;
  tableInfo: TableInfo;
  expiresAt: Date;
}

interface SessionContextType {
  session: SessionData | null;
  isLoading: boolean;
  error: string | null;
  initializeSession: (sessionData: SessionData) => void;
  clearSession: () => void;
  getTimeRemaining: () => number | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'table_session';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        // Convert expiresAt string back to Date
        parsed.expiresAt = new Date(parsed.expiresAt);
        
        // Check if session is expired
        if (parsed.expiresAt > new Date()) {
          setSession(parsed);
        } else {
          // Clear expired session
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  const initializeSession = (sessionData: SessionData) => {
    setSession(sessionData);
    setError(null);
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const getTimeRemaining = (): number | null => {
    if (!session) return null;
    const now = new Date().getTime();
    const expiresAt = new Date(session.expiresAt).getTime();
    const remaining = Math.max(0, expiresAt - now);
    return Math.floor(remaining / 1000 / 60); // Return minutes
  };

  const value: SessionContextType = {
    session,
    isLoading,
    error,
    initializeSession,
    clearSession,
    getTimeRemaining,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
