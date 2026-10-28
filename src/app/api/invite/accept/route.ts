import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { acceptWorkspaceInvite } from '@/lib/auth/accessService';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, name, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
    }

    const invite = await db.workspaceInvite.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or missing invitation.' }, { status: 404 });
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ error: 'This invitation has already been accepted.' }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'This invitation link has expired. Please ask your administrator to send a new invite.' }, { status: 400 });
    }

    let userId: string;
    const session = await auth();

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Find or create member account
      let user = await db.user.findUnique({
        where: { email: invite.email.toLowerCase() },
      });

      if (!user) {
        if (!password || typeof password !== 'string' || password.length < 8) {
          return NextResponse.json({ error: 'Please choose a password of at least 8 characters.' }, { status: 400 });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        user = await db.user.create({
          data: {
            email: invite.email.toLowerCase(),
            name: (name && typeof name === 'string' ? name.trim() : null) || invite.email.split('@')[0],
            passwordHash,
            emailVerified: new Date(), // Verified via unique email link
          },
        });
      }
      userId = user.id;
    }

    // Accept invite - enrolls user with invited role into the existing workspace
    const result = await acceptWorkspaceInvite(token, userId);

    return NextResponse.json({
      success: true,
      organizationName: result.organization.name,
      role: result.member.role,
      email: invite.email,
    });
  } catch (error: any) {
    console.error('[Accept Invite Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to accept invitation.' }, { status: 500 });
  }
}
