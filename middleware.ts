import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtSession } from './src/lib/auth/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. ADMIN ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('auth_token')?.value;
    const session = token ? await verifyJwtSession(token) : null;

    // Strict security: If user is not an ADMIN, rewrite response to /not-found (HTTP 404)
    // This conceals the existence of the admin portal from unauthorized users
    if (!session || session.role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/not-found';
      return NextResponse.rewrite(url, { status: 404 });
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
