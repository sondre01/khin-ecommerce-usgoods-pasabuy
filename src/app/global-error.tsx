'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Application Error</h1>
            <p className="text-xs text-slate-500">
              An unexpected system error occurred. Please refresh or try again.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#0a3529] hover:bg-[#07241d] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
