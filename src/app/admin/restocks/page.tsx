'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRestock } from '@/context/restock-context';
import { RestockRequestStatus, RestockRequest } from '@/types';
import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  PhoneCall,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  AlertCircle,
  Trash2,
  Edit3,
  Send,
  Building2,
  ChevronDown
} from 'lucide-react';

const STATUS_CONFIG: Record<
  RestockRequestStatus,
  { label: string; bg: string; text: string; border: string; description: string }
> = {
  PENDING_REVIEW: {
    label: 'New Inquiry',
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-800',
    description: 'Customer requested a restock. Awaiting seller outreach.',
  },
  SELLER_CONTACTED: {
    label: 'Contacted via Viber/WhatsApp',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-800',
    description: 'Seller messaged customer with initial size/pricing details.',
  },
  SOURCED_AT_OUTLET: {
    label: 'Found at US Outlet',
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-800',
    description: 'Item located at outlet! Photos sent, 50% deposit requested.',
  },
  DEPOSIT_COLLECTED: {
    label: '50% Deposit Paid',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-800',
    description: 'Downpayment verified. Item reserved and secured.',
  },
  FULFILLED: {
    label: 'Fulfilled & Placed',
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-800',
    description: 'Converted into active shipment order in pipeline.',
  },
  UNAVAILABLE: {
    label: 'Sold Out / Unavailable',
    bg: 'bg-slate-800/60',
    text: 'text-slate-400',
    border: 'border-slate-700',
    description: 'Could not find requested size or style during outlet visit.',
  },
};

