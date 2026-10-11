import { NextRequest, NextResponse } from 'next/server';
import {
  getInvitationByToken,
  verifyAdminInvitationOtp,
} from '@/lib/auth/admin-invitations';
import { signJwtSession } from '@/lib/auth/session';

// GET /api/admin/join?token=... - Check invitation validity and details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 });
    }

    const invitation = getInvitationByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { error: 'This invitation link is invalid or does not exist.' },
        { status: 404 }
      );
    }

    if (invitation.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'This invitation has been revoked by the head administrator.' },
        { status: 410 }
      );
    }

    if (invitation.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'This invitation has already been verified and activated.' },
        { status: 409 }
      );
    }

    const isExpired = new Date() > new Date(invitation.codeExpiresAt);

    return NextResponse.json({
      success: true,
      invitation: {
        fullName: invitation.fullName,
        email: invitation.email,
        username: invitation.username,
        codeExpiresAt: invitation.codeExpiresAt,
        isExpired,
        invitedBy: invitation.invitedBy,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to inspect invitation' },
      { status: 500 }
    );
  }
}

// POST /api/admin/join - Verify 6-digit Gmail OTP code and issue Admin JWT session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, code } = body;

    if (!token || !code) {
      return NextResponse.json(
        { error: 'Please provide both the invitation token and 6-digit code.' },
        { status: 400 }
      );
    }

    const activatedAdmin = await verifyAdminInvitationOtp({
      inviteToken: token,
      code: code.trim(),
    });

    // Create Admin JWT session
    const sessionPayload = {
      userId: activatedAdmin.id,
      email: activatedAdmin.email,
      fullName: activatedAdmin.fullName,
      username: activatedAdmin.username,
      role: 'ADMIN' as const,
    };

    const jwtToken = await signJwtSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      admin: activatedAdmin,
    });

    // Set secure authentication cookie
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed. Please check your code and try again.' },
      { status: 400 }
    );
  }
}
