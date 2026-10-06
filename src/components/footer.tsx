import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Plane, Ship, CheckCircle2, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#051c16] text-emerald-100/80 border-t border-[#0e3d30] pt-14 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#06241c]">
                  <Image
                    src="/logo.jpg"
                    alt="US Goods PasaBuy Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                US Goods <span className="text-gold-400 font-serif italic">PasaBuy</span>
              </span>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Legitimate, transparent personal shopping from US retail stores straight to your Philippine doorstep.
              Zero hidden customs fees with clear, upfront pricing.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-200/80">
              <span className="flex items-center gap-1.5"><Plane className="w-3.5 h-3.5 text-gold-400" /> Air Cargo</span>
              <span className="flex items-center gap-1.5"><Ship className="w-3.5 h-3.5 text-emerald-400" /> Sea Cargo</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-3">Shop & Services</h4>
            <ul className="space-y-2 text-xs text-emerald-200/70">
              <li><Link href="/products" className="hover:text-gold-200 transition">Shop US Finds</Link></li>
              <li><Link href="/custom-quote" className="hover:text-gold-200 transition">Request Restock</Link></li>
              <li><Link href="/orders" className="hover:text-gold-200 transition">Track Your Order</Link></li>
              <li><Link href="/#calculator" className="hover:text-gold-200 transition">Price Calculator</Link></li>
            </ul>
          </div>

          {/* PasaBuy Guarantee */}
          <div>
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-3">Our Guarantees</h4>
            <ul className="space-y-2 text-xs text-emerald-200/70">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> 100% Authentic US Goods</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> 0% US Sales Tax</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> 50% Downpayment (Pay Half Later)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> Door-to-Door Local Delivery</li>
            </ul>
          </div>

          {/* Customer Support & FAQs */}
          <div>
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-3">Customer Support</h4>
            <ul className="space-y-2 text-xs text-emerald-200/70">
              <li><Link href="/custom-quote" className="hover:text-gold-200 transition">How 50% Deposit Works</Link></li>
              <li><Link href="/orders" className="hover:text-gold-200 transition">Air Cargo Tracking</Link></li>
              <li><Link href="/#calculator" className="hover:text-gold-200 transition">Price Calculator (No Hidden Fees)</Link></li>
              <li><span className="text-emerald-300/80">Support: support@usgoodspasabuy.ph</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#0e3d30] flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
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
