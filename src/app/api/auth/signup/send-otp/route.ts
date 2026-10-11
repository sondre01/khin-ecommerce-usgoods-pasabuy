import { NextRequest, NextResponse } from 'next/server';
import { sendCustomerSignupOtp } from '@/lib/auth/customer-verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phoneNumber, shippingAddress } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const result = await sendCustomerSignupOtp({
      fullName,
      email,
      phoneNumber,
      shippingAddress,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${result.email}`,
      email: result.email,
      simulatedOtp: result.simulatedOtp,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code.' },
      { status: 400 }
    );
  }
}
