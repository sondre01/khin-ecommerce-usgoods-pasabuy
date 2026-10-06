'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { INITIAL_ORDERS } from '@/data/mock-data';
import { Order, OrderStatus } from '@/types';
import {
  Package,
  Plane,
  Truck,
  CheckCircle,
  Clock,
  Upload,
  CreditCard,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';

const PIPELINE_STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Deposit confirmed' },
  { key: 'PURCHASED_IN_US', label: 'Bought in US', desc: 'Purchased at outlet' },
  { key: 'IN_TRANSIT_FORWARDER', label: 'Air Shipping', desc: 'On the way to PH' },
  { key: 'ARRIVED_IN_PH', label: 'Arrived in Manila', desc: 'Ready for final balance' },
  { key: 'OUT_FOR_LOCAL_DELIVERY', label: 'Out for Delivery', desc: 'Courier on the way' },
  { key: 'COMPLETED', label: 'Delivered', desc: 'Received at doorstep' },
];

export default function CustomerOrdersPage() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order>(INITIAL_ORDERS[0]);
  const [uploadRefNumber, setUploadRefNumber] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const getStageIndex = (status: OrderStatus) => {
    return PIPELINE_STAGES.findIndex((s) => s.key === status);
  };

  const handleSimulateReceiptUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadRefNumber('');
    }, 4000);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-brand-50 text-brand-800 rounded-3xl flex items-center justify-center mx-auto border border-brand-200 shadow-sm">
          <Lock className="w-8 h-8 text-brand-700" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">Sign In Required</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Track Orders</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please sign in or create an account to view your order milestones, air cargo tracking, and upload payment receipts.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/signup?callbackUrl=/orders"
            className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-sm ring-1 ring-gold-400/30"
          >
            Create an Account
          </Link>
          <Link
            href="/login?callbackUrl=/orders"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Orders</h1>
        <p className="text-sm text-slate-600 mt-1">
          See live updates on your US outlet orders and upload payment receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Selector Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Active Orders</h3>
          {orders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => setSelectedOrder(ord)}
              className={`w-full p-4 rounded-xl border text-left transition ${
                selectedOrder.id === ord.id
                  ? 'border-brand-700 bg-brand-50/60 ring-2 ring-brand-700/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ord.status === 'ARRIVED_IN_PH' ? 'bg-gold-100 text-gold-900 border border-gold-300' :
                  ord.status === 'IN_TRANSIT_FORWARDER' ? 'bg-brand-100 text-brand-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {ord.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2 line-clamp-1">
                {ord.items[0]?.productTitle}
              </p>
              <div className="flex justify-between items-baseline mt-3 text-xs">
                <span className="text-slate-500 font-medium">Total: ₱{ord.totalAmountPhp.toLocaleString()}</span>
                <span className="text-brand-800 font-bold">
                  {ord.paymentStatus === 'FULLY_PAID' ? 'Fully Paid' : `Bal: ₱${ord.remainingBalancePhp.toLocaleString()}`}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Order Detail & Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pipeline Visual Stepper */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tracking Order</span>
                <h2 className="text-xl font-black text-slate-900">{selectedOrder.orderNumber}</h2>
              </div>
              {selectedOrder.cargoTrackingNumber && (
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-semibold">Air Cargo Tracking</span>
                  <span className="font-mono text-xs font-bold text-brand-800 bg-brand-50 px-2 py-1 rounded border border-brand-200">
                    {selectedOrder.cargoTrackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Stepper Dots */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const currentIdx = getStageIndex(selectedOrder.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={stage.key}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isCurrent
                          ? 'border-brand-700 bg-brand-50/70 ring-2 ring-brand-700/20'
                          : isDone
                          ? 'border-brand-300 bg-brand-50/40'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isCurrent
                            ? 'bg-brand-700 text-white ring-1 ring-gold-400'
                            : isDone
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-300 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{stage.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">{stage.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Logs */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Timeline</h4>
              <div className="space-y-2 text-xs">
                {selectedOrder.statusHistory.map((hist) => (
                  <div key={hist.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">{hist.stage.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-slate-400">{new Date(hist.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{hist.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Section & Proof of Payment Upload */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Payment & Receipts</h3>
                <p className="text-xs text-slate-500">
                  Payment: {selectedOrder.paymentPlan === 'DOWNPAYMENT_50' ? '50% Downpayment (Pay Half Later)' : 'Paid in Full'}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedOrder.paymentStatus === 'FULLY_PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedOrder.paymentStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Total Price:</span>
                <span className="text-base font-black text-slate-900">₱{selectedOrder.totalAmountPhp.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount Paid:</span>
                <span className="text-base font-bold text-emerald-600">₱{selectedOrder.amountPaidPhp.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Remaining Balance:</span>
                <span className="text-base font-black text-rose-600">₱{selectedOrder.remainingBalancePhp.toLocaleString()}</span>
              </div>
            </div>

            {/* Upload Receipt Form */}
            {selectedOrder.remainingBalancePhp > 0 ? (
              <form onSubmit={handleSimulateReceiptUpload} className="p-5 border-2 border-dashed border-slate-300 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Upload Payment Receipt (GCash / Maya / BDO)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Reference Number (Ref #) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GCASH-98129038"
                      value={uploadRefNumber}
                      onChange={(e) => setUploadRefNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Receipt Screenshot (Image/PDF) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-800 hover:file:bg-brand-100"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-400">
                    Accounts: GCash (0917-888-9999) / Maya / BDO Online
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm ring-1 ring-gold-400/20 transition"
                  >
                    Submit Receipt
                  </button>
                </div>

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Receipt submitted successfully! We will verify it within 1-2 hours.</span>
                  </div>
                )}
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>This order is fully paid. No further payments needed!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
