import { NextRequest, NextResponse } from 'next/server';
import { signJwtSession } from '@/lib/auth/session';
import { UserRole } from '@/types';
import { generateUsername } from '@/lib/username';

import { getActiveAdmins, SUPER_ADMIN_EMAIL } from '@/lib/auth/admin-invitations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role: UserRole = body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    let sessionPayload;

    if (role === 'ADMIN') {
      const inputEmail = (body.email || '').toLowerCase().trim();
      const inputUsername = (body.username || '').toLowerCase().trim();

      const activeAdmins = getActiveAdmins();
      const matchedAdmin = activeAdmins.find(
        (a) =>
          a.email.toLowerCase() === inputEmail ||
          (inputUsername && a.username.toLowerCase() === inputUsername)
      );

      // Allow if matches active admin or matches super admin or default login
      if (inputEmail && inputEmail !== SUPER_ADMIN_EMAIL && !matchedAdmin) {
        return NextResponse.json(
          { error: `Unauthorized. Only ${SUPER_ADMIN_EMAIL} or invited administrators can access the admin portal.` },
          { status: 403 }
        );
      }

      sessionPayload = {
        userId: matchedAdmin ? matchedAdmin.id : 'usr-admin-khinag',
        email: matchedAdmin ? matchedAdmin.email : SUPER_ADMIN_EMAIL,
        fullName: matchedAdmin ? matchedAdmin.fullName : 'Khin Andrei Gamboa',
        username: matchedAdmin ? matchedAdmin.username : 'khinag',
        role: 'ADMIN' as UserRole,
      };
    } else {
      const fullName = body.fullName || 'Maria Santos';
      const username = body.username || generateUsername(fullName);
      const email = body.email || 'maria.santos@gmail.com';

      sessionPayload = {
        userId: 'usr-customer-01',
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        username,
        role: 'CUSTOMER' as UserRole,
      };
    }

    const token = await signJwtSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

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
