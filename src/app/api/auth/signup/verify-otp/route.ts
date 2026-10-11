import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSignupOtp } from '@/lib/auth/customer-verification';
import { signJwtSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const userSession = await verifyCustomerSignupOtp({
      email,
      code,
    });

    const token = await signJwtSession({
      userId: userSession.userId,
      email: userSession.email,
      fullName: userSession.fullName,
      username: userSession.username,
      role: userSession.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account verified successfully!',
      user: userSession,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify code.' },
      { status: 400 }
    );
  }
}
