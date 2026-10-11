'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AtSign,
  KeyRound,
  RotateCw,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import PhilippineAddressSelector from '@/components/philippine-address-selector';
import { generateUsername } from '@/lib/username';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  const { sendSignupOtp, verifySignupOtp, resendSignupOtp } = useAuth();

  // Step state: 1 = Details Form, 2 = Gmail OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Shipping address
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend button countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Focus first OTP box when entering Step 2
  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // Step 1: Submit details and send 6-digit OTP to Gmail
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await sendSignupOtp({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        shippingAddress: street
          ? {
              street,
              barangay,
              city,
              province,
              postalCode,
            }
          : undefined,
      });

      if (res.success) {
        setStep(2);
        setResendCountdown(60);
        if (res.simulatedOtp) {
          setSimulatedOtp(res.simulatedOtp);
        }
      } else {
        setError(res.error || 'Failed to dispatch verification code to your email.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle 6-digit input changes
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of whole code
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length > 0) {
        const newDigits = [...otpCode];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || '';
        }
        setOtpCode(newDigits);
        const focusIdx = Math.min(cleaned.length, 5);
        inputRefs.current[focusIdx]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpCode];
    newDigits[index] = digit;
    setOtpCode(newDigits);

    // Auto-advance cursor
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP and complete account creation
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const fullCode = otpCode.join('').trim();
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifySignupOtp({
        email: email.trim(),
        code: fullCode,
      });

      if (res.success) {
        setSuccessMsg('Email verified successfully! Welcome to US Goods PasaBuy.');
        setTimeout(() => {
          router.push(callbackUrl);
        }, 800);
      } else {
        setError(res.error || 'Incorrect code. Please check your Gmail inbox and try again.');
      }
    } catch {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResend = async () => {
    if (resendCountdown > 0 || loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await resendSignupOtp(email.trim());
      if (res.success) {
        setResendCountdown(60);
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        if (res.simulatedOtp) {
          setSimulatedOtp(res.simulatedOtp);
        }
      } else {
        setError(res.error || 'Could not resend code. Please try again.');
      }
    } catch {
      setError('Network error trying to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Authentic US Goods • Verified Customer Registration</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {step === 1 ? 'Create Your Account' : 'Verify Your Gmail'}
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {step === 1
            ? 'Sign up with your Gmail to track US orders, save addresses, and access 0% US Sales Tax rates.'
            : `We sent a single-use 6-digit code to ${email}. Enter the code below to activate your account.`}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Details Entry Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            {/* Personal Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-700" />
                <span>Personal Details</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                />
                {fullName.trim() && (
                  <div className="text-[11px] text-emerald-800 mt-1.5 flex items-center gap-1.5 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <AtSign className="w-3 h-3 text-emerald-600" />
                    <span>Assigned username:</span>
                    <strong className="text-emerald-950 font-bold font-mono">
                      @{generateUsername(fullName)}
                    </strong>
                    <span className="text-slate-400 text-[10px] ml-auto">
                      (First name + initials)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gmail / Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. maria@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    A 6-digit code will be sent here to authenticate ownership.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Philippine Mobile # *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0917 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    For local courier rider updates upon PH arrival.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-700" />
                <span>Primary Delivery Address (Philippines)</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address, Unit / House No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Unit 14B Tower 2, One Serendra"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 ring-1 ring-gold-400/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Verification Code to Gmail...</span>
              ) : (
                <>
                  <span>Continue to Gmail Verification</span>
                  <ArrowRight className="w-4 h-4 text-gold-300" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Gmail OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-950">
                  Verification code dispatched to:
                </p>
                <p className="font-mono text-emerald-800 font-semibold">{email}</p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium pt-1"
                >
                  ← Change email address or details
                </button>
              </div>
            </div>

            {/* Simulated code display for quick dev testing */}
            {simulatedOtp && (
              <div className="p-3 bg-amber-50 border border-amber-300/80 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold">⚡ Preview Verification Code: </span>
                  <span className="font-mono font-black text-sm tracking-widest text-brand-900">
                    {simulatedOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = simulatedOtp.split('');
                    setOtpCode(digits);
                    inputRefs.current[5]?.focus();
                  }}
                  className="text-[10px] bg-white px-2 py-1 border border-amber-300 rounded font-bold hover:bg-amber-100"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* 6-Digit Code Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 text-center mb-3">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-center items-center gap-2 sm:gap-3">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono bg-slate-50 border-2 border-slate-300 focus:border-brand-700 focus:bg-white rounded-xl focus:outline-none transition shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* Submit & Resend Controls */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otpCode.join('').length !== 6}
                className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 ring-1 ring-gold-400/30 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating Gmail...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-gold-300" />
                    <span>Verify Code & Complete Sign Up</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to form</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || loading}
                  className="font-bold text-brand-800 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>
                    {resendCountdown > 0
                      ? `Resend code (${resendCountdown}s)`
                      : 'Resend code'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-800 font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-xs text-slate-400">
          Loading sign up...
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
