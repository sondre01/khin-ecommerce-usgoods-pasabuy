'use client';

import React, { useState, useEffect } from 'react';
import { generateUsername } from '@/lib/username';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ExternalLink,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  Key,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface AdminUser {
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

interface AdminInvitation {
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
}

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gmail, setGmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success State inside Modal
  const [createdInvite, setCreatedInvite] = useState<{
    inviteLink: string;
    fullName: string;
    email: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchTeamData = async () => {
    try {
      const res = await fetch('/api/admin/team');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleOpenModal = () => {
    setFullName('');
    setGmail('');
    setError(null);
    setCreatedInvite(null);
    setIsModalOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !gmail.trim()) {
      setError('Please fill in both full name and Gmail address.');
      return;
    }

    if (!gmail.includes('@')) {
      setError('Please provide a valid Gmail format (e.g. name@gmail.com).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: gmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedInvite({
          inviteLink: data.inviteLink,
          fullName: fullName.trim(),
          email: gmail.trim(),
        });
        showNotification(`Invitation link generated and 6-digit code dispatched to ${gmail.trim()}`);
        fetchTeamData();
      } else {
        setError(data.error || 'Failed to create invitation.');
      }
    } catch (err) {
      setError('An unexpected network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRevokeInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this pending admin invitation?')) return;
    try {
      const res = await fetch(`/api/admin/team?invitationId=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showNotification('Invitation revoked.');
        fetchTeamData();
      }
    } catch (err) {
      console.error('Error revoking:', err);
    }
  };

  const handleRemoveAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke administrator access for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/team?adminId=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`Administrator access removed for ${name}.`);
        fetchTeamData();
      } else {
        alert(data.error || 'Failed to remove admin.');
      }
    } catch (err) {
      console.error('Error removing admin:', err);
    }
  };

  const previewUsername = fullName ? generateUsername(fullName) : 'username';

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-950 border border-emerald-600 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-gold-400" />
            <span>Admin Team & Privileged Access</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage store administrators, invite colleagues via Gmail, and authenticate access with single-use OTP codes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Admin via Gmail</span>
        </button>
      </div>

      {/* Grid: Active Admins & Pending Invitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Admins (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-xs">
                Active Administrators ({admins.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Full Privileges (Dashboard, Pipeline & Catalog)
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[460px] custom-scrollbar">
            {admins.map((adm) => (
              <div key={adm.id} className="p-4 sm:p-5 hover:bg-slate-900/40 transition flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-800 to-emerald-950 border border-gold-400/40 text-gold-300 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {adm.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-extrabold text-white truncate">{adm.fullName}</h4>
                      <span className="font-mono text-[10px] font-bold text-gold-400 bg-gold-950/60 px-2 py-0.5 rounded border border-gold-800/50">
                        @{adm.username}
                      </span>
                      {adm.isHeadAdmin && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/40 px-1.5 py-0.5 rounded">
                          Head Admin (Founder)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 truncate">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{adm.email}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {!adm.isHeadAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAdmin(adm.id, adm.fullName)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition shrink-0"
                    title="Remove admin privileges"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations & Auth Links (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-xs">
                Pending Gmail Invitations ({invitations.filter(i => i.status === 'PENDING_OTP').length})
              </h3>
            </div>
            <button
              onClick={fetchTeamData}
              title="Refresh invitations"
              className="p-1 text-slate-400 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[460px] custom-scrollbar p-3 space-y-3">
            {invitations.filter(i => i.status === 'PENDING_OTP').length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Mail className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No pending Gmail invitations</p>
                <p className="text-[11px] text-slate-500">
                  Click &ldquo;Add Admin via Gmail&rdquo; to send a verification code and generate a secure activation link.
                </p>
              </div>
            ) : (
              invitations
                .filter((i) => i.status === 'PENDING_OTP')
                .map((inv) => {
                  const inviteUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}/admin/join?token=${inv.inviteToken}`
                    : `/admin/join?token=${inv.inviteToken}`;

                  return (
                    <div
                      key={inv.id}
                      className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">{inv.fullName}</span>
                            <span className="font-mono text-[10px] text-gold-400 font-semibold">
                              @{inv.username}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                            {inv.email}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80 shrink-0">
                          Awaiting OTP
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-300 truncate max-w-[220px]">
                          {inviteUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(inviteUrl)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-gold-300 rounded text-[11px] font-semibold flex items-center gap-1 transition shrink-0 ml-2"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Invited by: {inv.invitedBy}</span>
                        <button
                          type="button"
                          onClick={() => handleRevokeInvitation(inv.id)}
                          className="text-rose-400/80 hover:text-rose-300 font-semibold transition"
                        >
                          Revoke Invite
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Invite New Admin via Gmail */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl custom-scrollbar max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-400/40 flex items-center justify-center font-black">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Add Admin via Gmail</h2>
                  <span className="text-[11px] text-gold-400 font-semibold block">
                    Two-Step Email OTP Authentication
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdInvite ? (
              /* Success Stage: Link & Code Ready */
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 bg-emerald-950/80 border border-emerald-600 text-emerald-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Invitation Created & Verification Code Sent!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-200/90">
                    A 6-digit OTP authentication code was dispatched to <strong>{createdInvite.email}</strong>.
                    Share the activation link below with them to open and verify their administrator privileges.
                  </p>
                </div>

                {/* Direct Invite Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Direct Activation Link:
                  </label>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-white truncate">
                      {createdInvite.inviteLink}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdInvite.inviteLink)}
                      className="px-3 py-1.5 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Email Dispatch Notice */}
                <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-800/80 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Security Verification Sent:
                  </span>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    A single-use 6-digit authentication code has been delivered to <strong>{createdInvite.email}</strong>. The user must provide this code at the activation link to confirm account ownership.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Done & Return to Team
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-950/80 border border-rose-600 text-rose-200 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Andrei Santos"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  {fullName && (
                    <span className="text-[11px] text-gold-400 font-mono mt-1 block">
                      Generated Username: @{previewUsername}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Gmail Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. jasantos@gmail.com"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Must be their active Gmail. A 6-digit OTP authentication code will be sent to this inbox.
                  </span>
                </div>

                <div className="p-3 bg-brand-950/60 rounded-xl border border-brand-800/80 text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                    Security Policy:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Once invited, the user must input their single-use 6-digit OTP code to verify Gmail ownership before their administrator privileges activate.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Send Code & Generate Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
