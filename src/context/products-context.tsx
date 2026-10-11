'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import { supabase } from '@/lib/supabase/client';

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

  // Load products from localStorage on mount and sync with Supabase
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

    // Attempt to fetch fresh products from Supabase
    if (supabase) {
      const fetchProducts = async () => {
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (!error && Array.isArray(data) && data.length > 0) {
            const mapped: Product[] = data.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description || '',
              category: r.category || 'Lifestyle',
              retailerName: r.retailer_name || 'US Store',
              sourceUrl: r.source_url || '',
              imageUrls: Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls : ['/images/placeholder.jpg'],
              weightLbs: Number(r.weight_lbs) || 1,
              basePriceUsd: Number(r.base_price_usd) || 0,
              sellingPricePhp: Number(r.selling_price_php) || 0,
              isActive: r.is_active ?? true,
              isCustomRequest: r.is_custom_request ?? false,
              stockQuantity: r.stock_quantity ?? 5,
              allocatedSlots: r.stock_quantity ?? 5,
              claimedSlots: 0,
            }));
            setProducts(mapped);
          }
        } catch (err: any) {
          console.warn('[SUPABASE_SYNC] Products fetch note:', err.message);
        }
      };
      fetchProducts();
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

    // Sync to Supabase products table
    if (supabase) {
      supabase
        .from('products')
        .insert([
          {
            id: newProduct.id,
            title: newProduct.title,
            description: newProduct.description,
            category: newProduct.category,
            retailer_name: newProduct.retailerName,
            source_url: newProduct.sourceUrl,
            image_urls: newProduct.imageUrls,
            weight_lbs: newProduct.weightLbs,
            base_price_usd: newProduct.basePriceUsd,
            selling_price_php: newProduct.sellingPricePhp,
            stock_quantity: newProduct.stockQuantity,
            is_active: newProduct.isActive,
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('[SUPABASE_SYNC] Product insert note:', error.message);
        });
    }

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

        const updated = {
          ...p,
          ...updates,
          sellingPricePhp: newSellingPrice,
        };

        // Sync to Supabase
        if (supabase) {
          const payload: any = {};
          if (updates.title !== undefined) payload.title = updates.title;
          if (updates.description !== undefined) payload.description = updates.description;
          if (updates.category !== undefined) payload.category = updates.category;
          if (updates.retailerName !== undefined) payload.retailer_name = updates.retailerName;
          if (updates.basePriceUsd !== undefined) payload.base_price_usd = updates.basePriceUsd;
          if (newSellingPrice !== undefined) payload.selling_price_php = newSellingPrice;
          if (updates.stockQuantity !== undefined) payload.stock_quantity = updates.stockQuantity;
          if (updates.isActive !== undefined) payload.is_active = updates.isActive;

          if (Object.keys(payload).length > 0) {
            supabase
              .from('products')
              .update(payload)
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.warn('[SUPABASE_SYNC] Product update note:', error.message);
              });
          }
        }

        return updated;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (supabase) {
      supabase
        .from('products')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('[SUPABASE_SYNC] Product delete note:', error.message);
        });
    }
  };

  const toggleStockStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const total = p.allocatedSlots || 10;
        const isOutOfStock = p.stockQuantity <= 0 || (p.claimedSlots !== undefined && p.claimedSlots >= total);
        return {
          ...p,
          stockQuantity: isOutOfStock ? 5 : 0,
          claimedSlots: isOutOfStock ? Math.max(0, total - 5) : total,
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
