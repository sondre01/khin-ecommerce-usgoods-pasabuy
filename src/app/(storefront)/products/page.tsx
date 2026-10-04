'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { Search, Filter, Tag, ExternalLink, ArrowRight } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set(INITIAL_PRODUCTS.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      const matchSearch =
        prod.title.toLowerCase().includes(search.toLowerCase()) ||
        prod.retailerName.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === 'ALL' || prod.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">US Product Catalog</h1>
          <p className="text-sm text-slate-600 mt-1">
            Pre-calculated landed prices for popular items from Amazon, Sephora, Target, and Coach.
          </p>
        </div>
        <Link
          href="/custom-quote"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <span>Looking for something else? Paste link</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Amazon, Sephora, item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold">
                  {prod.retailerName}
                </span>
                <span className="text-slate-500 font-medium">
                  ${prod.basePriceUsd.toFixed(2)} USD • {prod.weightLbs} lbs
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-blue-600 transition">
                  <Link href={`/products/${prod.id}`}>{prod.title}</Link>
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 mt-4 space-y-3">
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
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  View Breakdown
                </Link>
                <Link
                  href={`/custom-quote?url=${encodeURIComponent(prod.sourceUrl)}`}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Order PasaBuy
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
