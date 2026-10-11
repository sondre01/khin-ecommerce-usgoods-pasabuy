import { NextRequest, NextResponse } from 'next/server';
import { resendAdminOtp } from '@/lib/auth/admin-invitations';

// POST /api/admin/join/resend - Resend 6-digit OTP code to the invited Gmail
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 });
    }

    const result = await resendAdminOtp(token);

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched to your Gmail.',
      simulatedOtp: result.simulatedOtp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification code' },
      { status: 400 }
    );
  }
}