export default function AdminRestocksPage() {
  const { requests, updateRequestStatus, updateSellerNotes, deleteRequest, resetToDefault } = useRestock();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');

  // Calculate Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING_REVIEW').length;
  const contactedCount = requests.filter((r) => r.status === 'SELLER_CONTACTED').length;
  const sourcedCount = requests.filter((r) => r.status === 'SOURCED_AT_OUTLET').length;
  const fulfilledCount = requests.filter((r) => r.status === 'FULFILLED' || r.status === 'DEPOSIT_COLLECTED').length;

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      req.referenceCode.toLowerCase().includes(q) ||
      req.customerName.toLowerCase().includes(q) ||
      req.customerContact.toLowerCase().includes(q) ||
      req.customerEmail.toLowerCase().includes(q) ||
      req.productTitle.toLowerCase().includes(q) ||
      req.productBrand.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesBrand = brandFilter === 'ALL' || req.productBrand === brandFilter;

    return matchesSearch && matchesStatus && matchesBrand;
  });

  const handleStartEditingNotes = (req: RestockRequest) => {
    setEditingNotesId(req.id);
    setNotesDraft(req.sellerNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    updateSellerNotes(id, notesDraft.trim());
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-500/20 text-gold-300 border border-gold-400/40">
              Direct Seller Queue
            </span>
            <span className="text-xs text-slate-400">Personal Shopper Restock Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-gold-400" />
            <span>Restock Requests & Customer Inquiries</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Review customer requests for sold-out outlet items. Coordinate directly via Viber or WhatsApp with live photos from US outlets before securing the product and collecting the 50% deposit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/custom-quote"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>Customer View Form</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={resetToDefault}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs font-medium transition"
            title="Reset to default sample inquiries"
          >
            Reset Inquiries
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inquiries */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inquiries</span>
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-500">Customer requests logged</p>
        </div>

        {/* Card 2: Awaiting Seller Review */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-rose-900/40 space-y-1.5">
          <div className="flex justify-between items-center text-rose-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Outreach</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{pendingCount}</div>
          <p className="text-[11px] text-rose-400/70">New requests needing Viber/WhatsApp message</p>
        </div>

        {/* Card 3: Contacted / In Dialog */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-amber-900/40 space-y-1.5">
          <div className="flex justify-between items-center text-amber-300">
            <span className="text-xs font-semibold uppercase tracking-wider">In Communication</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{contactedCount}</div>
          <p className="text-[11px] text-amber-400/70">Seller conversing with customer</p>
        </div>

        {/* Card 4: Sourced at Outlet */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-blue-900/40 space-y-1.5">
          <div className="flex justify-between items-center text-blue-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Located at US Outlet</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{sourcedCount}</div>
          <p className="text-[11px] text-blue-400/70">Ready for 50% deposit confirmation</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, email, product, or ref code..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium"
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            <option value="PENDING_REVIEW">New Inquiries ({pendingCount})</option>
            <option value="SELLER_CONTACTED">Seller Contacted ({contactedCount})</option>
            <option value="SOURCED_AT_OUTLET">Found at Outlet ({sourcedCount})</option>
            <option value="DEPOSIT_COLLECTED">50% Deposit Paid</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium"
          >
            <option value="ALL">All Brands</option>
            <option value="Calvin Klein">Calvin Klein</option>
            <option value="Tommy Hilfiger">Tommy Hilfiger</option>
            <option value="Polo Ralph Lauren">Polo Ralph Lauren</option>
            <option value="Lacoste">Lacoste</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No restock inquiries found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No customer inquiries match your current filters or search query.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const statusCfg = STATUS_CONFIG[req.status];
            const cleanPhone = req.customerContact.replace(/[^0-9]/g, '');

            return (
              <div
                key={req.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition p-5 space-y-4"
              >
                {/* Card Header: Ref, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-gold-400 bg-gold-950/40 px-2.5 py-1 rounded-md border border-gold-800/50">
                      #{req.referenceCode}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Logged {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} flex items-center gap-1.5`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {statusCfg.label}
                    </span>

                    {/* Status Dropdown Controller */}
                    <div className="relative">
                      <select
                        value={req.status}
                        onChange={(e) => updateRequestStatus(req.id, e.target.value as RestockRequestStatus)}
                        className="text-xs bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-gold-500 font-semibold focus:outline-none"
                        title="Update restock status"
                      >
                        <option value="PENDING_REVIEW">Mark New Inquiry</option>
                        <option value="SELLER_CONTACTED">Mark Contacted (Viber/WhatsApp)</option>
                        <option value="SOURCED_AT_OUTLET">Mark Located at Outlet</option>
                        <option value="DEPOSIT_COLLECTED">Mark 50% Deposit Paid</option>
                        <option value="FULFILLED">Mark Fulfilled</option>
                        <option value="UNAVAILABLE">Mark Unavailable</option>
                      </select>
                    </div>

                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition rounded"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid: Customer Details, Product Details, Financials */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Col 1: Customer & Direct Contact (4 cols) */}
                  <div className="md:col-span-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Customer Requester
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{req.customerName}</h4>
                      <p className="text-xs text-slate-400">{req.customerEmail}</p>
                      <p className="text-xs text-gold-400 font-mono mt-0.5">{req.customerContact}</p>
                    </div>

                    {/* Direct Contact Actions */}
                    <div className="pt-1 flex flex-wrap gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone.startsWith('0') ? '63' + cleanPhone.slice(1) : cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[11px] font-bold flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${req.customerContact}`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition border border-slate-700"
                      >
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Col 2: Requested Item & Preferences (5 cols) */}
                  <div className="md:col-span-5 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Requested Outlet Item
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-brand-900 text-gold-300 text-[10px] font-bold border border-gold-400/20">
                          {req.productBrand}
                        </span>
                        <span className="text-xs text-slate-400">{req.productCategory}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {req.productTitle}
                      </h4>
                    </div>

                    {/* Size & Color Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Desired Size:</span>
                        <span className="font-black text-amber-300">{req.desiredSize}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Color Preference:</span>
                        <span className="font-semibold text-slate-200">{req.preferredColor}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Customer Note:</span>
                        <p className="italic text-[11px] text-slate-300">&ldquo;{req.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Col 3: Landed Pricing & Deposit to Collect (3 cols) */}
                  <div className="md:col-span-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Outlet Sourcing Pricing
                    </span>
                    <div className="space-y-1.5 divide-y divide-slate-800/60">
                      <div className="flex justify-between py-0.5 text-slate-400">
                        <span>US Base:</span>
                        <span className="font-semibold text-slate-200">${req.basePriceUsd.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>All-In PH Price:</span>
                        <span className="font-black text-white">₱{req.estimatedSellingPricePhp.toLocaleString()} PHP</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-400">
                        <span className="text-gold-400 font-semibold">50% Deposit Due:</span>
                        <span className="font-black text-gold-400">₱{req.minimum50PctDownpaymentPhp.toLocaleString()} PHP</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'SOURCED_AT_OUTLET', 'Confirmed at US Outlet. Photos sent.')}
                        className="w-full py-1.5 bg-brand-900 hover:bg-brand-800 text-gold-300 border border-gold-400/30 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-gold-400" />
                        <span>Confirm Sourced</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seller Internal Notes / Viber Log */}
                <div className="bg-slate-900/30 rounded-xl p-3 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Seller Outlet & Communication Notes:
                    </span>
                    {editingNotesId === req.id ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="e.g. Sourced at Woodbury outlet, sent photo of tag via Viber..."
                          className="flex-1 px-3 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                        <button
                          onClick={() => handleSaveNotes(req.id)}
                          className="px-2.5 py-1 bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold rounded-lg text-xs transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-300 text-xs mt-0.5">
                        {req.sellerNotes || (
                          <span className="text-slate-500 italic">No notes added yet. Click &ldquo;Edit Notes&rdquo; to record Viber/WhatsApp updates.</span>
                        )}
                      </p>
                    )}
                  </div>

                  {editingNotesId !== req.id && (
                    <button
                      onClick={() => handleStartEditingNotes(req)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 self-start sm:self-center transition"
                    >
                      <Edit3 className="w-3 h-3 text-slate-400" />
                      <span>{req.sellerNotes ? 'Edit Notes' : '+ Add Note'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
