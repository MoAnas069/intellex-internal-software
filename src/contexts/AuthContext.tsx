'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserRole } from '@/types';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

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

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        // Identify role from email or existing state
        const role: UserRole = fbUser.email.includes('owner') ? 'owner' : 'student_manager';
        const mappedUser: AuthUser = {
          uid: fbUser.uid,
          role,
          name: role === 'owner' ? 'Owner' : 'Amal',
          email: fbUser.email,
        };
        setUser(mappedUser);
        localStorage.setItem('intellex_user', JSON.stringify(mappedUser));
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (role: UserRole, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const creds = DEMO_CREDENTIALS[role];
      if (!creds || creds.password !== password) {
        return false;
      }

      // Try Firebase Auth if configured
      if (auth) {
        try {
          await signInWithEmailAndPassword(auth, creds.user.email, password);
        } catch (authErr: any) {
          // If user doesn't exist yet in new project, create the user
          if (
            authErr.code === 'auth/user-not-found' ||
            authErr.code === 'auth/invalid-credential' ||
            authErr.code === 'auth/invalid-login-credentials'
          ) {
            try {
              await createUserWithEmailAndPassword(auth, creds.user.email, password);
            } catch (createErr) {
              console.warn('[AuthContext] Firebase create user notice:', createErr);
            }
          }
        }
      }

      // Set user state
      setUser(creds.user);
      localStorage.setItem('intellex_user', JSON.stringify(creds.user));
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (auth) {
      signOut(auth).catch((err) => console.warn('[AuthContext] Firebase signOut error:', err));
    }
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
