'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/context/wishlist-context';
import { INITIAL_ORDERS } from '@/data/mock-data';
import { UserAddress } from '@/types';
import PhilippineAddressSelector, { formatPhilippineAddress } from '@/components/philippine-address-selector';
import {
  User,
  MapPin,
  Package,
  Phone,
  Mail,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
  Trash2,
  Sparkles,
  CheckCircle2,
  Edit3,
  Plus,
  X,
  Star,
  Check,
  Building,
  Home,
  Navigation
} from 'lucide-react';

const PRESET_LABELS = ['Home', 'Office / Work', 'Condo / Apartment', 'Provincial', 'Family / Relatives'];

export default function CustomerAccountPage() {
  const {
    user,
    isLoggedIn,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();

  // Feedback Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Edit Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const handleOpenEditProfile = () => {
    if (!user) return;
    setEditFullName(user.fullName || '');
    setEditPhone(user.phoneNumber || '');
    setEditEmail(user.email || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim() || !editEmail.trim()) return;
    updateProfile({
      fullName: editFullName.trim(),
      phoneNumber: editPhone.trim(),
      email: editEmail.trim(),
    });
    setIsProfileModalOpen(false);
    showNotification('Profile details updated successfully!');
  };

  // Address Modal state (for Adding or Editing Location)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [label, setLabel] = useState('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [street, setStreet] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAddAddress = () => {
    if (!user) return;
    setEditingAddressId(null);
    setLabel('Home');
    setCustomLabel('');
    setRecipientName(user.fullName || '');
    setAddressPhone(user.phoneNumber || '');
    setStreet('');
    setProvince('Metro Manila');
    setCity('Taguig City');
    setBarangay('Fort Bonifacio');
    setPostalCode('1634');
    setIsDefault((user.addresses?.length || 0) === 0);
    setFormError(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    const isPreset = PRESET_LABELS.includes(addr.label);
    if (isPreset) {
      setLabel(addr.label);
      setCustomLabel('');
    } else {
      setLabel('Custom');
      setCustomLabel(addr.label);
    }
    setRecipientName(addr.recipientName || user?.fullName || '');
    setAddressPhone(addr.phoneNumber || user?.phoneNumber || '');
    setStreet(addr.street);
    setProvince(addr.province);
    setCity(addr.city);
    setBarangay(addr.barangay);
    setPostalCode(addr.postalCode);
    setIsDefault(!!addr.isDefault);
    setFormError(null);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) {
      setFormError('Please enter street address / unit number.');
      return;
    }
    if (!province || !city || !barangay) {
      setFormError('Please select Province, City, and Barangay.');
      return;
    }

    const finalLabel = label === 'Custom' ? (customLabel.trim() || 'Other Location') : label;

    if (editingAddressId) {
      updateAddress(editingAddressId, {
        label: finalLabel,
        recipientName: recipientName.trim(),
        phoneNumber: addressPhone.trim(),
        street: street.trim(),
        province,
        city,
        barangay,
        postalCode,
        isDefault,
      });
      showNotification(`Location "${finalLabel}" updated successfully!`);
    } else {
      addAddress({
        label: finalLabel,
        recipientName: recipientName.trim(),
        phoneNumber: addressPhone.trim(),
        street: street.trim(),
        province,
        city,
        barangay,
        postalCode,
        isDefault,
      });
      showNotification(`New delivery location "${finalLabel}" added!`);
    }

    setIsAddressModalOpen(false);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 bg-brand-50 text-brand-800 rounded-full flex items-center justify-center mx-auto border border-brand-200">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">
          Please sign in to view your profile, saved shipping addresses, and order updates.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login?callbackUrl=/account"
            className="px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold hover:bg-brand-900 transition shadow-sm"
          >
            Sign In
          </Link>
          <Link
            href="/signup?callbackUrl=/account"
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const addresses = user.addresses || [];
  const customerOrders = INITIAL_ORDERS.filter((o) => o.userEmail === user.email || o.userId === user.userId);
  const displayOrders = customerOrders.length > 0 ? customerOrders : INITIAL_ORDERS.slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Account Header with Editable Profile Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-emerald-900 text-gold-300 font-black text-2xl flex items-center justify-center shadow-md border border-gold-400/40 shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{user.fullName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-100 text-amber-900 border border-gold-300">
                PasaBuy Customer
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                {user.phoneNumber || '+63 917 555 1234'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold shadow-sm ring-1 ring-gold-400/30 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-gold-300" />
            <span>Edit Info</span>
          </button>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 1. Saved Delivery Locations Section (Multi-location Management) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-800">
                <MapPin className="w-4 h-4 text-brand-700" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Delivery Locations & Addresses ({addresses.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Add multiple locations (e.g. Home, Office, Condo, or Family). Pick which one is used by default for US outlet orders.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddAddress}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand-900 to-brand-800 hover:from-brand-950 hover:to-brand-900 text-gold-300 font-bold rounded-xl text-xs transition shadow-sm ring-1 ring-gold-400/30 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add New Location</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-800">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-800">No saved locations yet</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your home or office address now so checkout is instant when items drop.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 text-white font-bold rounded-xl text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Location</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const isDefaultAddr = !!addr.isDefault;
              return (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                    isDefaultAddr
                      ? 'bg-gradient-to-b from-brand-50/50 to-white border-brand-300 ring-2 ring-brand-700/10 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-900 text-gold-300 border border-slate-800 shadow-xs">
                          {addr.label}
                        </span>
                        {isDefaultAddr && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-gold-400/60 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-gold-500 text-gold-600" />
                            <span>Default Delivery</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {addr.recipientName || user.fullName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {addr.phoneNumber || user.phoneNumber || 'Contact upon delivery'}
                      </p>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      {formatPhilippineAddress(addr)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      {!isDefaultAddr ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDefaultAddress(addr.id);
                            showNotification(`"${addr.label}" is now your default delivery address.`);
                          }}
                          className="text-[11px] font-bold text-brand-700 hover:text-brand-900 hover:underline"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Selected Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg font-semibold text-[11px] transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteAddress(addr.id);
                            showNotification(`Removed "${addr.label}" location.`);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] transition"
                          title="Delete this location"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Customer Orders List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-700" />
              <span>My Orders & Live Tracking</span>
            </h3>
            <p className="text-xs text-slate-500">
              Track your authentic US parcels from air forwarder clearance to local doorstep courier.
            </p>
          </div>
          <Link href="/orders" className="text-xs text-brand-800 font-bold hover:underline shrink-0">
            View All Orders →
          </Link>
        </div>

        <div className="space-y-4 pt-1">
          {displayOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 hover:border-gold-300 shadow-sm transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-900 block">{ord.orderNumber}</span>
                  <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                </div>

                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-50 text-brand-900 border border-brand-200">
                  {ord.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                {ord.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{it.productTitle}</span>
                    <span className="font-mono text-slate-500">x{it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Price</span>
                  <span className="font-bold text-slate-900 font-mono">₱{ord.totalAmountPhp.toLocaleString()} PHP</span>
                </div>

                <Link
                  href={`/orders`}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-lg text-xs transition shadow-xs"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. My Restock Wishlist Section */}
      <div id="wishlist" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                My Restock Wishlist ({wishlist.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sold-out outlet items you requested. We automatically notify our personal shoppers to hunt for these on upcoming US outlet trips.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-brand-800 hover:text-brand-900 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse Outlet Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-400">
              <Heart className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Your restock wishlist is empty</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Whenever an item or size is marked &ldquo;Sold Out&rdquo; in Shop Deals, click <strong>&ldquo;Add to Wishlist&rdquo;</strong> to request a restock from our seller.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              <span>Explore Shop Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 hover:border-gold-300 transition flex gap-4 items-start justify-between"
              >
                <div className="flex gap-3.5 items-start">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                    <Image
                      src={item.product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#06241c] text-gold-300">
                        {item.product.brand || item.product.retailerName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                        Size: {item.desiredSize || 'Standard'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      <Link href={`/products/${item.productId}`} className="hover:text-brand-800">
                        {item.product.title}
                      </Link>
                    </h4>

                    <div className="text-[11px] text-slate-600">
                      <span>₱{item.product.sellingPricePhp.toLocaleString()} PHP</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-brand-700 font-semibold">50% Deposit: ₱{Math.ceil(item.product.sellingPricePhp * 0.5).toLocaleString()}</span>
                    </div>

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                        <span>Restock Requested • Seller Notified</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-[11px] font-bold text-brand-800 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Edit Profile Info */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-700" />
                <h3 className="text-base font-bold text-slate-900">Edit Customer Profile</h3>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  placeholder="e.g. Maria Santos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  placeholder="e.g. +63 917 123 4567"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used by our delivery forwarder (Lalamove / J&T) for SMS parcel updates.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  placeholder="e.g. maria.santos@gmail.com"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-xl shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add or Edit Delivery Location */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingAddressId ? 'Edit Delivery Location' : 'Add New Delivery Location'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Location Label Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location Type / Label *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_LABELS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLabel(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                        label === p
                          ? 'bg-brand-900 text-gold-300 border-brand-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLabel('Custom')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                      label === 'Custom'
                        ? 'bg-brand-900 text-gold-300 border-brand-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Custom Name...
                  </button>
                </div>
                {label === 'Custom' && (
                  <input
                    type="text"
                    required
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g. Vacation House / Tagaytay"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  />
                )}
              </div>

              {/* Recipient info for this address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                    placeholder="Receiver full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                    placeholder="0917 123 4567"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address, Unit / Building Number *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  placeholder="e.g. Unit 14B, Tower 2, One Serendra, 32nd St."
                />
              </div>

              {/* Philippine cascading dropdown: Region/Province, City, Barangay, Postal Code */}
              <div className="pt-1">
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

              {/* Set as Default checkbox */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultLocationCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-brand-700 border-slate-300 rounded focus:ring-brand-700"
                />
                <label htmlFor="defaultLocationCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Set as my primary / default delivery address
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-xl shadow-sm transition"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
