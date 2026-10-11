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
  LogOut,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { useRestock } from '@/context/restock-context';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingCount } = useRestock();
  const { user } = useAuth();

  // If on login page or invitation onboarding page, don't show admin sidebar
  if (pathname === '/admin/login' || pathname === '/admin/join') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#051c16] text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#031510] border-r border-[#0d3d30] p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto custom-scrollbar">
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
            <Link
              href="/admin/restocks"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                pathname === '/admin/restocks'
                  ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#082a20] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-gold-400" />
                <span>Restock Inquiries</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/team"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition ${
                pathname === '/admin/team'
                  ? 'bg-brand-900 text-gold-300 ring-1 ring-gold-400/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#082a20] hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Team & Access</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#0d3d30] space-y-3 text-xs">
          <div className="p-3 bg-[#051c16] rounded-lg border border-[#0d3d30]">
            <span className="text-[11px] text-emerald-300/60 block">Logged In Admin:</span>
            <div className="font-bold text-white text-xs mt-0.5">
              {user?.fullName || 'Khin Andrei Gamboa'}
            </div>
            <span className="font-semibold text-gold-400 flex items-center gap-1.5 mt-0.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
              @{user?.username || 'khinag'} • {user?.username === 'khinag' || !user ? 'Head Admin' : 'Admin'}
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
      <main className="flex-1 bg-[#062019] h-full overflow-y-auto custom-scrollbar flex flex-col min-w-0">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
