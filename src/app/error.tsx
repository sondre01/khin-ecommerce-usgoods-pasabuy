'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
            Unexpected Error
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Something went wrong</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {error?.message || 'An unexpected error occurred while loading this page. Please try again.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ring-1 ring-gold-400/30"
          >
            <RefreshCw className="w-4 h-4 text-gold-300" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
