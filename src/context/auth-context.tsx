'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserAddress } from '@/types';

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
  addresses?: UserAddress[];
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
  updateProfile: (data: { fullName?: string; phoneNumber?: string; email?: string }) => void;
  addAddress: (addressData: Omit<UserAddress, 'id'>) => UserAddress;
  updateAddress: (id: string, updates: Partial<UserAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (action?: () => void, reason?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hydrateUserData(rawUser: UserSession): UserSession {
  let userObj: UserSession = { ...rawUser };
  if (typeof window === 'undefined') return userObj;

  try {
    const profileKey = `pasabuy_profile_${rawUser.userId}`;
    const storedProfile = localStorage.getItem(profileKey);
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      userObj = { ...userObj, ...parsed };
    }

    const addrKey = `pasabuy_addresses_${rawUser.userId}`;
    const storedAddrs = localStorage.getItem(addrKey);
    if (storedAddrs) {
      const parsed = JSON.parse(storedAddrs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        userObj.addresses = parsed;
        const defaultAddr = parsed.find((a: UserAddress) => a.isDefault) || parsed[0];
        userObj.shippingAddress = {
          street: defaultAddr.street,
          barangay: defaultAddr.barangay,
          city: defaultAddr.city,
          province: defaultAddr.province,
          postalCode: defaultAddr.postalCode,
        };
      }
    } else {
      // Default initial addresses for customer
      const defaultAddrs: UserAddress[] = [
        {
          id: 'addr-default-1',
          label: 'Home',
          recipientName: userObj.fullName || 'Maria Santos',
          phoneNumber: userObj.phoneNumber || '0917 123 4567',
          street: userObj.shippingAddress?.street || 'Unit 14B, Tower 2, One Serendra',
          barangay: userObj.shippingAddress?.barangay || 'Fort Bonifacio',
          city: userObj.shippingAddress?.city || 'Taguig City',
          province: userObj.shippingAddress?.province || 'Metro Manila',
          postalCode: userObj.shippingAddress?.postalCode || '1634',
          isDefault: true,
        },
        {
          id: 'addr-default-2',
          label: 'Office / Work',
          recipientName: userObj.fullName || 'Maria Santos',
          phoneNumber: userObj.phoneNumber || '0917 123 4567',
          street: '18th Floor, W Fifth Building, 5th Ave',
          barangay: 'Fort Bonifacio',
          city: 'Taguig City',
          province: 'Metro Manila',
          postalCode: '1634',
          isDefault: false,
        },
      ];
      userObj.addresses = defaultAddrs;
      localStorage.setItem(addrKey, JSON.stringify(defaultAddrs));
    }
  } catch (e) {
    console.warn('Could not hydrate user profile/addresses:', e);
  }

  return userObj;
}

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
        setUser(hydrateUserData(data.user));
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

  const updateProfile = (data: { fullName?: string; phoneNumber?: string; email?: string }) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const updated: UserSession = {
        ...prev,
        fullName: data.fullName !== undefined ? data.fullName : prev.fullName,
        phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : prev.phoneNumber,
        email: data.email !== undefined ? data.email : prev.email,
      };
      try {
        localStorage.setItem(
          `pasabuy_profile_${prev.userId}`,
          JSON.stringify({
            fullName: updated.fullName,
            phoneNumber: updated.phoneNumber,
            email: updated.email,
          })
        );
      } catch (e) {
        console.warn('Failed to save profile to localStorage:', e);
      }
      return updated;
    });
  };

  const addAddress = (addressData: Omit<UserAddress, 'id'>): UserAddress => {
    const newId = `addr-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const newAddress: UserAddress = {
      ...addressData,
      id: newId,
      recipientName: addressData.recipientName || user?.fullName || 'Receiver',
      phoneNumber: addressData.phoneNumber || user?.phoneNumber || '+63 900 000 0000',
    };

    setUser((prev) => {
      if (!prev) return null;
      const currentAddrs = prev.addresses || [];
      const isFirst = currentAddrs.length === 0;
      const shouldBeDefault = newAddress.isDefault || isFirst;

      let updatedList = currentAddrs.map((a) =>
        shouldBeDefault ? { ...a, isDefault: false } : a
      );
      newAddress.isDefault = shouldBeDefault;
      updatedList = [newAddress, ...updatedList];

      const defaultAddr = updatedList.find((a) => a.isDefault) || updatedList[0];
      const updatedUser: UserSession = {
        ...prev,
        addresses: updatedList,
        shippingAddress: defaultAddr
          ? {
              street: defaultAddr.street,
              barangay: defaultAddr.barangay,
              city: defaultAddr.city,
              province: defaultAddr.province,
              postalCode: defaultAddr.postalCode,
            }
          : prev.shippingAddress,
      };

      try {
        localStorage.setItem(`pasabuy_addresses_${prev.userId}`, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to save addresses to localStorage:', e);
      }

      return updatedUser;
    });

    return newAddress;
  };

  const updateAddress = (id: string, updates: Partial<UserAddress>) => {
    setUser((prev) => {
      if (!prev) return null;
      let currentAddrs = prev.addresses || [];

      if (updates.isDefault) {
        currentAddrs = currentAddrs.map((a) => ({ ...a, isDefault: a.id === id }));
      }

      const updatedList = currentAddrs.map((a) => (a.id === id ? { ...a, ...updates } : a));
      const defaultAddr = updatedList.find((a) => a.isDefault) || updatedList[0];

      const updatedUser: UserSession = {
        ...prev,
        addresses: updatedList,
        shippingAddress: defaultAddr
          ? {
              street: defaultAddr.street,
              barangay: defaultAddr.barangay,
              city: defaultAddr.city,
              province: defaultAddr.province,
              postalCode: defaultAddr.postalCode,
            }
          : prev.shippingAddress,
      };

      try {
        localStorage.setItem(`pasabuy_addresses_${prev.userId}`, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to save addresses to localStorage:', e);
      }

      return updatedUser;
    });
  };

  const deleteAddress = (id: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const currentAddrs = prev.addresses || [];
      const filtered = currentAddrs.filter((a) => a.id !== id);

      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }

      const defaultAddr = filtered.find((a) => a.isDefault) || filtered[0];

      const updatedUser: UserSession = {
        ...prev,
        addresses: filtered,
        shippingAddress: defaultAddr
          ? {
              street: defaultAddr.street,
              barangay: defaultAddr.barangay,
              city: defaultAddr.city,
              province: defaultAddr.province,
              postalCode: defaultAddr.postalCode,
            }
          : undefined,
      };

      try {
        localStorage.setItem(`pasabuy_addresses_${prev.userId}`, JSON.stringify(filtered));
      } catch (e) {
        console.warn('Failed to save addresses to localStorage:', e);
      }

      return updatedUser;
    });
  };

  const setDefaultAddress = (id: string) => {
    updateAddress(id, { isDefault: true });
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
        setUser(hydrateUserData(data.user));
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
        setUser(hydrateUserData(data.user));
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
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
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
