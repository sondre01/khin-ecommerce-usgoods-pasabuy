import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { signJwtSession } from '@/lib/auth/session';
import { generateUsername } from '@/lib/username';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

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

    const username = body.username || generateUsername(fullName);

    const userId = crypto.randomUUID();
    const sessionPayload = {
      userId,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      username,
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

    // Attempt to sync to Supabase users table
    try {
      const supabase = getSupabaseServiceClient();
      if (supabase) {
        await supabase.from('users').upsert(
          {
            id: sessionPayload.userId,
            email: sessionPayload.email,
            password_hash: 'otp_verified',
            full_name: sessionPayload.fullName,
            phone_number: sessionPayload.phoneNumber,
            role: 'CUSTOMER',
            shipping_address: sessionPayload.shippingAddress,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
      }
    } catch (err: any) {
      console.warn('[SUPABASE_SYNC] User upsert notice in direct signup:', err.message);
    }

    const token = await signJwtSession({
      userId: sessionPayload.userId,
      email: sessionPayload.email,
      fullName: sessionPayload.fullName,
      username: sessionPayload.username,
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
