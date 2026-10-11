'use client';

import React, { useState } from 'react';
import { INITIAL_ORDERS } from '@/data/mock-data';
import { Order, OrderStatus } from '@/types';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Plane,
  Truck,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import {
  ORDER_PIPELINE_STAGES,
  SUPPORTED_COURIERS,
  getCourierTrackingUrl,
} from '@/lib/couriers';


export default function AdminOrdersManagerPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order>(INITIAL_ORDERS[0]);
  const [awbInput, setAwbInput] = useState(selectedOrder.cargoTrackingNumber || '');
  const [localCourierInput, setLocalCourierInput] = useState(selectedOrder.localCourierName || '');
  const [localTrackingInput, setLocalTrackingInput] = useState(selectedOrder.localTrackingNumber || '');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const handleUpdateStatus = (newStage: OrderStatus) => {
    const updated = {
      ...selectedOrder,
      status: newStage,
      cargoTrackingNumber: awbInput || selectedOrder.cargoTrackingNumber,
      localCourierName: localCourierInput || selectedOrder.localCourierName,
      localTrackingNumber: localTrackingInput || selectedOrder.localTrackingNumber,
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          orderId: selectedOrder.id,
          stage: newStage,
          comment: `Status updated by Admin to ${newStage.replace(/_/g, ' ')}`,
          createdAt: new Date().toISOString(),
        },
        ...selectedOrder.statusHistory,
      ],
    };

    setSelectedOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setStatusNotification(`Order pipeline stage advanced to: ${newStage}`);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleSaveLogistics = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = {
      ...selectedOrder,
      cargoTrackingNumber: awbInput.trim() || undefined,
      localCourierName: localCourierInput.trim() || undefined,
      localTrackingNumber: localTrackingInput.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    setSelectedOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setStatusNotification('Logistics and 3rd-party courier tracking saved successfully!');
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleVerifyPayment = (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    const updatedPayments = selectedOrder.payments.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          reviewStatus: status,
          verifiedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    const isFullyPaid = selectedOrder.paymentPlan === 'FULL_PAYMENT' && status === 'APPROVED';
    const isPartiallyPaid = selectedOrder.paymentPlan === 'DOWNPAYMENT_50' && status === 'APPROVED';

    const updated = {
      ...selectedOrder,
      payments: updatedPayments,
      paymentStatus: isFullyPaid ? 'FULLY_PAID' as const : isPartiallyPaid ? 'PARTIALLY_PAID' as const : selectedOrder.paymentStatus,
      amountPaidPhp: status === 'APPROVED' ? selectedOrder.totalAmountPhp * 0.5 : selectedOrder.amountPaidPhp,
    };

    setSelectedOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setStatusNotification(`Payment slip marked as ${status}`);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Order Pipeline & Tracking Manager</h1>
        <p className="text-xs text-slate-400 mt-1">
          Personal shopper procurement, Oregon cargo transit, and 3rd-party parcel courier handoff management.
        </p>
      </div>

      {statusNotification && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Order Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Customer Orders</h3>
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-1.5">
            {orders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setSelectedOrder(ord);
                  setAwbInput(ord.cargoTrackingNumber || '');
                  setLocalCourierInput(ord.localCourierName || '');
                  setLocalTrackingInput(ord.localTrackingNumber || '');
                }}
                className={`w-full p-4 rounded-xl border text-left transition ${
                  selectedOrder.id === ord.id
                    ? 'border-brand-500 bg-slate-950 ring-2 ring-brand-500/20 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-white">{ord.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    ord.status === 'OUT_FOR_LOCAL_DELIVERY'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : 'bg-brand-900/60 text-brand-300 border-brand-800'
                  }`}>
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1.5">{ord.userName}</div>
                <div className="flex justify-between items-baseline mt-2 text-xs">
                  <span className="text-slate-400">Total: ₱{ord.totalAmountPhp.toLocaleString()}</span>
                  <span className={ord.paymentStatus === 'FULLY_PAID' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {ord.paymentStatus}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Controller */}
        <div className="lg:col-span-8 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-1.5">
          {/* Status Controls */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Editing Pipeline For:</span>
                <h2 className="text-lg font-black text-white font-mono">{selectedOrder.orderNumber}</h2>
              </div>
              <div className="text-xs text-slate-400">
                Customer: <strong className="text-white">{selectedOrder.userName}</strong> ({selectedOrder.userEmail})
              </div>
            </div>

            {/* Advance Status Button Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Advance Pipeline Stage:
                </label>
                <span className="text-[11px] text-slate-500">
                  Stages 1–4: Shopper Handled • Stages 5–6: Courier Handled
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ORDER_PIPELINE_STAGES.map((stage) => {
                  const isActive = selectedOrder.status === stage.key;
                  return (
                    <button
                      key={stage.key}
                      type="button"
                      onClick={() => handleUpdateStatus(stage.key)}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                        isActive
                          ? 'border-gold-500 bg-gradient-to-r from-brand-700 to-brand-600 text-white ring-1 ring-gold-400/40 shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{stage.adminLabel}</span>
                        {!stage.isSellerResponsible && (
                          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Courier
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-normal text-slate-400 mt-1 line-clamp-1">{stage.desc}</span>
                      {isActive && <span className="text-[10px] font-semibold text-gold-300 mt-1">● Current Stage</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logistics & 3rd-Party Courier Handover Form */}
            <form onSubmit={handleSaveLogistics} className="pt-4 border-t border-slate-800 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gold-400" />
                    <span>3rd-Party Courier Handover & Waybill Setup</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Seller process limit: once handed to courier, the customer tracks via the courier portal.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white rounded-lg font-bold transition self-start sm:self-auto ring-1 ring-gold-400/30 shadow-xs"
                >
                  Save Waybill & Logistics
                </button>
              </div>

              {/* Quick Courier Preset Chips */}
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  Select Domestic Parcel Courier:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_COURIERS.filter(c => c.isPopular).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setLocalCourierInput(c.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        localCourierInput === c.name
                          ? 'bg-gold-500/20 text-gold-300 border-gold-400/50 ring-1 ring-gold-400/30'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Air Cargo AWB Tracking #</label>
                  <input
                    type="text"
                    placeholder="e.g. BNS-AIR-941829"
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Courier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. J&T Express, LBC, Lalamove"
                    value={localCourierInput}
                    onChange={(e) => setLocalCourierInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Courier Waybill #</label>
                  <input
                    type="text"
                    placeholder="e.g. JT-991823901"
                    value={localTrackingInput}
                    onChange={(e) => setLocalTrackingInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Courier Link Preview */}
              {localTrackingInput && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                    <span>Customer will track via: <strong className="text-white">{localCourierInput || 'Courier'}</strong></span>
                  </div>
                  {getCourierTrackingUrl(localCourierInput, localTrackingInput) && (
                    <a
                      href={getCourierTrackingUrl(localCourierInput, localTrackingInput)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-400 hover:text-gold-300 font-bold underline text-[11px]"
                    >
                      Test Portal Link ↗
                    </a>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Proof-of-Payment Verification Box */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Proof-of-Payment Queue</span>
              <span className="text-xs text-slate-400">
                Deposit Scheme: {selectedOrder.paymentPlan.replace(/_/g, ' ')}
              </span>
            </h3>

            {selectedOrder.payments.map((pmt) => (
              <div
                key={pmt.id}
                className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase">{pmt.method.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-slate-400">Ref: {pmt.referenceNumber || 'N/A'}</span>
                  </div>
                  <div className="text-slate-300">
                    Amount: <strong className="text-emerald-400 font-black">₱{pmt.amountPhp.toLocaleString()} PHP</strong>
                  </div>
                  <a
                    href={pmt.proofReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 font-semibold text-[11px] pt-1"
                  >
                    <span>View customer uploaded receipt image</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    pmt.reviewStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    pmt.reviewStatus === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {pmt.reviewStatus}
                  </span>

                  {pmt.reviewStatus === 'PENDING_REVIEW' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleVerifyPayment(pmt.id, 'APPROVED')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(pmt.id, 'REJECTED')}
                        className="px-3 py-1 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
