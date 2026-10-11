import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveAdmins,
  getAllInvitations,
  createAdminInvitation,
  revokeAdminInvitation,
  removeAdmin,
} from '@/lib/auth/admin-invitations';
import { withAdminGuard } from '@/lib/auth/guards';

// GET /api/admin/team - Get all admins and pending invitations
export const GET = withAdminGuard(async () => {
  try {
    const admins = getActiveAdmins();
    const invitations = getAllInvitations();
    return NextResponse.json({
      success: true,
      admins,
      invitations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin team' },
      { status: 500 }
    );
  }
});

// POST /api/admin/team - Invite a new admin via Gmail and send verification code
export const POST = withAdminGuard(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const { fullName, email } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: 'Please enter the admin full name.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Please provide a valid Gmail address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email format.' },
        { status: 400 }
      );
    }

    const result = await createAdminInvitation({
      fullName: fullName.trim(),
      email: cleanEmail,
      invitedBy: user?.fullName || 'Khin Andrei Gamboa',
    });

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const inviteLink = `${origin}/admin/join?token=${result.invitation.inviteToken}`;

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      inviteLink,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create admin invitation' },
      { status: 400 }
    );
  }
});

// DELETE /api/admin/team - Revoke an invitation or remove an admin
export const DELETE = withAdminGuard(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get('invitationId');
    const adminId = searchParams.get('adminId');

    if (invitationId) {
      const revoked = revokeAdminInvitation(invitationId);
      return NextResponse.json({ success: revoked });
    }

    if (adminId) {
      const removed = removeAdmin(adminId);
      return NextResponse.json({ success: removed });
    }

    return NextResponse.json(
      { error: 'Missing invitationId or adminId parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Action failed' },
      { status: 400 }
    );
  }
});
