'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types';

import AuthModal from '@/components/auth-modal';

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  shippingAddress?: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole | 'GUEST';
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<boolean>;
  signup: (userData: {
    fullName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    shippingAddress?: any;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (action?: () => void, reason?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (reason?: string, onSuccess?: () => void) => {
    setAuthModalReason(reason || '');
    if (onSuccess) {
      setPendingCallback(() => onSuccess);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  const requireAuth = (action?: () => void, reason?: string): boolean => {
    if (user) {
      if (action) action();
      return true;
    }
    openAuthModal(reason, action);
    return false;
  };

  const login = async (email?: string, password?: string, role: UserRole = 'CUSTOMER'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error', err);
      return false;
    }
  };

  const signup = async (userData: {
    fullName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    shippingAddress?: any;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Signup error', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const role = user ? user.role : 'GUEST';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        reason={authModalReason}
        onSuccess={() => {
          if (pendingCallback) {
            pendingCallback();
            setPendingCallback(null);
          }
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
