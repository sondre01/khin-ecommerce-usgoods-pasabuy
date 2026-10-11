import { NextRequest, NextResponse } from 'next/server';
import { resendCustomerSignupOtp } from '@/lib/auth/customer-verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const result = await resendCustomerSignupOtp(email);

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched.',
      simulatedOtp: result.simulatedOtp,
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification code.' },
      { status: 400 }
    );
  }
}
