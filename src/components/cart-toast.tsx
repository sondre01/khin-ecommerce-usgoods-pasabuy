'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export default function CartToast() {
  const { notification, dismissNotification, totalItemsCount } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#051c16] text-white p-4 rounded-2xl shadow-2xl border border-gold-400/40 flex items-start gap-3 backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-400/30 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-gold-400" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-300 uppercase tracking-wider">
              Cart Updated
            </span>
            <button
              onClick={dismissNotification}
              className="text-emerald-300/60 hover:text-white transition p-0.5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-emerald-100 font-medium leading-snug">
            {notification}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/cart"
              onClick={dismissNotification}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-600 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-black shadow-sm transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
              <span>View Cart ({totalItemsCount})</span>
            </Link>
            <Link
              href="/checkout"
              onClick={dismissNotification}
              className="text-xs font-semibold text-gold-300 hover:underline"
            >
              Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
