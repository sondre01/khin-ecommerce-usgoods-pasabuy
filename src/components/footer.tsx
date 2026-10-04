import Link from 'next/link';
import { ShieldCheck, Plane, Ship, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                PB
              </div>
              <span className="font-bold text-white text-lg">US Goods PasaBuy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Legitimate, transparent personal shopping from US retail stores straight to your Philippine doorstep.
              Zero hidden customs fees with transparent landed cost breakdowns.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Plane className="w-3.5 h-3.5 text-blue-400" /> Air Cargo</span>
              <span className="flex items-center gap-1"><Ship className="w-3.5 h-3.5 text-emerald-400" /> Sea Cargo</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Shop & Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/products" className="hover:text-white transition">Catalog Products</Link></li>
              <li><Link href="/custom-quote" className="hover:text-white transition">Request Custom Quote</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">Track Your Parcel</Link></li>
              <li><Link href="/#calculator" className="hover:text-white transition">Landed Cost Calculator</Link></li>
            </ul>
          </div>

          {/* PasaBuy Guarantee */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Our Guarantees</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Authentic US Goods</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Oregon 0% Sales Tax Forwarder</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 50% Downpayment Option</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Door-to-Door Local Delivery</li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Internal Portal</h4>
            <p className="text-xs text-slate-400 mb-3">
              Admin routes are strictly guarded via Edge middleware with 404 cloaking for unauthorized requests.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              Go to Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 US Goods PasaBuy Philippines. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Payment Methods: GCash, Maya, BDO, BPI</span>
            <span>•</span>
            <span>Local Forwarders: Lalamove, J&T Express</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
