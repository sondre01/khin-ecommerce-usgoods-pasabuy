import { NextRequest, NextResponse } from 'next/server';
import { signJwtSession } from '@/lib/auth/session';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role: UserRole = body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    const sessionPayload = {
      userId: role === 'ADMIN' ? 'usr-admin-01' : 'usr-customer-01',
      email: role === 'ADMIN' ? 'admin@usgoodspasabuy.ph' : 'maria.santos@gmail.com',
      fullName: role === 'ADMIN' ? 'Head Logistics Admin' : 'Maria Santos',
      role,
    };

    const token = await signJwtSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
