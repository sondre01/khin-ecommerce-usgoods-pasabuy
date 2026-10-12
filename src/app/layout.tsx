import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'US Goods PasaBuy - Authentic US Retail Delivered to the Philippines',
  description: 'Shop authentic US retail outlet goods directly from the US. Transparent landed costs, Oregon tax-free freight forwarder, direct personal shopping to your doorstep with full upfront payment.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

import Providers from '@/components/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col min-h-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
