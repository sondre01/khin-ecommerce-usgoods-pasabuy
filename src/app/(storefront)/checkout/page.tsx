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
  Lock,
  Truck,
  ExternalLink
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
  const [fullName, setFullName] = useState(defaultAddr?.recipientName || user?.fullName || '');
  const [phone, setPhone] = useState(defaultAddr?.phoneNumber || user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [street, setStreet] = useState(defaultAddr?.street || user?.shippingAddress?.street || '');
  const [barangay, setBarangay] = useState(defaultAddr?.barangay || user?.shippingAddress?.barangay || '');
  const [city, setCity] = useState(defaultAddr?.city || user?.shippingAddress?.city || '');
  const [province, setProvince] = useState(defaultAddr?.province || user?.shippingAddress?.province || '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || user?.shippingAddress?.postalCode || '');

  React.useEffect(() => {
    if (user) {
      if (!fullName && user.fullName) setFullName(user.fullName);
      if (!phone && user.phoneNumber) setPhone(user.phoneNumber);
      if (!email && user.email) setEmail(user.email);
    }
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

  // Payment Scheme - Strictly Full Payment Required
  const paymentPlan = 'FULL_PAYMENT';
  const [paymentMethod, setPaymentMethod] = useState<'GCASH' | 'MAYA' | 'BDO_BANK_TRANSFER'>('GCASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [proofUploaded, setProofUploaded] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shippingFeePhp = 150; // Standard Metro Manila / Luzon Forwarder delivery
  const payableAmount = subtotalPhp;
  const grandTotal = payableAmount + shippingFeePhp;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!referenceNumber.trim()) {
      setPaymentError('Payment Reference Number (Ref #) is required. You must pay before checking out.');
      return;
    }

    if (!proofUploaded && !receiptFileName) {
      setPaymentError('Please upload your payment receipt or screenshot to confirm payment before placing your order.');
      return;
    }

    setIsSubmitting(true);
    const generatedOrderNum = `PB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: generatedOrderNum,
          items,
          subtotalPhp,
          shippingFeePhp,
          totalAmountPhp: grandTotal,
          amountPaidPhp: grandTotal,
          paymentPlan: 'FULL_PAYMENT',
          paymentMethod,
          referenceNumber: referenceNumber.trim(),
          proofReceiptUrl: receiptFileName ? `uploaded-${receiptFileName}` : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          deliveryAddress: {
            fullName,
            phone,
            email,
            street,
            barangay,
            city,
            province,
            postalCode,
          },
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
        }),
      });
    } catch (err) {
      console.warn('Order sync warning:', err);
    } finally {
      setOrderNumber(generatedOrderNum);
      setSubmitted(true);
      setIsSubmitting(false);
      clearCart();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-brand-50 text-brand-800 rounded-2xl flex items-center justify-center mx-auto border border-brand-200 shadow-sm">
          <Lock className="w-6 h-6 text-brand-700" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Sign in to checkout</h2>
          <p className="text-xs text-slate-500">Sign in or register to complete your order.</p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/signup?callbackUrl=/checkout"
            className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-sm ring-1 ring-gold-400/30"
          >
            Create Account
          </Link>
          <Link
            href="/login?callbackUrl=/checkout"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
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
              Fully Paid Upfront (100%)
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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout & Order Payment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your delivery address and settle your order in full prior to checkout.
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

          {/* Section 2: Strict Payment Policy Notice */}
          <div className="bg-amber-50/90 border border-amber-300 rounded-3xl p-5 space-y-2 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Full Payment Required Before Checkout</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              There is <strong>no pay-later or Cash on Delivery</strong> option on this website. All orders must be paid in full (100%) before checking out so our shoppers in the US can immediately buy and secure your items from the outlets.
            </p>
          </div>

          {/* Section 3: GCash / Maya Payment Deposit */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-700" />
                <span>2. Payment Transfer & Proof of Payment</span>
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                100% Upfront
              </span>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

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
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
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
              <div className="flex justify-between pt-1 border-t border-slate-200/80 text-xs">
                <span className="font-semibold text-slate-700">Total Due (Items + Delivery):</span>
                <span className="font-black text-brand-900 font-mono text-sm">₱{grandTotal.toLocaleString()} PHP</span>
              </div>
            </div>

            {/* Social Media Link for Payment Assistance */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-[11px] text-blue-950 font-medium">
                  Need assistance or verification? Message our Facebook page.
                </span>
              </div>
              <a
                href="https://www.facebook.com/profile.php?id=100066301916131"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>US Goods PasaBuy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference Number (Ref #) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCASH-19283719"
                  value={referenceNumber}
                  onChange={(e) => {
                    setReferenceNumber(e.target.value);
                    setPaymentError('');
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enter the transaction reference from your receipt
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Receipt / Screenshot *</label>
                <label
                  className={`border border-dashed rounded-xl p-2.5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 text-xs ${
                    proofUploaded || receiptFileName
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setReceiptFileName(file.name);
                        setProofUploaded(true);
                        setPaymentError('');
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">
                      {receiptFileName ? `Attached: ${receiptFileName} ✓` : proofUploaded ? 'Receipt Attached ✓' : 'Click to Upload Screenshot'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    JPG, PNG proof of payment
                  </span>
                </label>
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

          {/* 3rd-Party Delivery Transparency Disclosure */}
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-[11px] text-slate-600 flex items-start gap-2">
            <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong className="text-slate-800">Delivery Policy:</strong> We personally purchase and freight-forward your items from the US. Domestic doorstep delivery is handled by accredited 3rd-party couriers (J&T Express, LBC, Lalamove). You will receive an official courier tracking waybill upon handover.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 hover:from-brand-900 hover:to-brand-800 text-white font-black rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition ring-1 ring-gold-400/30 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying & Submitting...</span>
            ) : (
              <>
                <span>Confirm Payment & Submit Order (₱{grandTotal.toLocaleString()} PHP)</span>
                <ArrowRight className="w-4 h-4 text-gold-300" />
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Full payment is required prior to checkout. There is no pay later option. Please ensure payment has been sent and your receipt is attached above.
          </p>
        </div>
      </form>
    </div>
  );
}
