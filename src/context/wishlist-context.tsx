'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useRestock } from '@/context/restock-context';

const WISHLIST_STORAGE_KEY = 'pasabuy_user_wishlist';

export interface WishlistItem {
  productId: string;
  product: Product;
  desiredSize?: string;
  notes?: string;
  addedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product, options?: { size?: string; notes?: string }) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product, options?: { size?: string; notes?: string }) => boolean;
  wishlistToast: string | null;
  clearToast: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const { addRequest } = useRestock();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse wishlist from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlist, isInitialized]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const clearToast = () => setWishlistToast(null);

  const showToast = (message: string) => {
    setWishlistToast(message);
    setTimeout(() => {
      setWishlistToast(null);
    }, 4000);
  };

  const addToWishlist = (
    product: Product,
    options?: { size?: string; notes?: string }
  ) => {
    if (isInWishlist(product.id)) {
      showToast(`"${product.title}" is already in your Restock Wishlist!`);
      return;
    }

    const newItem: WishlistItem = {
      productId: product.id,
      product,
      desiredSize: options?.size || 'Standard / Medium',
      notes: options?.notes,
      addedAt: new Date().toISOString(),
    };

    setWishlist((prev) => [newItem, ...prev]);

    // Automatically register a restock inquiry for the seller
    try {
      const ref = `RESTOCK-${(product.brand || 'OUT').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;
      addRequest({
        referenceCode: ref,
        customerName: user?.fullName || 'Valued Customer',
        customerContact: user?.phoneNumber || 'Contact via Account',
        customerEmail: user?.email || 'customer@usgoodspasabuy.ph',
        productId: product.id,
        productTitle: product.title,
        productBrand: product.brand || 'Outlet',
        productCategory: product.category,
        basePriceUsd: product.basePriceUsd,
        estimatedSellingPricePhp: product.sellingPricePhp,
        minimum50PctDownpaymentPhp: Math.ceil(product.sellingPricePhp * 0.5),
        desiredSize: options?.size || 'Standard / Medium',
        preferredColor: 'Classic / Outlet Stock',
        notes: options?.notes || 'Added to Wishlist from Shop Deals catalog',
        status: 'PENDING_REVIEW',
        userId: user?.userId,
      });
    } catch (e) {
      console.warn('Could not auto-register restock inquiry:', e);
    }

    showToast(`❤️ Added "${product.title}" to your Restock Wishlist! Our seller has been notified.`);
  };

  const removeFromWishlist = (productId: string) => {
    const item = wishlist.find((i) => i.productId === productId);
    setWishlist((prev) => prev.filter((i) => i.productId !== productId));
    if (item) {
      showToast(`Removed "${item.product.title}" from your wishlist.`);
    }
  };

  const toggleWishlist = (
    product: Product,
    options?: { size?: string; notes?: string }
  ): boolean => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product, options);
      return true;
    }
  };

  const wishlistIds = wishlist.map((item) => item.productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        wishlistToast,
        clearToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
