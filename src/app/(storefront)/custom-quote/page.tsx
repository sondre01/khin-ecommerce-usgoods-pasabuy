'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import {
  Link2,
  Calculator,
  Send,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function CustomQuotePage() {
  const [productUrl, setProductUrl] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [basePriceUsd, setBasePriceUsd] = useState<number>(65.0);
  const [weightLbs, setWeightLbs] = useState<number>(1.5);
  const [options, setOptions] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const breakdown = calculateLandedCost({
    basePriceUsd,
    weightLbs,
    usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Link2 className="w-3.5 h-3.5" />
          <span>Custom PasaBuy Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Request a Custom US Item Quote
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Found something on Amazon, Sephora, Target, Best Buy, or eBay? Paste the link below for an instant landed quotation.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Quote Request Submitted!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            We have generated quotation <strong>#PB-QUOTE-{Math.floor(100000 + Math.random() * 900000)}</strong>.
            Our US shoppers will confirm store availability and notify you via SMS/Email within 1–2 hours.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/orders"
              className="px-6 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              View in My Orders
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
            >
              Submit Another Link
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Request Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-5 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                US Store Item URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.com/dp/... or https://www.sephora.com/..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nike Dunk Low Retro Mens Sneakers"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Retail Price in USD ($) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={basePriceUsd}
                  onChange={(e) => setBasePriceUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight Estimate (lbs)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.1"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Size / Color / Variant Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Size 10.5 US, Color: Panda White/Black"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit PasaBuy Request</span>
            </button>
          </form>

          {/* Instant Estimation Sidebar */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Instant Landed Cost Estimation
              </h3>

              <div className="space-y-2 text-xs divide-y divide-slate-200">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>US Price:</span>
                  <span className="font-semibold text-slate-900">${breakdown.usBasePriceUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>US Tax (Oregon Hub):</span>
                  <span className="font-semibold text-emerald-600">$0.00 (Tax-Free)</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Air Cargo ({weightLbs} lbs @ $7.50):</span>
                  <span className="font-semibold text-slate-900">${breakdown.estCargoFeeUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Handling & Inspection:</span>
                  <span className="font-semibold text-slate-900">${breakdown.handlingFeeUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Exchange Rate Buffer:</span>
                  <span className="font-semibold text-slate-900">₱{breakdown.effectiveExchangeRate} / USD</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-slate-300 space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
                  Estimated Total Landed Price
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ₱{breakdown.finalSellingPricePhp.toLocaleString()} <span className="text-xs font-normal text-slate-500">PHP</span>
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                <div className="flex justify-between font-bold">
                  <span>Required 50% Downpayment:</span>
                  <span>₱{breakdown.minimum50PctDownpaymentPhp.toLocaleString()} PHP</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Pay 50% upon quotation approval. Settle the other 50% only when the package arrives in Manila.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
