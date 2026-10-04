import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import LandedCostCalculator from '@/components/landed-cost-calculator';
import {
  ShoppingBag,
  Plane,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Tag,
  CreditCard,
  Building2,
  PackageCheck
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Direct US-to-PH Cargo Pipeline • 0% US State Tax
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Shop Any US Store. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                Delivered Straight to PH.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Skip overpriced local resellers. Get authentic items from Amazon, Sephora, Target, and Coach with transparent landed costs and a <strong>50% downpayment</strong> option.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/custom-quote"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
              >
                <span>Paste US Product Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
              >
                Browse Featured Finds
              </Link>
            </div>

            {/* US Retailers Badges */}
            <div className="pt-6 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Supported US Merchants:
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">Amazon US</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">Sephora US</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">Target</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">Coach Outlet</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">Trader Joe's</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">Best Buy</span>
              </div>
            </div>
          </div>

          {/* Hero Side Metric Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span>The PasaBuy Advantage</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Oregon Tax-Free Address</h4>
                    <p className="text-xs text-slate-400">Save 7% to 10% on US state taxes automatically when shopping through our hub.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">50% Downpayment Option</h4>
                    <p className="text-xs text-slate-400">Pay 50% upon ordering via GCash or Maya. Settle remaining 50% only when the item lands in Manila.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Zero Surprise Customs Tax</h4>
                    <p className="text-xs text-slate-400">All prices include freight forwarder customs clearance. No BOC fees upon delivery.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 text-center">
                <Link
                  href="#calculator"
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                >
                  Estimate cost with our live pricing formula ↓
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Landed Cost Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transparent Landed Cost Calculator
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See exactly how retail USD price converts to Philippine Pesos, including forwarder air freight and packaging.
          </p>
        </div>
        <LandedCostCalculator />
      </section>

      {/* 3. Featured US Finds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Tag className="w-4 h-4" />
              Trending US Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Items Ready for PasaBuy
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View all items ({INITIAL_PRODUCTS.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_PRODUCTS.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                    {prod.retailerName}
                  </span>
                  <span className="text-slate-500 font-medium">
                    ${prod.basePriceUsd.toFixed(2)} USD
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-blue-600 transition">
                    <Link href={`/products/${prod.id}`}>{prod.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 space-y-3">
                <div className="flex items-baseline justify-between pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Landed PH Price
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      ₱{prod.sellingPricePhp.toLocaleString()} <span className="text-xs font-normal text-slate-500">PHP</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-semibold block uppercase">
                      50% Deposit
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      ₱{(Math.ceil(prod.sellingPricePhp * 0.5)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href={`/products/${prod.id}`}
                    className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    View Breakdown
                  </Link>
                  <Link
                    href={`/custom-quote?url=${encodeURIComponent(prod.sourceUrl)}`}
                    className="w-full py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How PasaBuy Works (5 Stages) */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Transparency First
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How The PasaBuy Pipeline Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From our US tax-free warehouse to your Philippine front door in 5 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-sm text-slate-900">Place Order & 50% Deposit</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit custom US link or catalog item. Upload GCash or Maya payment receipt.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-sm text-slate-900">Purchased in US</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our US shoppers purchase items directly from Amazon, Sephora, or Target to Oregon hub.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-sm text-slate-900">In Transit (Air Cargo)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consolidated and dispatched via freight forwarder. Live cargo AWB tracking assigned.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-sm text-slate-900">Arrived in PH Hub</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customs cleared in Manila. Settle remaining 50% balance before local dispatch.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">5</span>
              <h4 className="font-bold text-sm text-slate-900">Local Delivery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatched via Lalamove (Metro Manila) or J&T Express (Provincial) to your door.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
