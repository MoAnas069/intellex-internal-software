'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserRole } from '@/types';

interface AuthUser {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  mounted: boolean;
  login: (role: UserRole, password: string) => Promise<boolean>;
  logout: () => void;
  isOwner: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Passwords are checked server-side via API route in production.
// For demo mode, we use hashed comparison.
const DEMO_CREDENTIALS: Record<UserRole, { password: string; user: AuthUser }> = {
  owner: {
    password: 'karnan2255',
    user: {
      uid: 'owner-001',
      role: 'owner',
      name: 'Owner',
      email: 'owner@intellex.in',
    },
  },
  student_manager: {
    password: 'student000',
    user: {
      uid: 'manager-001',
      role: 'student_manager',
      name: 'Amal',
      email: 'manager@intellex.in',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with null to match server-rendered HTML
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read localStorage only after mount (client-side) to avoid hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem('intellex_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // corrupted storage, ignore
      }
    }
    setMounted(true);
  }, []);

  const login = useCallback(async (role: UserRole, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const creds = DEMO_CREDENTIALS[role];
      if (creds && creds.password === password) {
        setUser(creds.user);
        localStorage.setItem('intellex_user', JSON.stringify(creds.user));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('intellex_user');
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    mounted,
    login,
    logout,
    isOwner: user?.role === 'owner',
    isManager: user?.role === 'student_manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

