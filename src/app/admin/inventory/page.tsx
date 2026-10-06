'use client';

import React, { useState } from 'react';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { Product } from '@/types';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import { Layers, Plus, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [marginMultiplier, setMarginMultiplier] = useState<number>(15); // 15%
  const [updatedNotice, setUpdatedNotice] = useState(false);

  const handleBulkRecalculate = () => {
    const updated = products.map((p) => {
      const breakdown = calculateLandedCost({
        basePriceUsd: p.basePriceUsd,
        weightLbs: p.weightLbs,
        usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
        profitMarginRate: marginMultiplier / 100,
      });
      return {
        ...p,
        sellingPricePhp: breakdown.finalSellingPricePhp,
      };
    });
    setProducts(updated);
    setUpdatedNotice(true);
    setTimeout(() => setUpdatedNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">US Catalog & Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage US retail base prices, item weights, and calculate real-time landed profit margins.
          </p>
        </div>
      </div>

      {/* Margin Adjuster Bar */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Bulk Service Margin Adjuster
          </h3>
          <p className="text-xs text-slate-400">
            Recalculate all catalog landed selling prices with a new service markup percentage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min="5"
              max="50"
              value={marginMultiplier}
              onChange={(e) => setMarginMultiplier(parseInt(e.target.value) || 15)}
              className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
          </div>

          <button
            onClick={handleBulkRecalculate}
            className="px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ring-1 ring-gold-400/30 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Apply to Catalog</span>
          </button>
        </div>
      </div>

      {updatedNotice && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>All catalog selling prices updated successfully!</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Product Title</th>
                <th className="py-3 px-5">Brand / Retailer</th>
                <th className="py-3 px-5">US Price (USD)</th>
                <th className="py-3 px-5">Weight (lbs)</th>
                <th className="py-3 px-5">Landed Price (PHP)</th>
                <th className="py-3 px-5">50% Downpayment</th>
                <th className="py-3 px-5">Allocated Slots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-white block">{p.title}</span>
                    <span className="text-[10px] text-slate-400">{p.category}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-semibold text-gold-400 block">{p.brand || 'Outlet'}</span>
                    <span className="text-[10px] text-slate-400">{p.retailerName}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono">${p.basePriceUsd.toFixed(2)}</td>
                  <td className="py-3.5 px-5 font-mono">{p.weightLbs} lbs</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-400 font-mono">
                    ₱{p.sellingPricePhp.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400">
                    ₱{(Math.ceil(p.sellingPricePhp * 0.5)).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-gold-300 border border-slate-700">
                      {p.claimedSlots || 0} / {p.allocatedSlots || p.stockQuantity} claimed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
