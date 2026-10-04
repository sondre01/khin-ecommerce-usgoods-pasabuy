'use client';

import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';

const PIPELINE_STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Downpayment submitted' },
  { key: 'PURCHASED_IN_US', label: 'Purchased in US', desc: 'Bought from US retailer' },
  { key: 'IN_TRANSIT_FORWARDER', label: 'In Transit Cargo', desc: 'Air/Sea freight to PH' },
  { key: 'ARRIVED_IN_PH', label: 'Arrived in PH', desc: 'Customs cleared in Manila' },
  { key: 'OUT_FOR_LOCAL_DELIVERY', label: 'Out for Delivery', desc: 'Lalamove / J&T courier' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Delivered to customer' },
];

export default function CustomerOrdersPage() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Tracking & Receipts</h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor your US goods across international cargo stages and upload payment verification slips.
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
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ord.status === 'ARRIVED_IN_PH' ? 'bg-amber-100 text-amber-800' :
                  ord.status === 'IN_TRANSIT_FORWARDER' ? 'bg-blue-100 text-blue-800' :
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
                <span className="text-emerald-700 font-bold">
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
                  <span className="text-[11px] text-slate-400 block font-semibold">Air Cargo Forwarder AWB</span>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
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
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                          : isDone
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isDone
                            ? 'bg-emerald-600 text-white'
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
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone History</h4>
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
                <h3 className="text-base font-bold text-slate-900">Payment Breakdown & Proof Upload</h3>
                <p className="text-xs text-slate-500">
                  Plan: {selectedOrder.paymentPlan === 'DOWNPAYMENT_50' ? '50% Downpayment Scheme' : 'Full Payment'}
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
                <span className="text-slate-500 block">Total Landed Amount:</span>
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
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Upload GCash / Maya / BDO Proof-of-Payment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Reference Number / Transaction ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GCASH-98129038"
                      value={uploadRefNumber}
                      onChange={(e) => setUploadRefNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-400">
                    Target Accounts: GCash (0917-XXX-XXXX) / Maya / BDO Acct #0012-XXXX-XXXX
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Submit Proof of Payment
                  </button>
                </div>

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Receipt submitted successfully! An admin will review and verify within 1-2 hours.</span>
                  </div>
                )}
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>This order is fully settled. No further payments are required.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
