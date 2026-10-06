'use client';

import React, { useState, useMemo } from 'react';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import { Calculator, HelpCircle, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function LandedCostCalculator() {
  const [basePriceUsd, setBasePriceUsd] = useState<number>(50);
  const [weightLbs, setWeightLbs] = useState<number>(1.5);
  const [usStateTaxRate, setUsStateTaxRate] = useState<number>(0.0); // 0% Oregon
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(DEFAULT_CONFIG.usdToPhpRate);

  const breakdown = useMemo(() => {
    return calculateLandedCost({
      basePriceUsd,
      weightLbs,
      usStateTaxRate,
      usdToPhpRate,
      cargoRatePerLbUsd: DEFAULT_CONFIG.cargoRatePerLbUsd,
      handlingFeeUsd: DEFAULT_CONFIG.handlingFeeUsd,
      profitMarginRate: DEFAULT_CONFIG.profitMarginRate,
    });
  }, [basePriceUsd, weightLbs, usStateTaxRate, usdToPhpRate]);

  return (
    <div id="calculator" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#06241c] via-[#093529] to-[#0c4434] p-6 text-white border-b border-gold-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center shadow-sm">
            <Calculator className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Price Calculator (No Hidden Fees)</h3>
            <p className="text-xs text-emerald-200/80">
              See exactly how much you pay in Philippine Pesos including direct outlet price, US tax, and shipping.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              US Store Price ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={basePriceUsd}
                onChange={(e) => setBasePriceUsd(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Listed price on Calvin Klein, Tommy Hilfiger, Ralph Lauren, Lacoste, etc.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Weight (Pounds / lbs)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.1"
              value={weightLbs}
              onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0.5)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">1 lb ≈ 0.45 kg. Fast air cargo directly to Manila.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                US Sales Tax
              </label>
              <select
                value={usStateTaxRate}
                onChange={(e) => setUsStateTaxRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="0.0">0% (Tax-Free US State - Standard)</option>
                <option value="0.0725">7.25% (California)</option>
                <option value="0.08875">8.875% (New York)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dollar to Peso Rate ($1 = ₱59)
              </label>
              <input
                type="number"
                step="0.1"
                value={usdToPhpRate}
                onChange={(e) => setUsdToPhpRate(parseFloat(e.target.value) || 59.0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Realtime Breakdown Card */}
        <div className="bg-brand-50/50 p-5 rounded-xl border border-brand-100 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">
              Transparent Price Breakdown
            </h4>

            <div className="space-y-2 text-xs divide-y divide-brand-100">
              <div className="flex justify-between py-1 text-slate-600">
                <span>US Store Price:</span>
                <span className="font-semibold text-slate-900">${breakdown.usBasePriceUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>US Sales Tax:</span>
                <span className="font-semibold text-slate-900">
                  {breakdown.usStateTaxUsd > 0 ? `$${breakdown.usStateTaxUsd.toFixed(2)}` : '$0.00 (0% Tax-Free)'}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Air Shipping to PH ({weightLbs} lbs):</span>
                <span className="font-semibold text-slate-900">${breakdown.estCargoFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Safe Packaging & Handling:</span>
                <span className="font-semibold text-slate-900">${breakdown.handlingFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Total in USD:</span>
                <span className="font-bold text-brand-800">${breakdown.totalLandedUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Dollar to Peso Conversion ($1 = ₱{breakdown.effectiveExchangeRate}):</span>
                <span className="font-medium text-slate-900">₱{breakdown.baseCostPhp.toLocaleString()} PHP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-brand-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Price (Delivery Included)</span>
                <span className="text-2xl font-black text-slate-900">
                  ₱{breakdown.finalSellingPricePhp.toLocaleString()} <span className="text-xs font-normal text-slate-500">PHP</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-brand-700 font-semibold block">50% Downpayment (Pay Half Now)</span>
                <span className="text-lg font-bold text-brand-800">
                  ₱{breakdown.minimum50PctDownpaymentPhp.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-brand-100/70 border border-brand-200 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-brand-900">
              <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
              <span>
                No hidden customs fees! Pay 50% downpayment now to reserve your item, and the remaining 50% when it arrives in Manila.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
