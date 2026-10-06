'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useRestock } from '@/context/restock-context';
import {
  ShoppingBag,
  Package,
  ShieldCheck,
  Calculator,
  Search,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const { totalItemsCount } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const { pendingCount } = useRestock();
  const [currentUserRole, setCurrentUserRole] = useState<'CUSTOMER' | 'ADMIN' | 'GUEST'>('CUSTOMER');

  useEffect(() => {
    // Check active auth cookie via /api/auth/me
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUserRole(data.user.role);
        } else {
          setCurrentUserRole('GUEST');
        }
      })
      .catch(() => setCurrentUserRole('GUEST'));
  }, [pathname]);

  const switchRole = async (targetRole: 'CUSTOMER' | 'ADMIN') => {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: targetRole }),
    });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-100 shadow-sm">
      {/* Top Banner: PH-US PasaBuy Notice & Role Switcher */}
      <div className="bg-[#06241c] text-emerald-100 text-xs py-1.5 px-4 sm:px-8 border-b border-[#0d3d30]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span>🇺🇸 Direct US Outlets • 0% US Sales Tax • Today&apos;s Rate: <strong className="text-gold-300">$1.00 = ₱59.00 PHP</strong></span>
          </div>

          {/* Quick Preview Role Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-300/70">Switch View:</span>
            <button
              onClick={() => switchRole('CUSTOMER')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentUserRole === 'CUSTOMER'
                  ? 'bg-brand-600 text-white ring-1 ring-gold-400/50'
                  : 'bg-[#0a3529] text-emerald-200 hover:text-white'
              }`}
            >
              Customer View
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentUserRole === 'ADMIN'
                  ? 'bg-gold-600 text-white ring-1 ring-gold-300/60 font-semibold'
                  : 'bg-[#0a3529] text-emerald-200 hover:text-white'
              }`}
            >
              Admin View
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 shadow-md transition group-hover:scale-105">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#06241c]">
              <Image
                src="/logo.jpg"
                alt="US Goods PasaBuy Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight">
              US Goods <span className="text-brand-700 font-serif italic">PasaBuy</span>
            </span>
            <span className="text-[10px] text-brand-800/80 font-semibold tracking-wider uppercase block">
              Direct from US Outlets to PH
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/products"
            className={`transition hover:text-brand-700 ${
              pathname === '/products' ? 'text-brand-700 font-semibold' : ''
            }`}
          >
            Shop Deals
          </Link>
          <Link
            href={currentUserRole === 'ADMIN' ? '/admin/restocks' : '/custom-quote'}
            className={`transition hover:text-brand-700 flex items-center gap-1.5 ${
              pathname === '/custom-quote' || pathname === '/admin/restocks' ? 'text-brand-700 font-semibold' : ''
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-gold-600" />
            <span>{currentUserRole === 'ADMIN' ? 'Restock Inquiries' : 'Request Restock'}</span>
            {currentUserRole === 'ADMIN' && pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/orders"
            className={`transition hover:text-brand-700 flex items-center gap-1.5 ${
              pathname === '/orders' ? 'text-brand-700 font-semibold' : ''
            }`}
          >
            <Package className="w-4 h-4 text-brand-600" />
            Track Orders
          </Link>
          {currentUserRole === 'ADMIN' && (
            <Link
              href="/admin"
              className={`transition hover:text-gold-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold-50 text-gold-900 border border-gold-300 font-bold text-xs ${
                isAdmin ? 'bg-gold-500 text-slate-950 font-black' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Actions: Cart, Account, Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Shopping Cart Button with Live Badge */}
          <Link
            href="/cart"
            className="relative p-2 text-slate-700 hover:text-brand-800 hover:bg-brand-50 rounded-xl transition flex items-center justify-center"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-black text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm border-2 border-white animate-in zoom-in-50">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Orders Tracking */}
          <Link
            href="/orders"
            className="p-2 text-slate-700 hover:text-brand-800 hover:bg-brand-50 rounded-xl transition hidden sm:flex items-center justify-center"
            title="My Orders"
          >
            <Package className="w-5 h-5" />
          </Link>

          {/* Customer Auth Actions */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
                title="My Account"
              >
                <div className="w-5 h-5 rounded-full bg-brand-800 text-gold-300 text-[10px] flex items-center justify-center font-black">
                  {user.fullName.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition text-xs font-medium"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-brand-800 hover:bg-slate-100 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition shadow-sm ring-1 ring-gold-400/30"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
