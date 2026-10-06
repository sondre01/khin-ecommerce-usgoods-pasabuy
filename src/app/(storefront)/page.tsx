'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/products-context';
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
  PackageCheck,
  Radio,
  Flame,
  Sparkles,
  Shirt,
  Watch,
  Wallet,
  Clock,
  Lock,
  UserCheck
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, requireAuth, user } = useAuth();
  const { products } = useProducts();

  const liveDropProducts = products.filter((p) => p.isLiveShoppingDrop);
  const displayedLiveDrops = isLoggedIn ? liveDropProducts.slice(0, 4) : liveDropProducts.slice(0, 2);
  const featuredProducts = isLoggedIn ? products.slice(0, 6) : products.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#051c16] via-[#093529] to-[#041913] text-white pt-16 pb-20 px-4 sm:px-8 border-b border-[#0d3d30]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,183,56,0.18),transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-gold-400/30 text-gold-300 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              Authentic US Outlet Deals • 0% US Sales Tax • 50% Downpayment
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Authentic US Goods. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-200 to-yellow-100 font-serif italic">
                Delivered Straight to PH.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
              We shop 100% original <strong className="text-gold-300">clothes, bags, watches, wallets, and caps</strong> directly from top US outlets: <strong className="text-white">Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren</strong>, and official live-selling specials for <strong className="text-white">Lacoste</strong>.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/products"
                className="px-7 py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-[#06241c] font-black rounded-xl shadow-lg shadow-gold-500/20 flex items-center gap-2 transition ring-1 ring-gold-300/40"
              >
                <span>Shop All Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => requireAuth(() => router.push('/custom-quote'), 'Please sign in or create an account to request an item restock.')}
                className="px-6 py-3.5 bg-[#0b382c]/80 hover:bg-[#0f4738] text-emerald-100 font-semibold rounded-xl border border-gold-500/30 transition backdrop-blur-sm"
              >
                Sold Out? Request Restock
              </button>
            </div>

            {/* US Retailers & Core Brands Badges */}
            <div className="pt-6 border-t border-[#0e4435]">
              <p className="text-xs font-semibold text-gold-300/90 uppercase tracking-wider mb-3">
                Featured Brands:
              </p>
              <div className="flex flex-wrap gap-2.5 text-xs text-emerald-100">
                <Link href="/products?brand=Calvin+Klein" className="px-3 py-1.5 rounded-lg bg-[#072b22] hover:bg-[#0c4033] border border-gold-400/30 font-bold text-gold-300 transition shadow-sm">Calvin Klein (CK)</Link>
                <Link href="/products?brand=Tommy+Hilfiger" className="px-3 py-1.5 rounded-lg bg-[#072b22] hover:bg-[#0c4033] border border-gold-400/30 font-bold text-gold-300 transition shadow-sm">Tommy Hilfiger</Link>
                <Link href="/products?brand=Polo+Ralph+Lauren" className="px-3 py-1.5 rounded-lg bg-[#072b22] hover:bg-[#0c4033] border border-gold-400/30 font-bold text-gold-300 transition shadow-sm">Polo Ralph Lauren</Link>
                <Link href="/products?brand=Lacoste" className="px-3 py-1.5 rounded-lg bg-[#072b22] hover:bg-[#0c4033] border border-gold-400/30 font-bold text-gold-300 transition shadow-sm">Lacoste (Live Deals)</Link>
                <Link href="/products" className="px-3 py-1.5 rounded-lg bg-[#072b22] hover:bg-[#0c4033] border border-gold-400/20 text-emerald-200 transition">Coach Outlet</Link>
                <Link href="/#calculator" className="px-3 py-1.5 rounded-lg bg-[#072b22] hover:bg-[#0c4033] border border-gold-400/20 text-emerald-200 transition">0% US Sales Tax</Link>
              </div>
            </div>
          </div>

          {/* Hero Side Metric Card with Official Logo */}
          <div className="lg:col-span-5">
            <div className="bg-[#06241c]/80 backdrop-blur-xl border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 pb-4 border-b border-[#0f4d3d]">
                <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 shrink-0 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#06241c]">
                    <Image
                      src="/logo.jpg"
                      alt="US Goods PasaBuy"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">How It Works</h3>
                  <p className="text-xs text-gold-300/80">Easy, safe, and transparent PasaBuy</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0 border border-gold-400/30">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Limited Outlet Pieces</h4>
                    <p className="text-xs text-emerald-200/70">Hand-picked per shopping trip. Lock in your size before items sell out.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 border border-brand-400/30">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Pay Only 50% Downpayment</h4>
                    <p className="text-xs text-emerald-200/70">Reserve with 50% deposit via GCash or Maya. Pay the rest only when your parcel arrives in Manila.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0 border border-gold-400/30">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">0% US Sales Tax</h4>
                    <p className="text-xs text-emerald-200/70">Purchased in tax-free US locations, saving you money. All customs fees covered.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#0f4d3d] text-center">
                <Link
                  href="#live-shopping"
                  className="text-xs font-semibold text-gold-300 hover:text-gold-200 inline-flex items-center gap-1"
                >
                  See live shopping specials below ↓
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Official Live-Shopping Event Announcements Section (Lacoste & Core Lineup) */}
      <section id="live-shopping" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-[#041d16] via-[#093529] to-[#041d16] rounded-3xl p-6 sm:p-10 border border-gold-500/40 text-white shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(223,183,56,0.15),transparent_70%)] pointer-events-none"></div>

          {/* Event Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0f4d3d] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-gold-400/50 text-gold-300 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
                <span>LIVE SELLING SPECIALS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Lacoste & US Outlet Specials
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Direct from California & Las Vegas Premium Outlets. Sourcing official <strong>Lacoste</strong> iconic polos, crocodile caps, leather wallets, watches, and totes alongside our core brand deals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-gold-300 uppercase font-bold tracking-wider block">Status</span>
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-600/50">
                  🔴 OPEN FOR ORDERS
                </span>
              </div>
            </div>
          </div>

          {/* Featured Lacoste Core Lineup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedLiveDrops.map((item) => {
              const total = item.allocatedSlots || 15;
              const claimed = item.claimedSlots || 11;
              const remaining = Math.max(0, total - claimed);

              return (
                <div
                  key={item.id}
                  className="bg-[#06241c]/90 rounded-2xl border border-gold-500/30 p-4 flex flex-col justify-between hover:border-gold-400 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-brand-500/20 text-gold-300 font-bold border border-gold-400/30">
                        {item.brand} • {item.category}
                      </span>
                      <span className="text-amber-300 font-bold">{remaining} items left</span>
                    </div>

                    <h4 className="font-bold text-sm text-white line-clamp-2">
                      <Link href={`/products/${item.id}`} className="hover:text-gold-300 transition">
                        {item.title}
                      </Link>
                    </h4>

                    <div className="text-xs text-emerald-200/70 line-clamp-2">
                      {item.description}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#0e4435] mt-3 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[10px] text-gold-300/80 uppercase font-semibold block">Total Price</span>
                        <span className="text-base font-black text-white">₱{item.sellingPricePhp.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-300 uppercase font-semibold block">50% Deposit</span>
                        <span className="text-xs font-bold text-gold-300">₱{(Math.ceil(item.sellingPricePhp * 0.5)).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => requireAuth(() => router.push(`/products/${item.id}`), `Please sign in or create an account to view and order "${item.title}".`)}
                      className="w-full py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-bold rounded-lg text-xs text-center block transition shadow-md"
                    >
                      View & Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!isLoggedIn && (
            <div className="pt-2 text-center border-t border-[#0e4435]">
              <Link
                href="/signup?callbackUrl=/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:text-gold-200 bg-brand-900/60 hover:bg-brand-900 px-4 py-2 rounded-xl border border-gold-400/30 transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Guest Preview: Sign up to load all {liveDropProducts.length} Live Drops →</span>
              </Link>
            </div>
          )}

          {/* Core Lineup Brands Strip */}
          <div className="bg-[#051e17]/80 rounded-2xl p-5 border border-gold-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-black text-gold-300 text-sm block">Calvin Klein (CK) Lineup</span>
              <p className="text-emerald-100/70 text-[11px] leading-relaxed">
                Men’s & women’s crewneck t-shirts, archive logo tees, regular and relaxed fit tops, plus leather bifold wallets.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-black text-gold-300 text-sm block">Tommy Hilfiger Lineup</span>
              <p className="text-emerald-100/70 text-[11px] leading-relaxed">
                Women’s classic V-neck t-shirts, nautical striped tops, and 2-piece loungewear sets with matching dad caps.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-black text-gold-300 text-sm block">Polo Ralph Lauren Lineup</span>
              <p className="text-emerald-100/70 text-[11px] leading-relaxed">
                Men’s classic fit crewneck tees, embroidered pony oxford shirts, teen graphic tees, and full-zip fleece hoodies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Allocation Showcase (Clothes, Bags, Watches, Wallets, Caps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">
            What We Allocate
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Browse by Product Category
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Five specialized categories sourced directly from US brand outlets.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/products?category=Clothes"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-gold-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 border border-brand-100 flex items-center justify-center mx-auto group-hover:bg-brand-900 group-hover:text-gold-300 transition">
              <Shirt className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-800 transition">Clothes</h4>
            <p className="text-[11px] text-slate-500">Crewnecks, V-Necks, Hoodies, Polos</p>
          </Link>

          <Link
            href="/products?category=Bags"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-gold-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 border border-brand-100 flex items-center justify-center mx-auto group-hover:bg-brand-900 group-hover:text-gold-300 transition">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-800 transition">Bags</h4>
            <p className="text-[11px] text-slate-500">Totes, Camera Bags, Duffels</p>
          </Link>

          <Link
            href="/products?category=Watches"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-gold-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 border border-brand-100 flex items-center justify-center mx-auto group-hover:bg-brand-900 group-hover:text-gold-300 transition">
              <Watch className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-800 transition">Watches</h4>
            <p className="text-[11px] text-slate-500">Quartz, Chrono, Sport Watches</p>
          </Link>

          <Link
            href="/products?category=Wallets"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-gold-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 border border-brand-100 flex items-center justify-center mx-auto group-hover:bg-brand-900 group-hover:text-gold-300 transition">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-800 transition">Wallets</h4>
            <p className="text-[11px] text-slate-500">Leather Bifolds, Passcases, Gift Sets</p>
          </Link>

          <Link
            href="/products?category=Caps"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-gold-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 border border-brand-100 flex items-center justify-center mx-auto group-hover:bg-brand-900 group-hover:text-gold-300 transition">
              <Tag className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-800 transition">Caps</h4>
            <p className="text-[11px] text-slate-500">Chino Ball Caps, Dad Hats, Strapbacks</p>
          </Link>
        </div>
      </section>

      {/* 4. Featured Allocated Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-gold-600" />
              Trending Now
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured US Outlet Deals Ready to Order
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-brand-800 hover:text-brand-900 inline-flex items-center gap-1"
          >
            View all {products.length} items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => {
            const total = prod.allocatedSlots || 10;
            const claimed = prod.claimedSlots || 7;
            const remaining = Math.max(0, total - claimed);
            const percentClaimed = Math.min(100, Math.round((claimed / total) * 100));

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-gold-300 transition flex flex-col justify-between group"
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
                </Link>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium text-[11px]">{prod.retailerName}</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      ${prod.basePriceUsd.toFixed(2)} USD
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-brand-800 transition">
                      <Link href={`/products/${prod.id}`}>{prod.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Availability Progress Bar */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-600">
                        Stock: <strong className="text-slate-900">{claimed}/{total} Taken</strong>
                      </span>
                      <span className={`font-bold ${remaining <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {remaining} left
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-700 to-gold-500 h-full rounded-full"
                        style={{ width: `${percentClaimed}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
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
                        50% Downpayment
                      </span>
                      <span className="text-sm font-bold text-brand-800">
                        ₱{(Math.ceil(prod.sellingPricePhp * 0.5)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      href={`/products/${prod.id}`}
                      className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => requireAuth(() => router.push(`/products/${prod.id}`), `Please sign in or create an account to pick and buy "${prod.title}".`)}
                      className="w-full py-2 text-center text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-lg transition shadow-sm"
                    >
                      Pick & Buy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sign Up to Load More Wall for Guests vs Full Link for Members */}
        {!isLoggedIn ? (
          <div className="mt-10 bg-gradient-to-r from-[#051c16] via-[#093529] to-[#051c16] rounded-3xl p-8 sm:p-10 border border-gold-400/40 text-white shadow-xl text-center space-y-5 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-400/40 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7 text-gold-400" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-gold-300 uppercase tracking-wider block">
                Guest Preview • 3 of {products.length} Deals Shown
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sign Up to Load More US Outlet Deals
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Sign up or sign in to unlock our complete catalog for Calvin Klein, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste, view real-time available stock, and order with a 50% deposit.
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
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-md ring-1 ring-gold-400/30"
            >
              <span>Browse All {products.length} US Outlet Finds</span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </Link>
          </div>
        )}
      </section>

      {/* 5. Interactive Landed Cost Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transparent Price Calculator
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See exactly how US store prices convert to Philippine Pesos, with international shipping and packaging included.
          </p>
        </div>
        <LandedCostCalculator />
      </section>

      {/* 6. How The Process Works */}
      <section className="bg-brand-50/60 py-16 px-4 sm:px-8 border-y border-brand-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
              How We Work
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simple Shopping Flow
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We bring 100% authentic US outlet finds directly to the Philippines. Pick, checkout, and receive your items at your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-brand-100/80 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center border border-gold-300">1</span>
              <h4 className="font-bold text-sm text-slate-900">US Outlet Sourcing & Drops</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We personally source authentic items from CK, Tommy Hilfiger, Polo Ralph Lauren, and Lacoste. Once items arrive in the Philippines, available stock is posted directly with real photos and prices.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-brand-100/80 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center border border-gold-300">2</span>
              <h4 className="font-bold text-sm text-slate-900">Browse & Add to Cart</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sign in to view our full collection. Pick your size and add items to your cart—just like shopping on Shopee or Lazada.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-brand-100/80 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center border border-gold-300">3</span>
              <h4 className="font-bold text-sm text-slate-900">Checkout & Easy Payment</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your delivery address and settle payment via GCash, Maya, or online bank transfer (BDO / BPI) with convenient downpayment or full settlement.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-brand-100/80 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-full bg-gold-100 text-gold-900 font-bold text-xs flex items-center justify-center border border-gold-400">4</span>
              <h4 className="font-bold text-sm text-slate-900">Doorstep Delivery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Carefully packed and dispatched straight to your home via Lalamove for Metro Manila or J&T Express for Provincial deliveries.
              </p>
            </div>
          </div>

          {/* Out of Stock & Restock Communication Callout */}
          <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-[#07362a] text-white p-6 sm:p-8 rounded-3xl border border-gold-400/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                <span>Restock Requests for Sold-Out Items</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Item or Size Out of Stock? Request a Restock!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Because our items sell out fast, you can request a restock for any sold-out item displayed in our store. Direct communication between you and our seller ensures we know what size to find on our upcoming US outlet trip.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => requireAuth(() => router.push('/custom-quote'), 'Please sign in or create an account to request an item restock.')}
                className="px-6 py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Request Restock</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
