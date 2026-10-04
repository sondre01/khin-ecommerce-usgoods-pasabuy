'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  ShieldCheck,
  Calculator,
  Search,
  User,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner: PH-US PasaBuy Notice & Role Switcher */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tax-Free Oregon Forwarder Active • Current Spot Rate: <strong>$1.00 = ₱59.00 PHP</strong></span>
          </div>

          {/* Quick RBAC Role Simulator for Pair-Programming Testing */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Simulator:</span>
            <button
              onClick={() => switchRole('CUSTOMER')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentUserRole === 'CUSTOMER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Customer View
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentUserRole === 'ADMIN'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
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
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
            PB
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight">
              US Goods <span className="text-blue-600">PasaBuy</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
              Philippine Air & Sea Freight
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/products"
            className={`transition hover:text-blue-600 ${
              pathname === '/products' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Catalog
          </Link>
          <Link
            href="/custom-quote"
            className={`transition hover:text-blue-600 flex items-center gap-1.5 ${
              pathname === '/custom-quote' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-500" />
            Request Quote
          </Link>
          <Link
            href="/orders"
            className={`transition hover:text-blue-600 flex items-center gap-1.5 ${
              pathname === '/orders' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            <Package className="w-4 h-4 text-emerald-500" />
            Track Orders
          </Link>
          <Link
            href="/admin"
            className={`transition hover:text-amber-600 flex items-center gap-1.5 ${
              isAdmin ? 'text-amber-600 font-bold' : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Admin Portal
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/custom-quote"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            <span>Paste US Link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/orders"
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="My Orders"
          >
            <Package className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
