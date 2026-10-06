'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_ORDERS } from '@/data/mock-data';
import {
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [currentFxRate, setCurrentFxRate] = useState<number>(59.0);
  const [fxSaved, setFxSaved] = useState(false);

  const totalRevenue = INITIAL_ORDERS.reduce((acc, curr) => acc + curr.totalAmountPhp, 0);
  const totalCollected = INITIAL_ORDERS.reduce((acc, curr) => acc + curr.amountPaidPhp, 0);
  const pendingReceipts = INITIAL_ORDERS.filter((o) =>
    o.payments.some((p) => p.reviewStatus === 'PENDING_REVIEW')
  );

  const handleSaveFx = (e: React.FormEvent) => {
    e.preventDefault();
    setFxSaved(true);
    setTimeout(() => setFxSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview & Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline operations, cargo logistics, and payment verification queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            Oregon Hub Connected
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline Gross</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">₱{totalRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Sum of all confirmed orders in PHP</p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Deposits Collected</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₱{totalCollected.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Verified GCash / Maya downpayments</p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shipments</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {INITIAL_ORDERS.filter((o) => o.status !== 'COMPLETED').length}
          </div>
          <p className="text-[11px] text-slate-400">In US or in transit to Manila</p>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Receipts Pending</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{pendingReceipts.length}</div>
          <p className="text-[11px] text-slate-400">Awaiting admin transaction check</p>
        </div>
      </div>

      {/* FX Buffer & Forwarder Configuration */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Global Pricing & Foreign Exchange Controller</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All customer landed cost calculations adapt to this rate in real-time. Includes bank card processing buffer (+₱1.50).
          </p>
        </div>

        <form onSubmit={handleSaveFx} className="lg:col-span-5 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
            <input
              type="number"
              step="0.05"
              value={currentFxRate}
              onChange={(e) => setCurrentFxRate(parseFloat(e.target.value) || 59.0)}
              className="w-full pl-7 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white rounded-lg text-xs font-bold transition whitespace-nowrap ring-1 ring-gold-400/30"
          >
            {fxSaved ? 'Saved!' : 'Update FX Buffer'}
          </button>
        </form>
      </div>

      {/* Orders In Pipeline Quick Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Recent Orders in Pipeline</h3>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1"
          >
            Manage Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Order #</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Pipeline Stage</th>
                <th className="py-3 px-5">Total (PHP)</th>
                <th className="py-3 px-5">Deposit Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {INITIAL_ORDERS.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-5 font-mono font-bold text-white">{ord.orderNumber}</td>
                  <td className="py-3.5 px-5">{ord.userName}</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-800">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-white">₱{ord.totalAmountPhp.toLocaleString()}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.paymentStatus === 'FULLY_PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      ord.paymentStatus === 'PARTIALLY_PAID' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
