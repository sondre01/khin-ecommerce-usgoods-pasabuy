import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = await verifyJwtSession(token);
  return NextResponse.json({ user });
}
