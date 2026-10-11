import crypto from 'crypto';
import { generateUsername } from '@/lib/username';
import { sendEmail, getCustomerOtpEmailHtml } from '@/lib/email';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export interface CustomerPendingOtp {
  email: string;
  fullName: string;
  username: string;
  phoneNumber?: string;
  shippingAddress?: any;
  verificationCode: string;
  codeExpiresAt: string;
  createdAt: string;
  attempts: number;
}

// Global persistence store across hot-reloads in Node runtime
const globalStore = global as unknown as {
  __customerOtps?: Map<string, CustomerPendingOtp>;
  __registeredCustomers?: Map<string, any>;
};

if (!globalStore.__customerOtps) {
  globalStore.__customerOtps = new Map<string, CustomerPendingOtp>();
}

if (!globalStore.__registeredCustomers) {
  globalStore.__registeredCustomers = new Map<string, any>();
}

/**
 * Initiates customer registration by sending a 6-digit OTP code to their Gmail address
 */
export async function sendCustomerSignupOtp({
  fullName,
  email,
  phoneNumber,
  shippingAddress,
}: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  shippingAddress?: any;
}): Promise<{ success: boolean; email: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = fullName.trim();

  if (!cleanEmail || !cleanName) {
    throw new Error('Full name and email are required.');
  }

  const username = generateUsername(cleanName);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const pendingRecord: CustomerPendingOtp = {
    email: cleanEmail,
    fullName: cleanName,
    username,
    phoneNumber: phoneNumber?.trim() || '+63 900 000 0000',
    shippingAddress,
    verificationCode,
    codeExpiresAt,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  // Dispatch branded verification email directly to customer's Gmail
  const html = getCustomerOtpEmailHtml(cleanName, verificationCode, 10);
  await sendEmail({
    to: cleanEmail,
    subject: `Your US Goods PasaBuy Verification Code: ${verificationCode}`,
    html,
    text: `Hello ${cleanName}, your 6-digit verification code is: ${verificationCode}. Valid for 10 minutes.`,
  });

  // Only store in pending store after email is successfully dispatched
  globalStore.__customerOtps?.set(cleanEmail, pendingRecord);

  return {
    success: true,
    email: cleanEmail,
  };
}

/**
 * Resends a fresh 6-digit OTP code to the customer's Gmail
 */
export async function resendCustomerSignupOtp(
  email: string
): Promise<{ success: boolean }> {
  const cleanEmail = email.toLowerCase().trim();
  const record = globalStore.__customerOtps?.get(cleanEmail);

  if (!record) {
    throw new Error('No pending registration found for this email. Please fill in the sign up form.');
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  const html = getCustomerOtpEmailHtml(record.fullName, newCode, 10);
  await sendEmail({
    to: cleanEmail,
    subject: `Your New US Goods PasaBuy Verification Code: ${newCode}`,
    html,
    text: `Hello ${record.fullName}, your new 6-digit verification code is: ${newCode}. Valid for 10 minutes.`,
  });

  record.verificationCode = newCode;
  record.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  record.attempts = 0;

  return { success: true };
}

/**
 * Verifies the customer's 6-digit OTP code, creates account, and syncs to Supabase
 */
export async function verifyCustomerSignupOtp({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<{
  userId: string;
  email: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  role: 'CUSTOMER';
  shippingAddress: any;
}> {
  const cleanEmail = email.toLowerCase().trim();
  const record = globalStore.__customerOtps?.get(cleanEmail);

  if (!record) {
    throw new Error('Verification session expired or not found. Please sign up again.');
  }

  // Check expiration
  if (new Date() > new Date(record.codeExpiresAt)) {
    throw new Error('Verification code has expired. Please request a new code.');
  }

  // Check code
  if (record.verificationCode.trim() !== code.trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      globalStore.__customerOtps?.delete(cleanEmail);
      throw new Error('Too many incorrect code attempts. Please sign up again.');
    }
    throw new Error('Invalid 6-digit verification code. Please check your Gmail and try again.');
  }

  // Clean up pending OTP record
  globalStore.__customerOtps?.delete(cleanEmail);

  const userId = crypto.randomUUID();
  const userSession = {
    userId,
    email: record.email,
    fullName: record.fullName,
    username: record.username,
    phoneNumber: record.phoneNumber || '+63 900 000 0000',
    role: 'CUSTOMER' as const,
    shippingAddress: record.shippingAddress || {
      street: 'Sample Street',
      barangay: 'Barangay 1',
      city: 'Metro Manila',
      province: 'NCR',
      postalCode: '1000',
    },
  };

  // Cache in server memory
  globalStore.__registeredCustomers?.set(record.email, userSession);

  // Sync to Supabase users table (asynchronous best effort so network errors won't block sign in)
  try {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      const { error } = await supabase.from('users').upsert(
        {
          id: userId,
          email: userSession.email,
          password_hash: 'otp_verified',
          full_name: userSession.fullName,
          phone_number: userSession.phoneNumber,
          role: 'CUSTOMER',
          shipping_address: userSession.shippingAddress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
      if (error) {
        console.warn('[SUPABASE_SYNC] Note: Supabase users table upsert returned:', error.message);
      } else {
        console.log(`[SUPABASE_SYNC] Successfully synchronized verified customer: ${userSession.email}`);
      }
    }
  } catch (err: any) {
    console.warn('[SUPABASE_SYNC] Supabase customer sync notice:', err.message);
  }

  return userSession;
}
