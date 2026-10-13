import { getDb } from '../../../db';
import { affiliates, clicks, sales, payouts, enquiries } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';
import { sameOrigin } from '../../server';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
export async function GET() { const user = await getChatGPTUser(); if (!user)
    return Response.json({ error: 'Sign in required' }, { status: 401 }); const db = getDb(); const profile = (await db.select().from(affiliates).where(eq(affiliates.userId, user.userId)))[0] ?? null; if (!profile)
    return Response.json({ profile: null, clicks: 0, enquiries: 0, sales: [], payouts: [] }); const [c, e, s, p] = await Promise.all([db.select().from(clicks).where(eq(clicks.affiliate, profile.code)), db.select({ id: enquiries.id }).from(enquiries).where(eq(enquiries.referral, profile.code)), db.select().from(sales).where(eq(sales.affiliate, profile.code)).orderBy(desc(sales.created)), db.select().from(payouts).where(eq(payouts.affiliate, profile.code)).orderBy(desc(payouts.created))]); return Response.json({ profile, clicks: c.length, enquiries: e.length, sales: s, payouts: p }, { headers: { 'Cache-Control': 'private, no-store' } }); }
export async function POST(request: Request) { if (!sameOrigin(request))
    return Response.json({ error: 'Invalid request origin' }, { status: 403 }); const user = await getChatGPTUser(); if (!user)
    return Response.json({ error: 'Sign in required' }, { status: 401 }); const p = z.object({ name: z.string().trim().min(2).max(80), channel: z.string().trim().min(5).max(500), consent: z.literal(true) }).safeParse(await request.json().catch(() => null)); if (!p.success)
    return Response.json({ error: 'Add your name, promotion plan and consent.' }, { status: 400 }); const db = getDb(); if ((await db.select().from(affiliates).where(eq(affiliates.userId, user.userId))).length)
    return Response.json({ error: 'Your application already exists.' }, { status: 409 }); const code = 'DSS-' + crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase(); await db.insert(affiliates).values({ userId: user.userId, code, name: p.data.name, email: user.email, channel: p.data.channel, status: 'pending', created: Date.now() }); return Response.json({ ok: true }); }
