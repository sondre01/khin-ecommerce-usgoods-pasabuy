'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  X,
  Lock,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  reason,
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [loadingDemo, setLoadingDemo] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setLoadingDemo(true);
    try {
      const ok = await login('maria.santos@gmail.com', 'password123', 'CUSTOMER');
      if (ok) {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-gold-400/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-[#051c16] via-[#093529] to-[#051c16] text-white p-6 relative border-b border-gold-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-400/40 flex items-center justify-center mb-3 shadow-sm">
            <ShoppingBag className="w-6 h-6 text-gold-400" />
          </div>

          <span className="text-[10px] font-bold text-gold-300 uppercase tracking-wider block">
            Member Access Required
          </span>
          <h3 className="text-xl font-black text-white mt-0.5 tracking-tight">
            Sign Up to Unlock & Shop
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
            {reason || 'Create a free account or sign in to add items to your cart, reserve US outlet stock with a 50% deposit, and view full collections.'}
          </p>
        </div>

        {/* Benefits bullets */}
        <div className="p-6 space-y-5">
          <div className="space-y-2 bg-brand-50/60 p-3.5 rounded-2xl border border-brand-100 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full catalog access for CK, Tommy Hilfiger, Ralph Lauren, and Lacoste</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>50% downpayment slot reservations via GCash & Maya</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Door-to-door delivery tracking straight to your home</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Link
              href="/signup"
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 hover:from-brand-900 hover:to-brand-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md ring-1 ring-gold-400/30 transition text-center"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </Link>

            <Link
              href="/login"
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center transition text-center"
            >
              Sign In to Existing Account
            </Link>
          </div>

          {/* 1-Click Fast Track for Evaluation */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={loadingDemo}
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-gold-50 hover:bg-gold-100 text-slate-900 border border-gold-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-brand-800" />
              <span>{loadingDemo ? 'Signing in...' : '⚡ 1-Click Sign In (Maria Santos Demo)'}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Quick preview sign-in for testing the customer buying flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
