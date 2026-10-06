'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { ProductsProvider } from '@/context/products-context';
import { RestockProvider } from '@/context/restock-context';
import CartToast from '@/components/cart-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductsProvider>
        <RestockProvider>
          <CartProvider>
            {children}
            <CartToast />
          </CartProvider>
        </RestockProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
