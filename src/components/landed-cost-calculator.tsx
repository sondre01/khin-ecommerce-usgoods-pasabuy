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
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Live PasaBuy Landed Cost Estimator</h3>
            <p className="text-xs text-blue-100">
              Calculate total all-in Philippine Peso costs factoring in freight, taxes, and exchange spread.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              US Retail Item Price (USD $)
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
            <p className="text-[11px] text-slate-400 mt-1">Listed price on Amazon, Sephora, Target, etc.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Estimated Weight (Pounds / lbs)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.1"
              value={weightLbs}
              onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0.5)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">1 lb ≈ 0.45 kg. Forwarder rate: $7.50/lb (air cargo).</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                US State Tax
              </label>
              <select
                value={usStateTaxRate}
                onChange={(e) => setUsStateTaxRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="0.0">0% (Oregon Tax-Free Forwarder)</option>
                <option value="0.0725">7.25% (California Hub)</option>
                <option value="0.08875">8.875% (New York Hub)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                USD to PHP Rate (Buffered)
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
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transparent Cost Breakdown
            </h4>

            <div className="space-y-2 text-xs divide-y divide-slate-200">
              <div className="flex justify-between py-1 text-slate-600">
                <span>US Base Price:</span>
                <span className="font-semibold text-slate-900">${breakdown.usBasePriceUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>US State Sales Tax:</span>
                <span className="font-semibold text-slate-900">
                  {breakdown.usStateTaxUsd > 0 ? `$${breakdown.usStateTaxUsd.toFixed(2)}` : '₱0.00 (Tax-Free Hub)'}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Intl Air Freight ({weightLbs} lbs @ $7.50):</span>
                <span className="font-semibold text-slate-900">${breakdown.estCargoFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Packaging & Box Handling:</span>
                <span className="font-semibold text-slate-900">${breakdown.handlingFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Total Landed (USD):</span>
                <span className="font-bold text-blue-700">${breakdown.totalLandedUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>FX Conversion (@ ₱{breakdown.effectiveExchangeRate}):</span>
                <span className="font-medium text-slate-900">₱{breakdown.baseCostPhp.toLocaleString()} PHP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-slate-300 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total All-In PasaBuy Price</span>
                <span className="text-2xl font-black text-slate-900">
                  ₱{breakdown.finalSellingPricePhp.toLocaleString()} <span className="text-xs font-normal text-slate-500">PHP</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-600 font-semibold block">50% Downpayment Required</span>
                <span className="text-lg font-bold text-emerald-700">
                  ₱{breakdown.minimum50PctDownpaymentPhp.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-blue-800">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Zero hidden customs fees upon arrival at your doorstep. Remaining 50% balance is settled once parcel reaches our Philippine sorting hub.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
