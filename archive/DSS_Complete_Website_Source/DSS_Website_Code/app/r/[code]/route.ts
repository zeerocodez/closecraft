import { getDb } from '../../../db';
import { affiliates, clicks } from '../../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { validCode } from '../../rules';
import { getChatGPTUser } from '../../chatgpt-auth';
export async function GET(request: Request, { params }: {
    params: Promise<{
        code: string;
    }>;
}) {
    const { code } = await params;
    const origin = new URL(request.url).origin;
    const fallback = () => Response.redirect(origin + '/', 302);
    if (!validCode(code))
        return fallback();
    const db = getDb();
    const a = (await db.select().from(affiliates).where(eq(affiliates.code, code)))[0];
    const user = await getChatGPTUser();
    if (!a || a.status !== 'approved' || user?.userId === a.userId)
        return fallback();
    const existing = (request.headers.get('cookie') ?? '').match(/(?:^|;\s*)dss_visitor=([A-Za-z0-9-]{36})(?:;|$)/)?.[1];
    const visitor = existing ?? crypto.randomUUID();
    const now = Date.now();
    const recent = await db.select().from(clicks).where(and(eq(clicks.affiliate, code), eq(clicks.visitor, visitor), gt(clicks.created, now - 86400000))).limit(1);
    if (!recent.length)
        await db.insert(clicks).values({ id: crypto.randomUUID(), affiliate: code, visitor, created: now });
    const headers = new Headers({ 'Location': origin + '/?ref=' + code, 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', 'dss_visitor=' + visitor + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000');
    return new Response(null, { status: 302, headers });
}
