'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import { useAuth } from '@/context/auth-context';
import {
  Tag,
  CheckCircle,
  ArrowRight,
  Info,
  Building2,
  Send,
  Sparkles,
  ShieldCheck,
  Flame,
  Lock
} from 'lucide-react';

export default function ItemInquiryPage() {
  const searchParams = useSearchParams();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const initialProductId = searchParams.get('productId') || INITIAL_PRODUCTS[0].id;

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [preferredColor, setPreferredColor] = useState<string>('Classic Tonal / Black / Navy');
  const [customerName, setCustomerName] = useState<string>(user?.fullName || '');
  const [customerContact, setCustomerContact] = useState<string>(user?.phoneNumber || '');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Synchronize when query param changes
  useEffect(() => {
    const qId = searchParams.get('productId');
    if (qId && INITIAL_PRODUCTS.some((p) => p.id === qId)) {
      setSelectedProductId(qId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (!customerName && user.fullName) setCustomerName(user.fullName);
      if (!customerContact && user.phoneNumber) setCustomerContact(user.phoneNumber);
    }
  }, [user]);

  const product = INITIAL_PRODUCTS.find((p) => p.id === selectedProductId) || INITIAL_PRODUCTS[0];

  const breakdown = calculateLandedCost({
    basePriceUsd: product.basePriceUsd,
    weightLbs: product.weightLbs,
    usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
  });

  const isApparel = product.category === 'Clothes';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal('Please sign in or create an account to send a size request to our US shoppers.', () => {
        setSubmitted(true);
      });
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50 text-brand-900 border border-brand-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Request Size or Color</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Request a Specific Size or Color
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Looking for a specific size or color for any item in our store? Let our US shoppers look for it on our next outlet trip.
        </p>
      </div>

      {/* Sourcing Policy Banner */}
      <div className="bg-amber-50/80 border border-gold-300/80 rounded-2xl p-4.5 sm:p-5 flex items-start gap-3.5 text-xs text-amber-950 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-800 border border-gold-400/50 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-sm">How We Buy For You</h4>
          <p className="text-amber-800/90 leading-relaxed text-[11px] sm:text-xs">
            To give you authentic US outlet prices, we personally shop during scheduled outlet runs for <strong>Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste</strong>. We only accept requests for items and brands featured in our store.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-brand-200 p-8 sm:p-10 text-center space-y-5 shadow-md">
          <div className="w-16 h-16 bg-brand-100 text-brand-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8 text-brand-700" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Request Sent Successfully!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Request Ref: <strong className="text-slate-900">#REQ-{product.brand?.toUpperCase().slice(0, 3) || 'OUT'}-{Math.floor(10000 + Math.random() * 90000)}</strong>.
            Our personal shopper will look for <strong>{product.title}</strong> in size <strong>{selectedSize}</strong> on our upcoming outlet shopping trip and message you before buying.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="px-6 py-2.5 bg-brand-800 text-white text-xs font-bold rounded-xl hover:bg-brand-900 transition shadow-sm"
            >
              Back to Shop
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              Request Another Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
            {/* 1. Item Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Choose Item *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:outline-none font-semibold text-slate-900"
              >
                {INITIAL_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.brand || 'Outlet'}] {p.title} (${p.basePriceUsd.toFixed(2)})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Choose any item currently listed in our store.
              </p>
            </div>

            {/* 2. Size & Color Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isApparel ? 'Size *' : 'Option / Style'}
                </label>
                {isApparel ? (
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 font-semibold text-slate-900"
                  >
                    <option value="XS">Extra Small (XS)</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double XL (XXL)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    placeholder="e.g. One Size / Regular"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Color / Tone
                </label>
                <input
                  type="text"
                  value={preferredColor}
                  onChange={(e) => setPreferredColor(e.target.value)}
                  placeholder="e.g. Navy, White, Black, Red"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 font-medium"
                />
              </div>
            </div>

            {/* 3. Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile / Viber / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Requests / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefer relaxed fit if available, or confirm original gift bag"
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-brand-800 to-brand-700 hover:from-brand-900 hover:to-brand-800 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition ring-1 ring-gold-400/30"
            >
              <Send className="w-4 h-4 text-gold-300" />
              <span>Send Request to Shopper</span>
            </button>
          </form>

          {/* Sourcing Summary Card */}
          <div className="lg:col-span-5 bg-brand-50/50 p-6 rounded-3xl border border-brand-200/80 space-y-5">
            <div>
              <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                Selected Item
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {product.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-900 text-[10px] font-bold">
                  {product.brand}
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-[10px] border border-slate-200">
                  {product.category}
                </span>
                <span className="text-[11px] text-slate-500">
                  ${product.basePriceUsd.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-brand-200/60 pt-2 border-t border-brand-200/60">
              <div className="flex justify-between py-1 text-slate-600">
                <span>US Outlet Price:</span>
                <span className="font-semibold text-slate-900">${breakdown.usBasePriceUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>US State Sales Tax:</span>
                <span className="font-semibold text-brand-800">0% (Tax-Free US State)</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Air Shipping to PH ({product.weightLbs} lbs):</span>
                <span className="font-semibold text-slate-900">${breakdown.estCargoFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Total Price (Delivery Included):</span>
                <span className="font-extrabold text-slate-900">₱{breakdown.finalSellingPricePhp.toLocaleString()} PHP</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-200 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-800 uppercase tracking-wider text-[11px]">
                  50% Downpayment (Pay Half Later):
                </span>
                <span className="text-sm font-black text-brand-900">
                  ₱{breakdown.minimum50PctDownpaymentPhp.toLocaleString()} PHP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pay only 50% via GCash/Maya once our shopper confirms your item. The remaining 50% is settled when it arrives in Manila.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
