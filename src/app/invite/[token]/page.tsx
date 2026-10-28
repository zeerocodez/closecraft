import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import AcceptInviteForm from './AcceptInviteForm';

export default async function InviteAcceptancePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  const invite = await db.workspaceInvite.findUnique({
    where: { token },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      invitedByUser: { select: { name: true, email: true } },
    },
  });

  const session = await auth();

  if (!invite) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-surface">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[24px]">cancel</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2 font-heading">Invalid Invitation</h1>
          <p className="text-xs text-on-surface-variant mb-6">
            This invitation link does not exist or may have been deleted. Please ask your workspace administrator for a new invitation.
          </p>
          <Link href="/login" className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (invite.acceptedAt) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-surface">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2 font-heading">Already Accepted</h1>
          <p className="text-xs text-on-surface-variant mb-6">
            This invitation for <strong>{invite.organization.name}</strong> has already been claimed.
          </p>
          <Link href="/login" className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 inline-block">
            Sign In to Workspace
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > invite.expiresAt;
  if (isExpired) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-surface">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[24px]">hourglass_empty</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2 font-heading">Invitation Expired</h1>
          <p className="text-xs text-on-surface-variant mb-6">
            This invitation expired on {new Date(invite.expiresAt).toLocaleDateString()}. Please request a fresh invitation link.
          </p>
          <Link href="/login" className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-90 inline-block">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-surface">
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
          <span className="text-xs font-mono font-bold text-primary uppercase">Workspace Invitation</span>
          <span className="text-[10px] text-on-surface-variant font-medium">Expires in 7 days</span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[24px]">group_add</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-1 font-heading">Join {invite.organization.name}</h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {invite.invitedByUser?.name || 'A team member'} invited you to collaborate in their sales workspace as <strong className="text-primary">{invite.role.replace(/_/g, ' ')}</strong>.
          </p>
        </div>

        <AcceptInviteForm
          token={token}
          email={invite.email}
          role={invite.role}
          organizationName={invite.organization.name}
          isLoggedIn={!!session?.user}
          currentUserEmail={session?.user?.email || null}
        />
      </div>
    </div>
  );
}
