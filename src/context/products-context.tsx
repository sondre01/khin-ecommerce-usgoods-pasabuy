'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';

interface ProductsContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'sellingPricePhp'> & { sellingPricePhp?: number }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStockStatus: (id: string) => void;
  resetToDefault: () => void;
  isLoaded: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'pasabuy_catalog_products';

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load products from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load products from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever products state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      } catch (e) {
        console.error('Failed to save products to storage', e);
      }
    }
  }, [products, isLoaded]);

  const addProduct = (
    productData: Omit<Product, 'id' | 'sellingPricePhp'> & { sellingPricePhp?: number }
  ): Product => {
    // If selling price is not manually provided, calculate landed cost automatically
    let calculatedSellingPrice = productData.sellingPricePhp;
    if (!calculatedSellingPrice) {
      const breakdown = calculateLandedCost({
        basePriceUsd: productData.basePriceUsd,
        weightLbs: productData.weightLbs,
        usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
        profitMarginRate: DEFAULT_CONFIG.profitMarginRate,
      });
      calculatedSellingPrice = breakdown.finalSellingPricePhp;
    }

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      sellingPricePhp: calculatedSellingPrice,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      stockQuantity: productData.stockQuantity !== undefined ? productData.stockQuantity : 5,
      allocatedSlots: productData.allocatedSlots || productData.stockQuantity || 5,
      claimedSlots: productData.claimedSlots || 0,
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        // If basePriceUsd or weightLbs changed without explicit sellingPricePhp, recalculate
        let newSellingPrice = updates.sellingPricePhp !== undefined ? updates.sellingPricePhp : p.sellingPricePhp;
        if (
          updates.sellingPricePhp === undefined &&
          (updates.basePriceUsd !== undefined || updates.weightLbs !== undefined)
        ) {
          const breakdown = calculateLandedCost({
            basePriceUsd: updates.basePriceUsd ?? p.basePriceUsd,
            weightLbs: updates.weightLbs ?? p.weightLbs,
            usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
            profitMarginRate: DEFAULT_CONFIG.profitMarginRate,
          });
          newSellingPrice = breakdown.finalSellingPricePhp;
        }

        return {
          ...p,
          ...updates,
          sellingPricePhp: newSellingPrice,
        };
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleStockStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const isOutOfStock = p.stockQuantity <= 0;
        return {
          ...p,
          stockQuantity: isOutOfStock ? 5 : 0,
        };
      })
    );
  };

  const resetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset storage', e);
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStockStatus,
        resetToDefault,
        isLoaded,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
