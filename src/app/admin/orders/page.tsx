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

const ORDER_STAGES: OrderStatus[] = [
  'ORDER_PLACED',
  'PURCHASED_IN_US',
  'IN_TRANSIT_FORWARDER',
  'ARRIVED_IN_PH',
  'OUT_FOR_LOCAL_DELIVERY',
  'COMPLETED',
];

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
          Transition orders between US procurement, cargo forwarding, customs, and local last-mile courier.
        </p>
      </div>

      {statusNotification && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Customer Orders</h3>
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
                  ? 'border-brand-500 bg-slate-950 ring-2 ring-brand-500/20'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-white">{ord.orderNumber}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-900/60 text-brand-300 border border-brand-800">
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

        {/* Order Controller */}
        <div className="lg:col-span-8 space-y-6">
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Advance Pipeline Stage:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ORDER_STAGES.map((stage) => {
                  const isActive = selectedOrder.status === stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleUpdateStatus(stage)}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                        isActive
                          ? 'border-gold-500 bg-gradient-to-r from-brand-700 to-brand-600 text-white ring-1 ring-gold-400/40 shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{stage.replace(/_/g, ' ')}</span>
                      {isActive && <span className="text-[10px] font-normal opacity-80 mt-1">● Current Stage</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logistics & Tracking Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
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
                <label className="block text-slate-400 font-semibold mb-1">PH Local Courier</label>
                <input
                  type="text"
                  placeholder="e.g. Lalamove or J&T Express"
                  value={localCourierInput}
                  onChange={(e) => setLocalCourierInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Local Tracking #</label>
                <input
                  type="text"
                  placeholder="e.g. JT-991823901"
                  value={localTrackingInput}
                  onChange={(e) => setLocalTrackingInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
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
