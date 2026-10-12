import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = await verifyJwtSession(token);
  // If token is invalid or corresponds to obsolete mock auto-provisioned admin email, invalidate cookie
  if (!user || user.email === 'khinag@usgoodspasabuy.ph') {
    const res = NextResponse.json({ user: null });
    res.cookies.set('auth_token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
    return res;
  }

  return NextResponse.json({ user });
}
