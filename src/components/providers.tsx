'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { ProductsProvider } from '@/context/products-context';
import { RestockProvider } from '@/context/restock-context';
import { WishlistProvider } from '@/context/wishlist-context';
import CartToast from '@/components/cart-toast';
import WishlistToast from '@/components/wishlist-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductsProvider>
        <RestockProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <CartToast />
              <WishlistToast />
            </CartProvider>
          </WishlistProvider>
        </RestockProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
