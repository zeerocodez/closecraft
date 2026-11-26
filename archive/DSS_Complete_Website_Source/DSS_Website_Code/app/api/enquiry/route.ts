import { getDb } from '../../../db';
import { enquiries, affiliates } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';
import { sameOrigin } from '../../server';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
const input = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(254), goal: z.enum(['Business Builder', 'Remote Sales Starter']), referral: z.string().max(40).optional(), consent: z.literal(true), website: z.string().max(0) });
export async function POST(request: Request) {
    if (!sameOrigin(request))
        return Response.json({ error: 'Invalid request origin' }, { status: 403 });
    const user = await getChatGPTUser();
    if (!user)
        return Response.json({ error: 'Please sign in to save your enquiry.' }, { status: 401 });
    const parsed = input.safeParse(await request.json().catch(() => null));
    if (!parsed.success)
        return Response.json({ error: 'Check your name, email and consent.' }, { status: 400 });
    const db = getDb(), now = Date.now();
    if ((await db.select().from(enquiries).where(and(eq(enquiries.userId, user.userId), gt(enquiries.created, now - 60000))).limit(1)).length)
        return Response.json({ error: 'Your recent enquiry is saved. Please wait a minute before sending another.' }, { status: 429 });
    const data = parsed.data;
    let referral: string | null = null;
    if (data.referral) {
        const a = (await db.select().from(affiliates).where(eq(affiliates.code, data.referral)).limit(1))[0];
        if (a?.status === 'approved' && a.userId !== user.userId)
            referral = data.referral;
    }
    await db.insert(enquiries).values({ id: crypto.randomUUID(), userId: user.userId, name: data.name, email: data.email, goal: data.goal, referral, created: now });
    return Response.json({ ok: true });
}
