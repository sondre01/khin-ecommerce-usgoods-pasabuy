'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import {
  ShieldCheck,
  Plane,
  ArrowLeft,
  ExternalLink,
  Info,
  CheckCircle2,
  CreditCard,
  Building2
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const product = INITIAL_PRODUCTS.find((p) => p.id === productId) || INITIAL_PRODUCTS[0];

  const [paymentOption, setPaymentOption] = useState<'DOWNPAYMENT_50' | 'FULL_PAYMENT'>('DOWNPAYMENT_50');

  const breakdown = calculateLandedCost({
    basePriceUsd: product.basePriceUsd,
    weightLbs: product.weightLbs,
    usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Product Info Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                {product.retailerName}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                SKU: {product.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <div className="pt-2">
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>View original US listing on {product.retailerName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Transparent Landed Cost Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Itemized Landed Cost Breakdown</span>
              <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Oregon Tax-Free Forwarder Hub
              </span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>US Base Price:</span>
                <span className="font-semibold text-slate-900">${breakdown.usBasePriceUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>US State Sales Tax (Oregon Forwarder):</span>
                <span className="font-semibold text-emerald-600">0.00% ($0.00 USD Saved!)</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>International Air Cargo ({product.weightLbs} lbs @ $7.50/lb):</span>
                <span className="font-semibold text-slate-900">${breakdown.estCargoFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Repacking & Secure Box Handling:</span>
                <span className="font-semibold text-slate-900">${breakdown.handlingFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Foreign Exchange Spot Rate (Buffered):</span>
                <span className="font-semibold text-slate-900">₱{breakdown.effectiveExchangeRate.toFixed(2)} PHP / USD</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                All Philippine customs fees and import duties are covered. No surprise charges upon home delivery.
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Card Right Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-lg shadow-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Landed Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  ₱{breakdown.finalSellingPricePhp.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-500">PHP</span>
              </div>
            </div>

            {/* Payment Option Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Choose Payment Scheme:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('DOWNPAYMENT_50')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    paymentOption === 'DOWNPAYMENT_50'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">50% Downpayment</span>
                  <span className="text-sm font-extrabold text-blue-700 mt-2">
                    ₱{breakdown.minimum50PctDownpaymentPhp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Balance when in PH
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('FULL_PAYMENT')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    paymentOption === 'FULL_PAYMENT'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">Full Settlement</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-2">
                    ₱{breakdown.finalSellingPricePhp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-1 block font-medium">
                    Priority Dispatch
                  </span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/orders`}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm text-center block transition"
              >
                Proceed to Checkout ({paymentOption === 'DOWNPAYMENT_50' ? 'Pay 50% Deposit' : 'Pay in Full'})
              </Link>

              <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
                <span>GCash</span>
                <span>•</span>
                <span>Maya</span>
                <span>•</span>
                <span>BDO / BPI Online Transfer</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Shipped via Air Cargo (approx. 7–10 days to PH)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Door-to-door local courier (Lalamove / J&T Express)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
