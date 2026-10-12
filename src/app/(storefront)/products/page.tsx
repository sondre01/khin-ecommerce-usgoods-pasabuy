'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/products-context';
import { useWishlist } from '@/context/wishlist-context';
import { Product } from '@/types';
import {
  Search,
  Tag,
  ExternalLink,
  ArrowRight,
  Radio,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  Heart,
  PackageSearch,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';

const CATEGORIES = ['ALL', 'Clothes', 'Bags', 'Watches', 'Wallets', 'Caps'];
const BRANDS = ['ALL', 'Calvin Klein', 'Tommy Hilfiger', 'Polo Ralph Lauren', 'Lacoste'];

interface ProductCardProps {
  prod: Product;
  isInWishlist: (id: string) => boolean;
  requireAuth: (action: () => void, reason: string) => boolean;
  addToWishlist: (prod: Product) => void;
  router: any;
}

function ProductCardItem({
  prod,
  isInWishlist,
  requireAuth,
  addToWishlist,
  router,
}: ProductCardProps) {
  const total = prod.allocatedSlots || 10;
  const claimed = prod.claimedSlots || 7;
  const remaining = Math.max(0, total - claimed);
  const percentClaimed = Math.min(100, Math.round((claimed / total) * 100));
  const isOutOfStock =
    !prod.isActive ||
    prod.stockQuantity <= 0 ||
    (prod.allocatedSlots !== undefined &&
      prod.claimedSlots !== undefined &&
      prod.claimedSlots >= prod.allocatedSlots);
  const inWishlist = isInWishlist(prod.id);

  return (
    <div
      className={`bg-white rounded-2xl border transition flex flex-col justify-between group overflow-hidden ${
        isOutOfStock
          ? 'border-slate-300 shadow-sm'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-gold-400'
      }`}
    >
      {/* Product Image Thumbnail */}
      <Link
        href={`/products/${prod.id}`}
        className="block relative aspect-[16/10] w-full bg-slate-100 overflow-hidden"
      >
        <Image
          src={
            prod.imageUrls?.[0] ||
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
          }
          alt={prod.title}
          fill
          className={`object-cover transition-transform duration-300 ${
            isOutOfStock ? 'opacity-85 grayscale-[20%]' : 'group-hover:scale-105'
          }`}
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md bg-[#06241c]/90 backdrop-blur-md text-gold-300 font-extrabold text-[10px] border border-gold-400/40 shadow">
            {prod.brand || prod.retailerName}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[10px] shadow">
            {prod.category}
          </span>
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[10px] shadow uppercase tracking-wide">
              Sold Out
            </span>
          )}
        </div>
        {prod.isLiveShoppingDrop && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black shadow">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Live Drop
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-slate-950/90 text-rose-300 font-black text-xs tracking-wider uppercase border border-rose-500/40 shadow-xl">
              Out of Stock • Wishlist to Restock
            </span>
          </div>
        )}
      </Link>

      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] font-medium text-slate-500">{prod.retailerName}</span>
          <span className="text-[11px] font-semibold text-slate-500">
            ${prod.basePriceUsd.toFixed(2)} USD
          </span>
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
              Stock:{' '}
              <strong className="text-slate-900">
                {isOutOfStock ? `${total}/${total} Taken` : `${claimed}/${total} Taken`}
              </strong>
            </span>
            {isOutOfStock ? (
              <span className="font-black text-rose-600">0 left (Sold Out)</span>
            ) : (
              <span
                className={`font-bold ${
                  remaining <= 3 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {remaining} left
              </span>
            )}
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOutOfStock
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-brand-700 to-gold-500'
              }`}
              style={{ width: `${isOutOfStock ? 100 : percentClaimed}%` }}
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
              ₱{prod.sellingPricePhp.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">PHP</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-brand-700 font-semibold block uppercase">
              Payment Terms
            </span>
            <span className="text-sm font-bold text-brand-800">
              Full Upfront
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
          {isOutOfStock ? (
            inWishlist ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 text-center text-xs font-bold text-amber-900 bg-amber-50 border border-gold-300 rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-default"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="truncate">✓ In Wishlist</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  requireAuth(
                    () => addToWishlist(prod),
                    `Sign in to request a restock for "${prod.title}".`
                  )
                }
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm ring-1 ring-rose-400/30 transition flex items-center justify-center gap-1 active:scale-95"
                title="Notify seller to restock this item"
              >
                <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                <span className="truncate">Add to Wishlist</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() =>
                requireAuth(
                  () => router.push(`/products/${prod.id}`),
                  `Sign in to order "${prod.title}".`
                )
              }
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-lg shadow-sm ring-1 ring-gold-400/30 transition flex items-center justify-center gap-1"
            >
              <span>Pick & Buy</span>
              <ArrowRight className="w-3 h-3 text-gold-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, requireAuth } = useAuth();
  const { products } = useProducts();
  const { isInWishlist, addToWishlist, wishlist } = useWishlist();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [onlyLiveDrops, setOnlyLiveDrops] = useState<boolean>(false);

  useEffect(() => {
    const b = searchParams.get('brand');
    const c = searchParams.get('category');
    if (b) setSelectedBrand(b);
    if (c) setSelectedCategory(c);
  }, [searchParams]);

  // Compute live counts per brand
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: products.length,
    };
    BRANDS.forEach((brand) => {
      if (brand !== 'ALL') {
        counts[brand] = products.filter((p) => p.brand === brand).length;
      }
    });
    return counts;
  }, [products]);

  // Compute live counts per category (contextual to currently selected brand)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL:
        selectedBrand === 'ALL'
          ? products.length
          : products.filter((p) => p.brand === selectedBrand).length,
    };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'ALL') {
        counts[cat] = products.filter(
          (p) =>
            (selectedBrand === 'ALL' || p.brand === selectedBrand) &&
            p.category === cat
        ).length;
      }
    });
    return counts;
  }, [products, selectedBrand]);

  // Filtered dataset
  const filtered = useMemo(() => {
    return products.filter((prod) => {
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

      const matchLive = !onlyLiveDrops || prod.isLiveShoppingDrop === true;

      return matchSearch && matchCategory && matchBrand && matchLive;
    });
  }, [search, selectedCategory, selectedBrand, onlyLiveDrops, products]);

  const displayedProducts = isLoggedIn ? filtered : filtered.slice(0, 3);

  // Fallback recommended products when a filter returns 0 items so the page NEVER shrinks
  const fallbackRecommended = useMemo(() => {
    if (filtered.length > 0) return [];

    // If a brand is selected, prioritize other items from that brand
    if (selectedBrand !== 'ALL') {
      const sameBrandItems = products.filter((p) => p.brand === selectedBrand);
      if (sameBrandItems.length > 0) {
        return sameBrandItems.slice(0, 6);
      }
    }

    // If a category is selected, prioritize other items in that category across all brands
    if (selectedCategory !== 'ALL') {
      const sameCatItems = products.filter((p) => p.category === selectedCategory);
      if (sameCatItems.length > 0) {
        return sameCatItems.slice(0, 6);
      }
    }

    // Default to top available active products
    return products.slice(0, 6);
  }, [filtered.length, selectedBrand, selectedCategory, products]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setOnlyLiveDrops(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8 min-h-[calc(100vh-220px)] flex flex-col justify-start">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Authentic US Outlet Deals • Full Upfront Payment Prior to Checkout
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Shop US Outlet Finds
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Genuine clothes, bags, watches, wallets, and caps from{' '}
            <strong className="text-slate-900">
              Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste
            </strong>
            . Sourced tax-free directly from US brand outlets.
          </p>
        </div>
        <Link
          href="/account#wishlist"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold shadow-sm ring-1 ring-gold-400/30 transition shrink-0"
        >
          <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
          <span>My Restock Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</span>
          <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 shrink-0">
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
            <Radio
              className={`w-3.5 h-3.5 ${
                onlyLiveDrops ? 'text-gold-400 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span>Live Selling Items Only</span>
            {onlyLiveDrops && <span className="w-2 h-2 rounded-full bg-gold-400"></span>}
          </button>
        </div>

        {/* Brand Filters */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Brand:
            </span>
            {BRANDS.map((brand) => {
              const count = brandCounts[brand] ?? 0;
              const isSelected = selectedBrand === brand;

              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{brand === 'ALL' ? 'All Brands' : brand}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-gold-400/20 text-gold-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              const isSelected = selectedCategory === cat;
              const isEmptyInSelectedBrand = count === 0 && selectedBrand !== 'ALL';

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-gold-500 text-slate-950 font-bold shadow-sm ring-1 ring-gold-600/30'
                      : isEmptyInSelectedBrand
                      ? 'bg-slate-50 text-slate-400 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-slate-950/20 text-slate-950'
                        : isEmptyInSelectedBrand
                        ? 'bg-slate-200/50 text-slate-400'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minimal Guest Preview Banner */}
      {!isLoggedIn && (
        <div className="bg-amber-50/90 border border-gold-300 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Member Catalog:</strong> Sign in to see all items and order.
            </span>
          </div>
          <Link
            href="/signup?callbackUrl=/products"
            className="px-4 py-1.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-sm ring-1 ring-gold-400/30 shrink-0"
          >
            Sign Up →
          </Link>
        </div>
      )}

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 shrink-0">
        <div>
          Showing{' '}
          <span className="font-bold text-slate-900">
            {isLoggedIn ? filtered.length : displayedProducts.length}
          </span>{' '}
          items
          {!isLoggedIn && <span className="text-amber-800 font-semibold"> (Guest Preview)</span>}
          {selectedBrand !== 'ALL' && (
            <span>
              {' '}
              in <strong className="text-brand-800">{selectedBrand}</strong>
            </span>
          )}
          {selectedCategory !== 'ALL' && (
            <span>
              {' '}
              under <strong className="text-brand-800">{selectedCategory}</strong>
            </span>
          )}
          {onlyLiveDrops && (
            <span className="text-gold-700 font-semibold"> (Live Selling items only)</span>
          )}
        </div>
        {(selectedBrand !== 'ALL' || selectedCategory !== 'ALL' || onlyLiveDrops || search) && (
          <button
            onClick={handleResetFilters}
            className="text-brand-700 font-bold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Main Content Area: Minimum Height Maintained So Layout Never Shrinks */}
      <div className="w-full min-h-[500px] flex-1 flex flex-col">
        {filtered.length === 0 ? (
          <div className="w-full space-y-10">
            {/* Prominent, Sturdy Empty State Card */}
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-14 text-center space-y-6 min-h-[360px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(223,183,56,0.08),transparent_70%)] pointer-events-none"></div>

              {/* Icon Halo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#051c16] to-[#0a3f31] text-gold-300 border border-gold-400/30 flex items-center justify-center shadow-lg mx-auto">
                <PackageSearch className="w-8 h-8 text-gold-300" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedBrand !== 'ALL' && selectedCategory !== 'ALL'
                    ? `No ${selectedCategory} Currently in Stock for ${selectedBrand}`
                    : selectedBrand !== 'ALL'
                    ? `No Items Currently Listed for ${selectedBrand}`
                    : selectedCategory !== 'ALL'
                    ? `No Items Listed under ${selectedCategory}`
                    : search
                    ? `No Results for "${search}"`
                    : 'No Products Match Selected Filters'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  We handpick authentic US outlet stock during limited shopping drops. While this
                  exact combination is out of stock right now, you can explore other categories,
                  request a custom order, or browse available pieces below.
                </p>
              </div>

              {/* Quick Action Recovery Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 max-w-xl">
                {selectedBrand !== 'ALL' && selectedCategory !== 'ALL' && (
                  <>
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Show all {selectedBrand} items</span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {brandCounts[selectedBrand] ?? 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedBrand('ALL')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Show all {selectedCategory}</span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {products.filter((p) => p.category === selectedCategory).length}
                      </span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-sm ring-1 ring-gold-400/30 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gold-300" />
                  <span>Show All {products.length} Products</span>
                </button>

                <Link
                  href={`/custom-quote?brand=${encodeURIComponent(
                    selectedBrand !== 'ALL' ? selectedBrand : ''
                  )}&category=${encodeURIComponent(
                    selectedCategory !== 'ALL' ? selectedCategory : ''
                  )}`}
                  className="px-4 py-2.5 bg-gold-50 hover:bg-gold-100 text-amber-950 border border-gold-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Request Custom Quote →</span>
                </Link>
              </div>
            </div>

            {/* Fallback Showcase: Keeps the Page Populated with Real Items */}
            {fallbackRecommended.length > 0 && (
              <div className="pt-4 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Available Now • Hand-Picked US Outlets</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {selectedBrand !== 'ALL'
                        ? `Other Available Items from ${selectedBrand}`
                        : selectedCategory !== 'ALL'
                        ? `Popular US Outlet Items in Other Brands`
                        : 'Popular US Outlet Finds Available Now'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authentic outlet deals open for orders with upfront payment before checkout.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fallbackRecommended.map((prod) => (
                    <ProductCardItem
                      key={prod.id}
                      prod={prod}
                      isInWishlist={isInWishlist}
                      requireAuth={requireAuth}
                      addToWishlist={addToWishlist}
                      router={router}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((prod) => (
              <ProductCardItem
                key={prod.id}
                prod={prod}
                isInWishlist={isInWishlist}
                requireAuth={requireAuth}
                addToWishlist={addToWishlist}
                router={router}
              />
            ))}
          </div>
        )}
      </div>

      {/* Minimal Guest Prompt */}
      {!isLoggedIn && (
        <div className="mt-8 bg-[#093529] rounded-2xl p-6 border border-gold-400/30 text-white text-center space-y-3 shrink-0">
          <Lock className="w-5 h-5 text-gold-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Sign up to view all outlet deals</h3>
            <p className="text-xs text-emerald-200/80">
              Create an account to browse full collection and place orders.
            </p>
          </div>
          <div className="flex justify-center gap-2.5 pt-1">
            <Link
              href="/signup?callbackUrl=/products"
              className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Sign Up
            </Link>
            <Link
              href="/login?callbackUrl=/products"
              className="px-5 py-2 bg-[#051c16] hover:bg-[#07241d] text-white rounded-xl text-xs font-semibold border border-gold-500/30 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-400">
          Loading outlet catalog...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
