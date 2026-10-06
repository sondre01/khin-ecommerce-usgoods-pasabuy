'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { Search, Tag, ExternalLink, ArrowRight, Radio, Sparkles, Flame, CheckCircle2, Lock, UserCheck } from 'lucide-react';

const CATEGORIES = ['ALL', 'Clothes', 'Bags', 'Watches', 'Wallets', 'Caps'];
const BRANDS = ['ALL', 'Calvin Klein', 'Tommy Hilfiger', 'Polo Ralph Lauren', 'Lacoste'];

export default function ProductsPage() {
  const router = useRouter();
  const { isLoggedIn, requireAuth } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [onlyLiveDrops, setOnlyLiveDrops] = useState<boolean>(false);

  const filtered = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      const q = search.toLowerCase();
      const matchSearch =
        prod.title.toLowerCase().includes(q) ||
        prod.retailerName.toLowerCase().includes(q) ||
        (prod.brand && prod.brand.toLowerCase().includes(q)) ||
        prod.category.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'ALL' || prod.category === selectedCategory;

      const matchBrand =
        selectedBrand === 'ALL' || prod.brand === selectedBrand;

      const matchLive =
        !onlyLiveDrops || prod.isLiveShoppingDrop === true;

      return matchSearch && matchCategory && matchBrand && matchLive;
    });
  }, [search, selectedCategory, selectedBrand, onlyLiveDrops]);

  const displayedProducts = isLoggedIn ? filtered : filtered.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Authentic US Outlet Deals • 50% Downpayment to Order
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Shop US Outlet Finds
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Genuine clothes, bags, watches, wallets, and caps from <strong className="text-slate-900">Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste</strong>. Sourced tax-free directly from US brand outlets.
          </p>
        </div>
        <Link
          href="/custom-quote"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold shadow-sm ring-1 ring-gold-400/30 transition shrink-0"
        >
          <span>Request a Size</span>
          <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search & Live Drops Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CK tees, Ralph Lauren hoodies, Lacoste polos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyLiveDrops(!onlyLiveDrops)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              onlyLiveDrops
                ? 'bg-gradient-to-r from-brand-900 to-brand-800 text-gold-300 border-gold-400/50 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${onlyLiveDrops ? 'text-gold-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Live Selling Items Only</span>
            {onlyLiveDrops && (
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
            )}
          </button>
        </div>

        {/* Brand Filters */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Brand:
            </span>
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedBrand === brand
                    ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {brand === 'ALL' ? 'All Brands' : brand}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-gold-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Preview Notification Banner */}
      {!isLoggedIn && (
        <div className="bg-amber-50/90 border border-gold-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-amber-800 border border-gold-400/40 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <span className="font-bold text-amber-900 block text-xs sm:text-sm">
                Guest Preview Mode (Showing 3 of {filtered.length} Finds)
              </span>
              <span className="text-[11px] text-amber-800/80">
                Sign in or create a free account to unlock our entire collection, view real-time stock, and order with a 50% deposit.
              </span>
            </div>
          </div>
          <Link
            href="/signup?callbackUrl=/products"
            className="px-5 py-2 bg-gradient-to-r from-brand-800 to-brand-700 hover:from-brand-900 hover:to-brand-800 text-white font-bold rounded-xl text-xs transition shadow-sm ring-1 ring-gold-400/30 shrink-0"
          >
            Sign Up to Unlock All →
          </Link>
        </div>
      )}

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{isLoggedIn ? filtered.length : displayedProducts.length}</span> items
          {!isLoggedIn && <span className="text-amber-800 font-semibold"> (Guest Preview)</span>}
          {selectedBrand !== 'ALL' && <span> in <strong className="text-brand-800">{selectedBrand}</strong></span>}
          {selectedCategory !== 'ALL' && <span> under <strong className="text-brand-800">{selectedCategory}</strong></span>}
          {onlyLiveDrops && <span className="text-gold-700 font-semibold"> (Live Selling items only)</span>}
        </div>
        {(selectedBrand !== 'ALL' || selectedCategory !== 'ALL' || onlyLiveDrops || search) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setSelectedBrand('ALL');
              setOnlyLiveDrops(false);
            }}
            className="text-brand-700 font-bold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <p className="text-slate-500 text-sm">No items match your selected brand or category filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setSelectedBrand('ALL');
              setOnlyLiveDrops(false);
            }}
            className="px-4 py-2 bg-brand-800 text-white text-xs font-bold rounded-lg shadow"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((prod) => {
            const total = prod.allocatedSlots || 10;
            const claimed = prod.claimedSlots || 7;
            const remaining = Math.max(0, total - claimed);
            const percentClaimed = Math.min(100, Math.round((claimed / total) * 100));

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-gold-400 transition flex flex-col justify-between group"
              >
                {/* Product Image Thumbnail */}
                <Link href={`/products/${prod.id}`} className="block relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={prod.imageUrls?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                    alt={prod.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#06241c]/90 backdrop-blur-md text-gold-300 font-extrabold text-[10px] border border-gold-400/40 shadow">
                      {prod.brand || prod.retailerName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[10px] shadow">
                      {prod.category}
                    </span>
                  </div>
                  {prod.isLiveShoppingDrop && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black shadow">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        Live Drop
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] font-medium text-slate-500">{prod.retailerName}</span>
                    <span className="text-[11px] font-semibold text-slate-500">${prod.basePriceUsd.toFixed(2)} USD</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-brand-800 transition">
                      <Link href={`/products/${prod.id}`}>{prod.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Stock Availability Progress Bar */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600">
                        Stock: <strong className="text-slate-900">{claimed}/{total} Taken</strong>
                      </span>
                      <span className={`font-bold ${remaining <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {remaining} left
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-700 to-gold-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentClaimed}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-2 space-y-3">
                  <div className="flex items-baseline justify-between pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        Total Price
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        ₱{prod.sellingPricePhp.toLocaleString()} <span className="text-xs font-normal text-slate-500">PHP</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-brand-700 font-semibold block uppercase">
                        50% Deposit
                      </span>
                      <span className="text-sm font-bold text-brand-800">
                        ₱{(Math.ceil(prod.sellingPricePhp * 0.5)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      href={`/products/${prod.id}`}
                      className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => requireAuth(() => router.push(`/products/${prod.id}`), `Please sign in or create an account to pick and buy "${prod.title}".`)}
                      className="w-full py-2.5 text-center text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-lg shadow-sm ring-1 ring-gold-400/30 transition flex items-center justify-center gap-1"
                    >
                      <span>Pick & Buy</span>
                      <ArrowRight className="w-3 h-3 text-gold-300" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sign Up to Load More Wall for Guests */}
      {!isLoggedIn && (
        <div className="mt-10 bg-gradient-to-r from-[#051c16] via-[#093529] to-[#051c16] rounded-3xl p-8 sm:p-10 border border-gold-400/40 text-white shadow-xl text-center space-y-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-400/40 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7 text-gold-400" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-gold-300 uppercase tracking-wider block">
              Unlock Full Member Catalog
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign Up to Load More US Outlet Deals
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              You are viewing a guest preview. Create a free account or log in to unlock our complete catalog across Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste, view real-time available stock, and order with a 50% deposit.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/signup?callbackUrl=/products"
              className="px-8 py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-[#06241c] font-black rounded-xl shadow-lg shadow-gold-500/20 text-xs flex items-center gap-2 transition ring-1 ring-gold-300/40"
            >
              <span>Sign Up to Load More Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?callbackUrl=/products"
              className="px-6 py-3.5 bg-[#0b382c] hover:bg-[#0f4738] text-emerald-100 font-bold rounded-xl border border-gold-500/30 text-xs transition"
            >
              Log In to Existing Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
