'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

function AdminJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<{
    fullName: string;
    email: string;
    username: string;
    codeExpiresAt: string;
    isExpired: boolean;
    invitedBy: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Resend state
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoadError('No invitation token provided. Please open the link sent by your administrator.');
      setLoading(false);
      return;
    }

    const checkInvite = async () => {
      try {
        const res = await fetch(`/api/admin/join?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setInvitation(data.invitation);
        } else {
          setLoadError(data.error || 'Invitation is invalid or has expired.');
        }
      } catch (err) {
        setLoadError('Failed to verify invitation. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    checkInvite();
  }, [token]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    if (!token || !otpCode.trim()) {
      setVerifyError('Please enter the 6-digit code sent to your Gmail.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/admin/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 2000);
      } else {
        setVerifyError(data.error || 'Invalid verification code. Please check your Gmail and try again.');
      }
    } catch (err) {
      setVerifyError('An error occurred during verification. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !token) return;
    setResending(true);
    setResendNotice(null);
    setVerifyError(null);

    try {
      const res = await fetch('/api/admin/join/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendNotice('A fresh 6-digit code has been dispatched to your Gmail inbox.');
        setCooldown(60);
      } else {
        setVerifyError(data.error || 'Failed to resend code.');
      }
    } catch (err) {
      setVerifyError('Network error while resending code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051c16] via-[#093529] to-[#041913] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md bg-[#06241c]/95 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 mx-auto shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#06241c]">
              <Image
                src="/logo.jpg"
                alt="US Goods PasaBuy Logo"
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/40 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Onboarding
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Activate Admin Access</h1>
            <p className="text-xs text-emerald-200/70 mt-1">
              Authenticate your Gmail to unlock PasaBuy management privileges.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-gold-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300">Validating your administrator invitation...</p>
          </div>
        )}

        {/* Load Error State */}
        {!loading && loadError && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/80 border border-rose-600/80 rounded-2xl text-xs space-y-2 text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Invitation Inaccessible</span>
              </div>
              <p className="text-[11px] leading-relaxed">{loadError}</p>
            </div>
            <Link
              href="/"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold block text-center transition"
            >
              Return to Public Storefront
            </Link>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="p-6 bg-emerald-950 border border-emerald-500 rounded-2xl text-center space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-white">Gmail Authenticated!</h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              Your administrator privileges have been activated. Redirecting you to the Admin Dashboard...
            </p>
          </div>
        )}

        {/* Verification Form */}
        {!loading && !loadError && !success && invitation && (
          <form onSubmit={handleVerify} className="space-y-5">
            {/* Invitee Preview Card */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Invited Administrator:
                  </span>
                  <div className="font-extrabold text-white text-sm mt-0.5">{invitation.fullName}</div>
                </div>
                <span className="font-mono text-[10px] font-bold text-gold-400 bg-gold-950/60 px-2 py-0.5 rounded border border-gold-800/50">
                  @{invitation.username}
                </span>
              </div>

              <div className="flex items-center gap-2 text-emerald-300/80 pt-1 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{invitation.email}</span>
              </div>
            </div>

            {/* Error or Resend Notices */}
            {verifyError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600 text-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {resendNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resendNotice}</span>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">
                  6-Digit Verification Code:
                </label>
                <span className="text-[10px] text-gold-400 font-semibold">Check your Gmail</span>
              </div>

              <div className="relative">
                <Key className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 849201"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-lg font-black tracking-widest text-center focus:ring-2 focus:ring-gold-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center pt-0.5">
                Enter the single-use 6-digit authentication code sent to {invitation.email}.
              </p>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={verifying || otpCode.length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Gmail & Activate Access</span>
                </>
              )}
            </button>

            {/* Resend Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-xs text-slate-400 hover:text-gold-300 font-semibold transition disabled:opacity-50"
              >
                {cooldown > 0 ? (
                  <span>Resend code in {cooldown}s</span>
                ) : resending ? (
                  <span>Dispatching new code...</span>
                ) : (
                  <span>Didn&apos;t receive code? Resend to Gmail</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#051c16] flex items-center justify-center text-gold-400 font-bold text-xs">
          Loading authentication portal...
        </div>
      }
    >
      <AdminJoinContent />
    </Suspense>
  );
}
