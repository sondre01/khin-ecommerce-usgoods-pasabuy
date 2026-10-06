'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  Layers,
  ArrowLeft,
  LogOut
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#051c16] text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#031510] border-r border-[#0d3d30] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-400/40 flex items-center justify-center font-black shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">PasaBuy Admin</h2>
              <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider block">
                Privileged Portal (RBAC)
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition ${
                pathname === '/admin'
                  ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#082a20] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gold-400" />
              <span>Dashboard & Metrics</span>
            </Link>
            <Link
              href="/admin/orders"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition ${
                pathname === '/admin/orders'
                  ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#082a20] hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-brand-400" />
              <span>Order Pipeline Manager</span>
            </Link>
            <Link
              href="/admin/inventory"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition ${
                pathname === '/admin/inventory'
                  ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#082a20] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-gold-300" />
              <span>Inventory & Margins</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#0d3d30] space-y-3 text-xs">
          <div className="p-3 bg-[#051c16] rounded-lg border border-[#0d3d30]">
            <span className="text-[11px] text-emerald-300/60 block">Logged In Role:</span>
            <span className="font-bold text-gold-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              HEAD_ADMIN
            </span>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-emerald-300/70 hover:text-white transition py-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400/80 hover:text-red-300 transition py-1 text-xs text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 bg-[#062019] p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
