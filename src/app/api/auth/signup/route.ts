import { NextRequest, NextResponse } from 'next/server';
import { signJwtSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phoneNumber, shippingAddress } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    const sessionPayload = {
      userId: `usr-cust-${Date.now().toString(36)}`,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber || '+63 900 000 0000',
      role: 'CUSTOMER' as const,
      shippingAddress: shippingAddress || {
        street: 'Sample Street',
        barangay: 'Barangay 1',
        city: 'Metro Manila',
        province: 'NCR',
        postalCode: '1000',
      },
    };

    const token = await signJwtSession({
      userId: sessionPayload.userId,
      email: sessionPayload.email,
      fullName: sessionPayload.fullName,
      role: sessionPayload.role,
    });

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
