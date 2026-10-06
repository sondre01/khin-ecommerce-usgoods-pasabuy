'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import {
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  QrCode,
  Upload,
  AlertCircle,
  Lock
} from 'lucide-react';
import PhilippineAddressSelector, { formatPhilippineAddress } from '@/components/philippine-address-selector';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPhp, total50PctDownpaymentPhp, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();

  const userAddresses = user?.addresses || [];
  const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0];

  // Delivery Address
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(defaultAddr?.id || null);
  const [fullName, setFullName] = useState(defaultAddr?.recipientName || user?.fullName || 'Maria Santos');
  const [phone, setPhone] = useState(defaultAddr?.phoneNumber || user?.phoneNumber || '0917 123 4567');
  const [street, setStreet] = useState(defaultAddr?.street || user?.shippingAddress?.street || 'Unit 14B, Tower 2, One Serendra');
  const [barangay, setBarangay] = useState(defaultAddr?.barangay || user?.shippingAddress?.barangay || 'Fort Bonifacio');
  const [city, setCity] = useState(defaultAddr?.city || user?.shippingAddress?.city || 'Taguig City');
  const [province, setProvince] = useState(defaultAddr?.province || user?.shippingAddress?.province || 'Metro Manila');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || user?.shippingAddress?.postalCode || '1634');

  React.useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedLocationId) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedLocationId(def.id);
      setFullName(def.recipientName || user.fullName || '');
      setPhone(def.phoneNumber || user.phoneNumber || '');
      setStreet(def.street);
      setProvince(def.province);
      setCity(def.city);
      setBarangay(def.barangay);
      setPostalCode(def.postalCode);
    }
  }, [user, selectedLocationId]);

  // Payment Scheme
  const [paymentPlan, setPaymentPlan] = useState<'DOWNPAYMENT_50' | 'FULL_PAYMENT'>('DOWNPAYMENT_50');
  const [paymentMethod, setPaymentMethod] = useState<'GCASH' | 'MAYA' | 'BDO_BANK_TRANSFER'>('GCASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofUploaded, setProofUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shippingFeePhp = 150; // Standard Metro Manila / Luzon Forwarder delivery
  const payableAmount = paymentPlan === 'DOWNPAYMENT_50' ? total50PctDownpaymentPhp : subtotalPhp;
  const grandTotal = payableAmount + shippingFeePhp;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrderNum = `PB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(generatedOrderNum);
    setSubmitted(true);
    clearCart();
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-brand-50 text-brand-800 rounded-3xl flex items-center justify-center mx-auto border border-brand-200 shadow-sm">
          <Lock className="w-8 h-8 text-brand-700" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">Sign In Required</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Checkout</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please sign in or create an account to enter your delivery address and reserve your US outlet items with a 50% deposit.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/signup?callbackUrl=/checkout"
            className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-sm ring-1 ring-gold-400/30"
          >
            Create an Account
          </Link>
          <Link
            href="/login?callbackUrl=/checkout"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto border border-emerald-300 shadow-md">
          <CheckCircle className="w-9 h-9 text-emerald-700" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">
            Order Successfully Placed!
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order #{orderNumber}</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you, {fullName}! Your order is confirmed. Our personal shoppers in the US will buy your items during our upcoming outlet shopping trip.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Payment Option:</span>
            <span className="font-bold text-slate-900">
              {paymentPlan === 'DOWNPAYMENT_50' ? '50% Downpayment (Half Paid)' : 'Fully Paid'}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-bold text-emerald-700 font-mono">₱{grandTotal.toLocaleString()} PHP</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Payment Method:</span>
            <span className="font-bold text-slate-900">{paymentMethod.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-slate-500 shrink-0">Delivery Address:</span>
            <span className="font-bold text-slate-900 text-right max-w-[280px]">
              {formatPhilippineAddress({ street, barangay, city, province, postalCode })}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/orders"
            className="px-7 py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-md"
          >
            Track My Order →
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout & Delivery Details</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your delivery address and choose how you want to pay (50% downpayment or full payment).
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-700" />
                <span>1. Delivery Address</span>
              </h3>
              {userAddresses.length > 0 && (
                <Link
                  href="/account"
                  className="text-[11px] font-bold text-brand-800 hover:text-brand-900 hover:underline"
                >
                  Manage Locations →
                </Link>
              )}
            </div>

            {userAddresses.length > 0 && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Saved Delivery Location:
                </span>
                <div className="flex flex-wrap gap-2">
                  {userAddresses.map((addr) => {
                    const isSelected = selectedLocationId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setSelectedLocationId(addr.id);
                          setFullName(addr.recipientName || user?.fullName || 'Receiver');
                          setPhone(addr.phoneNumber || user?.phoneNumber || '');
                          setStreet(addr.street);
                          setProvince(addr.province);
                          setCity(addr.city);
                          setBarangay(addr.barangay);
                          setPostalCode(addr.postalCode);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-800 text-white shadow-sm ring-2 ring-brand-700/30'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                        }`}
                      >
                        <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-gold-400' : 'text-slate-400'}`} />
                        <span>{addr.label}</span>
                        {addr.isDefault && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                              isSelected ? 'bg-gold-400/20 text-gold-300' : 'bg-brand-50 text-brand-800'
                            }`}
                          >
                            Default
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receiver Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address, Unit / Building *</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
              />
            </div>

            <PhilippineAddressSelector
              province={province}
              onProvinceChange={setProvince}
              city={city}
              onCityChange={setCity}
              barangay={barangay}
              onBarangayChange={setBarangay}
              postalCode={postalCode}
              onPostalCodeChange={setPostalCode}
            />
          </div>

          {/* Section 2: Choose Payment Option */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-700" />
              <span>2. How Would You Like to Pay?</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentPlan('DOWNPAYMENT_50')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  paymentPlan === 'DOWNPAYMENT_50'
                    ? 'border-brand-800 bg-brand-50/70 ring-2 ring-brand-700/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">50% Downpayment</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-200 text-brand-900">Popular</span>
                </div>
                <div className="text-base font-black text-brand-900 mt-2">
                  ₱{total50PctDownpaymentPhp.toLocaleString()} PHP
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pay 50% deposit now to reserve your item. Pay the remaining 50% when it arrives in Manila.
                </p>
              </div>

              <div
                onClick={() => setPaymentPlan('FULL_PAYMENT')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  paymentPlan === 'FULL_PAYMENT'
                    ? 'border-brand-800 bg-brand-50/70 ring-2 ring-brand-700/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Pay in Full (100%)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-200 text-slate-900">Fast Delivery</span>
                </div>
                <div className="text-base font-black text-slate-900 mt-2">
                  ₱{subtotalPhp.toLocaleString()} PHP
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pay 100% upfront for faster processing and doorstep delivery upon arrival.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: GCash / Maya Payment Deposit */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-brand-700" />
              <span>3. Payment Details & Proof of Payment</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('GCASH')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  paymentMethod === 'GCASH'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                GCash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('MAYA')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  paymentMethod === 'MAYA'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Maya
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('BDO_BANK_TRANSFER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  paymentMethod === 'BDO_BANK_TRANSFER'
                    ? 'bg-brand-800 text-white border-brand-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                BDO Online
              </button>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Account Name:</span>
                <span>US Goods PasaBuy PH</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-brand-800">
                  {paymentMethod === 'GCASH' ? '0917-888-9999' : paymentMethod === 'MAYA' ? '0917-888-9999' : 'BDO: 0048-2918-4920'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Amount to send now: <strong className="text-slate-900">₱{grandTotal.toLocaleString()} PHP</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference Number (Ref #) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCASH-19283719"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Receipt / Screenshot *</label>
                <div
                  onClick={() => setProofUploaded(!proofUploaded)}
                  className={`border border-dashed rounded-xl p-2 text-center cursor-pointer transition flex items-center justify-center gap-2 text-xs ${
                    proofUploaded
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{proofUploaded ? 'Receipt Attached ✓' : 'Click to Upload Receipt'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Review Items ({items.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 line-clamp-1">{it.productTitle}</span>
                  <span className="text-[10px] text-slate-500">
                    {it.brand} • Size: {it.selectedSize} • Qty: {it.quantity}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ₱{(it.unitPricePhp * it.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100 pt-2 border-t border-slate-100">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Items Total:</span>
              <span className="font-bold text-slate-900">₱{subtotalPhp.toLocaleString()} PHP</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Local Courier (Lalamove/J&T):</span>
              <span className="font-bold text-slate-900">₱{shippingFeePhp} PHP</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-bold text-slate-900">
              <span>Amount Due Now:</span>
              <span className="text-base font-black text-brand-900">₱{grandTotal.toLocaleString()} PHP</span>
            </div>
          </div>

          {/* Delivery Address Preview (No Philippines) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Delivery Address Preview:
            </span>
            <p className="font-semibold text-slate-800 leading-relaxed text-[11px]">
              {formatPhilippineAddress({ street, barangay, city, province, postalCode }) || 'Please select your province, city, and barangay'}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 hover:from-brand-900 hover:to-brand-800 text-white font-black rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition ring-1 ring-gold-400/30"
          >
            <span>Place Order</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Upon submission, we will reserve your items and purchase them directly from the US outlet.
          </p>
        </div>
      </form>
    </div>
  );
}
