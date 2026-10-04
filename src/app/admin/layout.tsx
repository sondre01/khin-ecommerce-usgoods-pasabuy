import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  Layers,
  Receipt,
  ArrowLeft,
  Settings
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">PasaBuy Admin</h2>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                Privileged Portal (RBAC)
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard & Metrics</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Order Pipeline Manager</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Inventory & Margins</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Logged In Role:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              SUPER_ADMIN
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition py-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 bg-slate-900 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
