import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

/**
 * Validates authentication session and returns the verified user.
 */
export async function requireAuth(session: any) {
  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 }),
    };
  }

  return { authorized: true, user: session.user };
}

/**
 * Enforces SUPER_ADMIN access on sensitive system routes.
 */
export async function requireSuperAdmin(session: any) {
  const authRes = await requireAuth(session);
  if (!authRes.authorized) return authRes;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  });

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'OPERATOR' ||
    Boolean(user?.email?.endsWith('@closecrafthq.com') || user?.email?.endsWith('@closecraft.com'));

  if (!isSuperAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden: Super administrator or operator access required' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Enforces strict cron authorization header against CRON_SECRET.
 * Never allows bypass if secret is missing.
 */
export function verifyCronAuth(request: Request): { authorized: boolean; response?: NextResponse } {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.trim().length === 0) {
    console.error('[Cron Security] CRON_SECRET is unconfigured on server. Disallowing public invocation.');
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Server misconfiguration: Cron secret unconfigured.' }, { status: 500 }),
    };
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${secret}`) {
    console.warn('[Cron Security] Unauthorized cron execution attempt rejected.');
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { authorized: true };
}

/**
 * Constant-time string comparison to prevent timing attacks on signatures and tokens.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Enforces tenant isolation: verifies resource organization matches session organization.
 */
export function assertTenantIsolation(
  resourceOrgId: string,
  sessionOrgId: string | null | undefined,
  userRole?: string
): void {
  const isPrivileged = userRole === 'OPERATOR' || userRole === 'SUPER_ADMIN';
  if (!isPrivileged && resourceOrgId !== sessionOrgId) {
    throw new Error('Tenant isolation violation: Access denied to another workspace’s resources.');
  }
}
