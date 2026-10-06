'use client';

import React from 'react';
import { useWishlist } from '@/context/wishlist-context';
import { Heart, X } from 'lucide-react';

export default function WishlistToast() {
  const { wishlistToast, clearToast } = useWishlist();

  if (!wishlistToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#051c16] text-white p-4 rounded-2xl border border-gold-400/50 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-400/40 flex items-center justify-center shrink-0 mt-0.5">
        <Heart className="w-4 h-4 fill-gold-400 text-gold-400" />
      </div>
      <div className="flex-1 text-xs">
        <span className="font-bold text-gold-300 block uppercase tracking-wider text-[10px]">
          Restock Wishlist Updated
        </span>
        <p className="text-emerald-100/90 mt-0.5 leading-snug">{wishlistToast}</p>
      </div>
      <button
        onClick={clearToast}
        className="p-1 text-emerald-300/60 hover:text-white transition rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
