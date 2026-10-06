'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import CartToast from '@/components/cart-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartToast />
      </CartProvider>
    </AuthProvider>
  );
}
