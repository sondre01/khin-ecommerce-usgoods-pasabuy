import Link from 'next/link';
import { PackageX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <PackageX className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist or you don't have authorization to access this path.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
