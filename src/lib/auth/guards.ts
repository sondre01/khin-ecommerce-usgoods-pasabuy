import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtSession, UserSession } from '@/lib/auth/session';

type RouteHandlerWithUser<T = any> = (
  req: NextRequest,
  context: { params: T; user: UserSession }
) => Promise<NextResponse> | NextResponse;

/**
 * Backend API guard wrapper for Admin-only routes.
 * If user is unauthenticated or not an ADMIN, returns 404 to cloak internal endpoints.
 */
export function withAdminGuard<T = any>(handler: RouteHandlerWithUser<T>) {
  return async (req: NextRequest, context: { params: T }) => {
    try {
      const authHeader = req.headers.get('authorization');
      const cookieToken = req.cookies.get('auth_token')?.value;
      const token = authHeader?.replace(/^Bearer\s+/i, '') || cookieToken;

      if (!token) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      const user = await verifyJwtSession(token);
      if (!user || user.role !== 'ADMIN') {
        // Return 404 instead of 403 to prevent admin endpoint reconnaissance
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      return await handler(req, { ...context, user });
    } catch (error) {
      console.error('RBAC Auth Guard Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}

/**
 * Backend API guard wrapper for Customer-authenticated routes.
 */
export function withCustomerGuard<T = any>(handler: RouteHandlerWithUser<T>) {
  return async (req: NextRequest, context: { params: T }) => {
    try {
      const authHeader = req.headers.get('authorization');
      const cookieToken = req.cookies.get('auth_token')?.value;
      const token = authHeader?.replace(/^Bearer\s+/i, '') || cookieToken;

      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const user = await verifyJwtSession(token);
      if (!user) {
        return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
      }

      return await handler(req, { ...context, user });
    } catch (error) {
      console.error('Customer Auth Guard Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}
