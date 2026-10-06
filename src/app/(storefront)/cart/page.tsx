'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function CartPage() {
  const { isLoggedIn } = useAuth();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    subtotalPhp,
    total50PctDownpaymentPhp,
    totalWeightLbs
  } = useCart();

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-brand-50 text-brand-800 rounded-3xl flex items-center justify-center mx-auto border border-brand-200 shadow-sm">
          <Lock className="w-8 h-8 text-brand-700" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">Account Required</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to View Cart</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your shopping cart and 50% deposit reservations are saved to your account. Sign up or log in to manage your items and proceed to checkout.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/signup?callbackUrl=/cart"
            className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-sm ring-1 ring-gold-400/30"
          >
            Create an Account
          </Link>
          <Link
            href="/login?callbackUrl=/cart"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-800 rounded-3xl flex items-center justify-center mx-auto border border-brand-200">
          <ShoppingBag className="w-10 h-10 text-brand-700" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your cart is empty! Browse our US outlet deals for Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-md ring-1 ring-gold-400/30"
        >
          <span>Shop US Outlet Deals</span>
          <ArrowRight className="w-4 h-4 text-gold-300" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-slate-400 hover:text-red-600 transition font-semibold"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <Image
                    src={item.imageUrl}
                    alt={item.productTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-900 border border-brand-200">
                      {item.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      Size: {item.selectedSize}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 hover:text-brand-800 transition line-clamp-1">
                    <Link href={`/products/${item.productId}`}>{item.productTitle}</Link>
                  </h3>

                  <div className="text-xs font-mono text-slate-600">
                    <span className="font-bold text-slate-900">₱{item.unitPricePhp.toLocaleString()} PHP</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">(${item.unitPriceUsd.toFixed(2)} USD • {item.weightLbs} lbs)</span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                    title="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                    title="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900 sm:hidden">
                    ₱{(item.unitPricePhp * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Order Summary
          </h2>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Items Total ({totalItemsCount} units):</span>
              <span className="font-bold text-slate-900">₱{subtotalPhp.toLocaleString()} PHP</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Estimated Package Weight:</span>
              <span className="font-semibold text-slate-900">{totalWeightLbs.toFixed(1)} lbs</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>US Sales Tax:</span>
              <span className="font-semibold text-brand-800">0.00% ($0.00 Saved)</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-bold text-slate-900">
              <span>Total Price:</span>
              <span className="text-base font-black">₱{subtotalPhp.toLocaleString()} PHP</span>
            </div>
          </div>

          {/* 50% Downpayment Highlight Box */}
          <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-800 font-bold uppercase tracking-wider text-[11px]">
                Pay Only 50% Deposit Now:
              </span>
              <span className="text-base font-black text-brand-900">
                ₱{total50PctDownpaymentPhp.toLocaleString()} PHP
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Pay 50% upon ordering via GCash or Maya. Pay the remaining 50% only when the package arrives in Manila.
            </p>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3.5 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 hover:from-brand-900 hover:to-brand-800 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition ring-1 ring-gold-400/30"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </Link>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>GCash</span>
            <span>•</span>
            <span>Maya</span>
            <span>•</span>
            <span>BDO / BPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
