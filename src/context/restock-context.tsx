'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RestockRequest, RestockRequestStatus } from '@/types';
import { INITIAL_RESTOCK_REQUESTS } from '@/data/mock-data';

const RESTOCK_STORAGE_KEY = 'pasabuy_restock_requests';

interface RestockContextType {
  requests: RestockRequest[];
  addRequest: (
    reqData: Omit<RestockRequest, 'id' | 'createdAt' | 'updatedAt'>
  ) => RestockRequest;
  updateRequestStatus: (
    id: string,
    status: RestockRequestStatus,
    sellerNotes?: string
  ) => void;
  updateSellerNotes: (id: string, sellerNotes: string) => void;
  deleteRequest: (id: string) => void;
  resetToDefault: () => void;
  pendingCount: number;
}

const RestockContext = createContext<RestockContextType | undefined>(undefined);

export function RestockProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<RestockRequest[]>(INITIAL_RESTOCK_REQUESTS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RESTOCK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRequests(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load restock requests from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage whenever requests change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(RESTOCK_STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn('Failed to save restock requests to localStorage:', e);
    }
  }, [requests, isInitialized]);

  const addRequest = (
    reqData: Omit<RestockRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): RestockRequest => {
    const now = new Date().toISOString();
    const newReq: RestockRequest = {
      ...reqData,
      id: `req-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };

    setRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const updateRequestStatus = (
    id: string,
    status: RestockRequestStatus,
    sellerNotes?: string
  ) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        return {
          ...req,
          status,
          sellerNotes: sellerNotes !== undefined ? sellerNotes : req.sellerNotes,
          updatedAt: now,
        };
      })
    );
  };

  const updateSellerNotes = (id: string, sellerNotes: string) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        return {
          ...req,
          sellerNotes,
          updatedAt: now,
        };
      })
    );
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(RESTOCK_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setRequests(INITIAL_RESTOCK_REQUESTS);
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING_REVIEW').length;

  return (
    <RestockContext.Provider
      value={{
        requests,
        addRequest,
        updateRequestStatus,
        updateSellerNotes,
        deleteRequest,
        resetToDefault,
        pendingCount,
      }}
    >
      {children}
    </RestockContext.Provider>
  );
}

export function useRestock() {
  const context = useContext(RestockContext);
  if (!context) {
    throw new Error('useRestock must be used within a RestockProvider');
  }
  return context;
}
