import crypto from 'crypto';
import { generateUsername } from '@/lib/username';
import { sendEmail, getAdminOtpEmailHtml } from '@/lib/email';

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'ADMIN';
  isHeadAdmin?: boolean;
  addedAt: string;
  lastLoginAt?: string;
  invitedBy?: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  fullName: string;
  username: string;
  inviteToken: string;
  verificationCode: string;
  codeExpiresAt: string;
  status: 'PENDING_OTP' | 'ACTIVE' | 'REVOKED';
  invitedBy: string;
  createdAt: string;
  activatedAt?: string;
}

// Global persistence store across hot-reloads in Node runtime
const globalStore = global as unknown as {
  __adminUsers?: AdminUser[];
  __adminInvitations?: AdminInvitation[];
};

if (!globalStore.__adminUsers) {
  globalStore.__adminUsers = [
    {
      id: 'usr-admin-khinag',
      fullName: 'Khin Andrei Gamboa',
      username: 'khinag',
      email: 'khinag@usgoodspasabuy.ph',
      role: 'ADMIN',
      isHeadAdmin: true,
      addedAt: '2026-10-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.__adminInvitations) {
  globalStore.__adminInvitations = [];
}

/**
 * Return all active admins
 */
export function getActiveAdmins(): AdminUser[] {
  return globalStore.__adminUsers || [];
}

/**
 * Return all invitations
 */
export function getAllInvitations(): AdminInvitation[] {
  return globalStore.__adminInvitations || [];
}

/**
 * Find invitation by token
 */
export function getInvitationByToken(token: string): AdminInvitation | null {
  const invites = globalStore.__adminInvitations || [];
  return invites.find((i) => i.inviteToken === token) || null;
}

/**
 * Find invitation by email
 */
export function getInvitationByEmail(email: string): AdminInvitation | null {
  const cleanEmail = email.toLowerCase().trim();
  const invites = globalStore.__adminInvitations || [];
  return invites.find((i) => i.email.toLowerCase() === cleanEmail && i.status === 'PENDING_OTP') || null;
}

/**
 * Create a new admin invitation and send 6-digit OTP code to their Gmail
 */
export async function createAdminInvitation({
  fullName,
  email,
  invitedBy = 'Khin Andrei Gamboa',
}: {
  fullName: string;
  email: string;
  invitedBy?: string;
}): Promise<{ invitation: AdminInvitation }> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = fullName.trim();
  const username = generateUsername(cleanName);

  // Check if admin already exists
  const existingAdmin = (globalStore.__adminUsers || []).find(
    (a) => a.email.toLowerCase() === cleanEmail
  );
  if (existingAdmin) {
    throw new Error(`An administrator with Gmail ${cleanEmail} is already registered.`);
  }

  // Generate 6-digit OTP code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const inviteToken = `adm_inv_${crypto.randomBytes(16).toString('hex')}`;
  const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  // Invalidate any prior pending invite for this email
  if (globalStore.__adminInvitations) {
    globalStore.__adminInvitations = globalStore.__adminInvitations.filter(
      (inv) => inv.email.toLowerCase() !== cleanEmail
    );
  }

  const invitation: AdminInvitation = {
    id: `inv-${Date.now()}`,
    email: cleanEmail,
    fullName: cleanName,
    username,
    inviteToken,
    verificationCode,
    codeExpiresAt,
    status: 'PENDING_OTP',
    invitedBy,
    createdAt: new Date().toISOString(),
  };

  // Send the OTP via Email to Gmail inbox
  const html = getAdminOtpEmailHtml(cleanName, verificationCode, 15);
  await sendEmail({
    to: cleanEmail,
    subject: `Your PasaBuy Admin Verification Code: ${verificationCode}`,
    html,
    text: `Hello ${cleanName}, your PasaBuy admin verification code is: ${verificationCode}. This code is valid for 15 minutes.`,
  });

  // Only register invitation after email successfully sends
  globalStore.__adminInvitations?.push(invitation);

  return { invitation };
}

/**
 * Resend verification OTP code for an invitation
 */
export async function resendAdminOtp(inviteToken: string): Promise<{ success: boolean }> {
  const invitation = getInvitationByToken(inviteToken);
  if (!invitation) {
    throw new Error('Invitation not found or has expired.');
  }

  if (invitation.status !== 'PENDING_OTP') {
    throw new Error('This invitation has already been processed or revoked.');
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  const html = getAdminOtpEmailHtml(invitation.fullName, newCode, 15);
  await sendEmail({
    to: invitation.email,
    subject: `Your New PasaBuy Admin Verification Code: ${newCode}`,
    html,
    text: `Hello ${invitation.fullName}, your new PasaBuy admin verification code is: ${newCode}. Valid for 15 minutes.`,
  });

  invitation.verificationCode = newCode;
  invitation.codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return { success: true };
}

/**
 * Verify 6-digit OTP code and activate new admin
 */
export async function verifyAdminInvitationOtp({
  inviteToken,
  code,
}: {
  inviteToken: string;
  code: string;
}): Promise<AdminUser> {
  const invitation = getInvitationByToken(inviteToken);
  if (!invitation) {
    throw new Error('Invitation link is invalid or does not exist.');
  }

  if (invitation.status === 'REVOKED') {
    throw new Error('This invitation has been revoked by the head administrator.');
  }

  if (invitation.status === 'ACTIVE') {
    throw new Error('This invitation has already been verified and activated.');
  }

  // Check expiration
  if (new Date() > new Date(invitation.codeExpiresAt)) {
    throw new Error('Verification code has expired. Please request a new code.');
  }

  // Check code match
  if (invitation.verificationCode.trim() !== code.trim()) {
    throw new Error('Incorrect 6-digit verification code. Please check your Gmail and try again.');
  }

  // Mark invitation active
  invitation.status = 'ACTIVE';
  invitation.activatedAt = new Date().toISOString();

  // Create new active admin
  const newAdmin: AdminUser = {
    id: `usr-admin-${invitation.username}-${Date.now().toString().slice(-4)}`,
    fullName: invitation.fullName,
    username: invitation.username,
    email: invitation.email,
    role: 'ADMIN',
    isHeadAdmin: false,
    addedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    invitedBy: invitation.invitedBy,
  };

  globalStore.__adminUsers?.push(newAdmin);
  return newAdmin;
}

/**
 * Revoke invitation
 */
export function revokeAdminInvitation(invitationId: string): boolean {
  const inv = globalStore.__adminInvitations?.find((i) => i.id === invitationId);
  if (!inv) return false;
  inv.status = 'REVOKED';
  return true;
}

/**
 * Remove an admin (Head admin cannot be removed)
 */
export function removeAdmin(adminId: string): boolean {
  if (adminId === 'usr-admin-khinag') {
    throw new Error('The primary Head Administrator account cannot be removed.');
  }

  const initialLen = globalStore.__adminUsers?.length || 0;
  globalStore.__adminUsers = globalStore.__adminUsers?.filter((a) => a.id !== adminId);
  return (globalStore.__adminUsers?.length || 0) < initialLen;
}
