'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { INITIAL_PRODUCTS } from '@/data/mock-data';
import { useProducts } from '@/context/products-context';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/context/wishlist-context';
import {
  ShieldCheck,
  Plane,
  ArrowLeft,
  ExternalLink,
  Info,
  CheckCircle2,
  CreditCard,
  Building2,
  Radio,
  Sparkles,
  Flame,
  ShoppingBag,
  Plus,
  Minus,
  Zap,
  Tag,
  Lock,
  Heart
} from 'lucide-react';

const SIZES_BY_CATEGORY: Record<string, string[]> = {
  Clothes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Caps: ['Adjustable Strapback', 'One Size (Fitted)'],
  Bags: ['Standard Shopper', 'Medium Crossbody'],
  Wallets: ['Standard Bifold / Passcase'],
  Watches: ['Standard Case (42mm)'],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal, requireAuth } = useAuth();
  const { products } = useProducts();
  const { isInWishlist, addToWishlist } = useWishlist();
  const productId = params?.id as string;

  const product = products.find((p) => p.id === productId) || products[0] || INITIAL_PRODUCTS[0];

  const availableSizes = SIZES_BY_CATEGORY[product.category] || ['Standard'];
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[1] || availableSizes[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentOption, setPaymentOption] = useState<'DOWNPAYMENT_50' | 'FULL_PAYMENT'>('DOWNPAYMENT_50');
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = !product.isActive || product.stockQuantity <= 0 || (product.allocatedSlots !== undefined && product.claimedSlots !== undefined && product.claimedSlots >= product.allocatedSlots);
  const inWishlist = isInWishlist(product.id);

  const breakdown = calculateLandedCost({
    basePriceUsd: product.basePriceUsd,
    weightLbs: product.weightLbs,
    usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
  });

  const totalSlots = product.allocatedSlots || 10;
  const claimedSlots = isOutOfStock ? totalSlots : (product.claimedSlots || 7);
  const remainingSlots = isOutOfStock ? 0 : Math.max(0, totalSlots - claimedSlots);
  const percentClaimed = isOutOfStock ? 100 : Math.min(100, Math.round((claimedSlots / totalSlots) * 100));

  const singlePricePhp = breakdown.finalSellingPricePhp;
  const totalPricePhp = singlePricePhp * quantity;
  const deposit50PctPhp = Math.ceil(totalPricePhp * 0.5);

  const executeAddToCart = () => {
    setIsAdding(true);
    addToCart({
      productId: product.id,
      productTitle: product.title,
      brand: product.brand || product.retailerName,
      category: product.category,
      retailerName: product.retailerName,
      imageUrl: product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      unitPriceUsd: product.basePriceUsd,
      unitPricePhp: breakdown.finalSellingPricePhp,
      weightLbs: product.weightLbs,
      selectedSize,
      quantity,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      openAuthModal(`Please sign in or create an account to add "${product.title}" to your cart.`, () => {
        executeAddToCart();
      });
      return;
    }
    executeAddToCart();
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      openAuthModal(`Please sign in or create an account to purchase "${product.title}".`, () => {
        executeAddToCart();
        router.push('/checkout');
      });
      return;
    }
    executeAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>

      {/* Live Drop Event Announcement Banner */}
      {product.isLiveShoppingDrop && (
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-[#072c21] p-4 sm:p-5 rounded-3xl border border-gold-400/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-400/40 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-gold-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gold-300 uppercase tracking-wider">
                  Live Selling Special
                </span>
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
              </div>
              <p className="text-sm font-semibold text-emerald-100">
                Direct from US Outlets • Official {product.brand} Deal
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gold-500/20 text-gold-300 border border-gold-400/30 rounded-xl text-xs font-bold self-start sm:self-auto">
            Fast Air Shipping
          </span>
        </div>
      )}

      {/* Main Pick-and-Buy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Product Image Gallery & Cost Ledger */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Media Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-slate-100">
              <Image
                src={product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#06241c]/90 backdrop-blur-md text-gold-300 font-extrabold text-xs border border-gold-400/40 shadow">
                  {product.brand}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 font-bold text-xs shadow">
                  {product.category}
                </span>
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-xs shadow uppercase tracking-wide">
                    Sold Out
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="px-3 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-emerald-400/30">
                  0% US Sales Tax Sourced
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>SKU: {product.id}</span>
                <span>US Store: <strong className="text-slate-700">{product.retailerName}</strong></span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  <span>View item on official US store ({product.retailerName})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gold-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Availability Meter Box */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${isOutOfStock ? 'text-rose-500' : 'text-amber-500'}`} />
                Stock: {isOutOfStock ? `All ${totalSlots} Slots Taken (Sold Out)` : `${claimedSlots} of ${totalSlots} Already Reserved`}
              </span>
              <span
                className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                  isOutOfStock
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : remainingSlots <= 3
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : `${remainingSlots} left`}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOutOfStock ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-700 via-brand-600 to-gold-500'
                }`}
                style={{ width: `${percentClaimed}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500">
              {isOutOfStock
                ? 'This outlet allocation is currently out of stock. Select your size on the right and click "Add to Wishlist" to notify our personal shopper for our upcoming US trip.'
                : 'Pay just 50% deposit today to lock in your order. We buy directly from the US outlet and send you photos and receipt proof.'}
            </p>
          </div>

          {/* Itemized Price Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Transparent Price Breakdown</span>
              <span className="text-xs font-semibold text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                0% US Sales Tax
              </span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Original US Store Price:</span>
                <span className="font-semibold text-slate-900">${breakdown.usBasePriceUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>US Sales Tax:</span>
                <span className="font-semibold text-brand-700">0.00% ($0.00 USD Saved!)</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Air Cargo Shipping to PH ({product.weightLbs} lbs):</span>
                <span className="font-semibold text-slate-900">${breakdown.estCargoFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Safe Packaging & Handling:</span>
                <span className="font-semibold text-slate-900">${breakdown.handlingFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Dollar to Peso Conversion ($1 = ₱59):</span>
                <span className="font-semibold text-slate-900">₱{breakdown.effectiveExchangeRate.toFixed(2)} PHP / USD</span>
              </div>
            </div>

            <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-xl text-xs text-brand-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
              <span>
                All Philippine customs clearance and airport fees are covered. No surprise fees upon delivery.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pick Options, Quantity, Add to Cart & Buy Now */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-lg shadow-slate-100">
            {/* Price Header */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  ₱{totalPricePhp.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-500">PHP</span>
                {quantity > 1 && (
                  <span className="text-xs text-slate-400 font-semibold ml-auto">
                    (₱{singlePricePhp.toLocaleString()} x {quantity})
                  </span>
                )}
              </div>
              <div className="text-xs text-brand-800 font-bold mt-1">
                Pay only 50% deposit: ₱{deposit50PctPhp.toLocaleString()} PHP to reserve
              </div>
            </div>

            {/* Shopee / Lazada Size Selection Pills */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Choose Size:
                </label>
                <span className="text-xs font-bold text-brand-800">{selectedSize}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      selectedSize === size
                        ? 'bg-brand-900 text-gold-300 border-brand-900 ring-2 ring-gold-400/50 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {isOutOfStock ? (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="bg-amber-50 border border-gold-300 rounded-2xl p-4 text-xs space-y-1.5 text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Restock Wishlist Request</span>
                  </div>
                  <p className="text-amber-800/90 text-[11px] leading-relaxed">
                    This item is currently sold out. Select your desired size above and click <strong>&quot;Add to Wishlist&quot;</strong>. We will automatically notify our US personal shopper to look for this item on our next outlet trip. No upfront deposit is required until your size is found.
                  </p>
                </div>

                {inWishlist ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-gold-300 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-700" />
                      <span>✓ In Your Restock Wishlist</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      We saved your restock request for size <strong className="text-amber-950">&quot;{selectedSize}&quot;</strong>. We will alert you on your account once restocked.
                    </p>
                    <Link
                      href="/account#wishlist"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-800 hover:text-brand-900 underline pt-1"
                    >
                      <span>View My Restock Wishlist →</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        requireAuth(
                          () => addToWishlist(product, { size: selectedSize }),
                          `Please sign in or create an account to request a restock for "${product.title}".`
                        )
                      }
                      className="w-full py-4 px-4 bg-gradient-to-r from-rose-600 via-rose-700 to-rose-600 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/20 active:scale-95 ring-1 ring-rose-400/40"
                    >
                      <Heart className="w-5 h-5 fill-rose-100 text-white" />
                      <span>Add to Wishlist (Request Size: {selectedSize})</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-500">
                      No payment required today. Seller will be notified to source your piece.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Quantity Selector */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Quantity:
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className="p-2.5 hover:bg-slate-200 text-slate-700 transition disabled:opacity-30"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-5 text-sm font-black text-slate-900 font-mono">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.min(remainingSlots, prev + 1))}
                        disabled={quantity >= remainingSlots}
                        className="p-2.5 hover:bg-slate-200 text-slate-700 transition disabled:opacity-30"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs text-slate-400">
                      {remainingSlots} pieces left
                    </span>
                  </div>
                </div>

                {/* Payment Scheme Selection */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    How would you like to pay?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('DOWNPAYMENT_50')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        paymentOption === 'DOWNPAYMENT_50'
                          ? 'border-brand-700 bg-brand-50/70 ring-2 ring-brand-700/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">50% Downpayment</span>
                      <span className="text-sm font-extrabold text-brand-800 mt-1">
                        ₱{deposit50PctPhp.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Pay rest in Manila
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentOption('FULL_PAYMENT')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        paymentOption === 'FULL_PAYMENT'
                          ? 'border-brand-700 bg-brand-50/70 ring-2 ring-brand-700/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">Pay in Full (100%)</span>
                      <span className="text-sm font-extrabold text-slate-900 mt-1">
                        ₱{totalPricePhp.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-brand-700 mt-1 block font-medium">
                        Fastest delivery
                      </span>
                    </button>
                  </div>
                </div>

                {/* Shopee / Lazada Dual Action Buttons */}
                <div className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className="py-3.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4 text-brand-700" />
                      <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="py-3.5 px-3 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 hover:from-brand-900 hover:to-brand-800 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md ring-1 ring-gold-400/40 active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-gold-300" />
                      <span>Buy Now</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
                    <span>GCash</span>
                    <span>•</span>
                    <span>Maya</span>
                    <span>•</span>
                    <span>BDO / BPI Online</span>
                  </div>
                </div>
              </>
            )}

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
