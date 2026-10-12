import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtSession } from '@/lib/auth/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. ADMIN ROUTE ACCESS & PROTECTION
  if (pathname.startsWith('/admin')) {
    // Always allow admin login page and invitation onboarding page
    if (pathname === '/admin/login' || pathname === '/admin/join') {
      return NextResponse.next();
    }

    const token = req.cookies.get('auth_token')?.value;
    const session = token ? await verifyJwtSession(token) : null;

    // If no active admin session, redirect to admin login page
    if (!session || session.role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. PROTECTED CUSTOMER PORTAL
  if (pathname.startsWith('/account')) {
    const token = req.cookies.get('auth_token')?.value;
    const session = token ? await verifyJwtSession(token) : null;

    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
