'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/context/wishlist-context';
import { INITIAL_ORDERS } from '@/data/mock-data';
import { User, MapPin, Package, Phone, Mail, LogOut, ArrowRight, ShieldCheck, Clock, Heart, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CustomerAccountPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 bg-brand-50 text-brand-800 rounded-full flex items-center justify-center mx-auto border border-brand-200">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">
          Please sign in to view your profile, saved shipping address, and order updates.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login?callbackUrl=/account"
            className="px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold hover:bg-brand-900 transition shadow-sm"
          >
            Sign In
          </Link>
          <Link
            href="/signup?callbackUrl=/account"
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Filter orders for customer
  const customerOrders = INITIAL_ORDERS.filter((o) => o.userEmail === user.email || o.userId === user.userId);
  const displayOrders = customerOrders.length > 0 ? customerOrders : INITIAL_ORDERS.slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-900 text-gold-300 font-black text-xl flex items-center justify-center shadow-md border border-gold-400/40">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{user.fullName}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{user.email}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{user.phoneNumber || '+63 917 555 1234'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Saved Shipping Address */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-700" />
            <span>Saved Delivery Address</span>
          </h3>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
            <p className="font-bold text-slate-900">{user.fullName}</p>
            <p className="text-slate-500">{user.phoneNumber || '+63 917 555 1234'}</p>
            <p className="pt-1 leading-relaxed">
              {user.shippingAddress?.street || 'Unit 14B, Tower 2, One Serendra'},{' '}
              {user.shippingAddress?.barangay || 'Fort Bonifacio'},<br />
              {user.shippingAddress?.city || 'Taguig City'},{' '}
              {user.shippingAddress?.province || 'Metro Manila'} {user.shippingAddress?.postalCode || '1634'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            This address will automatically pre-fill during checkout for convenient doorstep delivery.
          </div>
        </div>

        {/* Right Column: Customer Orders List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-700" />
              <span>My Orders & Tracking</span>
            </h3>
            <Link href="/orders" className="text-xs text-brand-800 font-bold hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="space-y-4">
            {displayOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gold-300 shadow-sm transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 block">{ord.orderNumber}</span>
                    <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-50 text-brand-900 border border-brand-200">
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {ord.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{it.productTitle}</span>
                      <span className="font-mono text-slate-500">x{it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Price</span>
                    <span className="font-bold text-slate-900 font-mono">₱{ord.totalAmountPhp.toLocaleString()} PHP</span>
                  </div>

                  <Link
                    href={`/orders`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. My Restock Wishlist Section */}
      <div id="wishlist" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                My Restock Wishlist ({wishlist.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sold-out outlet items you requested. We automatically notify our personal shoppers to hunt for these on upcoming US outlet trips.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-brand-800 hover:text-brand-900 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse Outlet Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-400">
              <Heart className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Your restock wishlist is empty</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Whenever an item or size is marked &ldquo;Sold Out&rdquo; in Shop Deals, click <strong>&ldquo;Add to Wishlist&rdquo;</strong> to request a restock from our seller.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              <span>Explore Shop Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 hover:border-gold-300 transition flex gap-4 items-start justify-between"
              >
                <div className="flex gap-3.5 items-start">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                    <Image
                      src={item.product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#06241c] text-gold-300">
                        {item.product.brand || item.product.retailerName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                        Size: {item.desiredSize || 'Standard'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      <Link href={`/products/${item.productId}`} className="hover:text-brand-800">
                        {item.product.title}
                      </Link>
                    </h4>

                    <div className="text-[11px] text-slate-600">
                      <span>₱{item.product.sellingPricePhp.toLocaleString()} PHP</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-brand-700 font-semibold">50% Deposit: ₱{Math.ceil(item.product.sellingPricePhp * 0.5).toLocaleString()}</span>
                    </div>

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                        <span>Restock Requested • Seller Notified</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-[11px] font-bold text-brand-800 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
