import { getDb } from '../../../db';
import { affiliates, enquiries, sales, payouts, payoutClaims, programme } from '../../../db/schema';
import { isAdmin, sameOrigin, getProgramme } from '../../server';
import { eq, desc, and } from 'drizzle-orm';
import { commissionFor, safeCheckout, availableSales } from '../../rules';
import { z } from 'zod';
export async function GET() { if (!await isAdmin())
    return Response.json({ error: 'Admin access is not configured for this account.' }, { status: 403 }); const db = getDb(); const [a, e, s, p] = await Promise.all([db.select().from(affiliates).orderBy(desc(affiliates.created)).limit(200), db.select().from(enquiries).orderBy(desc(enquiries.created)).limit(200), db.select().from(sales).orderBy(desc(sales.created)).limit(200), db.select().from(payouts).orderBy(desc(payouts.created)).limit(200)]); return Response.json({ affiliates: a, enquiries: e, sales: s, payouts: p, programme: await getProgramme() }, { headers: { 'Cache-Control': 'private, no-store' } }); }
export async function POST(request: Request) {
    if (!sameOrigin(request) || !await isAdmin())
        return Response.json({ error: 'Admin access required.' }, { status: 403 });
    const raw = await request.json().catch(() => null);
    const body = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null, db = getDb(), now = Date.now();
    try {
        if (body?.action === 'settings') {
            const d = z.object({ selar: z.string().max(1000), nestuge: z.string().max(1000), price: z.number().int().min(100).max(1000000000).nullable(), rate: z.number().int().min(0).max(10000), holdDays: z.number().int().min(0).max(365), minimum: z.number().int().min(100).max(1000000000), live: z.number().int().min(0).max(1) }).parse(body.data);
            d.selar = safeCheckout(d.selar, 'selar.com');
            d.nestuge = safeCheckout(d.nestuge, 'nestuge.com');
            if (d.live && (!d.rate || (!d.selar && !d.nestuge)))
                throw new Error('Set a checkout link and commission rate before opening the programme.');
            const current = await getProgramme();
            if (current.live && (current.rate !== d.rate || current.holdDays !== d.holdDays || current.minimum !== d.minimum))
                throw new Error('Close affiliate applications before changing published terms. Existing sale amounts stay unchanged.');
            await db.insert(programme).values({ id: 'dss', ...d }).onConflictDoUpdate({ target: programme.id, set: d });
            return Response.json({ ok: true });
        }
        if (body?.action === 'affiliate') {
            const b = z.object({ userId: z.string(), status: z.enum(['approved', 'rejected', 'pending']) }).parse(body);
            if (b.status === 'approved' && !(await getProgramme()).live)
                throw new Error('Publish affiliate terms before approving partners.');
            await db.update(affiliates).set({ status: b.status }).where(eq(affiliates.userId, b.userId));
            return Response.json({ ok: true });
        }
        if (body?.action === 'sale') {
            const b = z.object({ code: z.string(), reference: z.string().trim().min(4).max(150), platform: z.enum(['Selar', 'Nestuge']), amount: z.number().int().min(100).max(1000000000), verified: z.literal(true) }).parse(body);
            const a = (await db.select().from(affiliates).where(eq(affiliates.code, b.code)))[0], p = await getProgramme();
            if (a?.status !== 'approved' || !p.live)
                throw new Error('This partner is not eligible.');
            await db.insert(sales).values({ id: crypto.randomUUID(), affiliate: b.code, reference: b.reference, platform: b.platform, amount: b.amount, commission: commissionFor(b.amount, p.rate), status: 'pending', eligible: now + p.holdDays * 86400000, created: now });
            return Response.json({ ok: true });
        }
        if (body?.action === 'refund') {
            const b = z.object({ id: z.string() }).parse(body), s = (await db.select().from(sales).where(eq(sales.id, b.id)))[0];
            if (!s)
                throw new Error('Sale not found.');
            if (s.status === 'paid')
                throw new Error('A paid sale needs a separate settlement adjustment.');
            if (s.status === 'reversed')
                throw new Error('This sale is already reversed.');
            await db.batch([db.insert(payoutClaims).values({ saleId: s.id, payoutId: 'reversal-' + crypto.randomUUID() }), db.update(sales).set({ status: 'reversed' }).where(and(eq(sales.id, b.id), eq(sales.status, 'pending')))]);
            return Response.json({ ok: true });
        }
        if (body?.action === 'payout') {
            const b = z.object({ code: z.string(), reference: z.string().trim().min(4).max(150), verified: z.literal(true) }).parse(body), p = await getProgramme();
            const records = availableSales(await db.select().from(sales).where(eq(sales.affiliate, b.code)), now), total = records.reduce((n, s) => n + s.commission, 0);
            if (!records.length || total < p.minimum)
                throw new Error('The eligible balance is below the payout threshold.');
            const id = crypto.randomUUID();
            await db.batch([db.insert(payouts).values({ id, affiliate: b.code, amount: total, reference: b.reference, created: now }), ...records.map(s => db.insert(payoutClaims).values({ saleId: s.id, payoutId: id })), ...records.map(s => db.update(sales).set({ status: 'paid' }).where(and(eq(sales.id, s.id), eq(sales.status, 'pending'))))]);
            return Response.json({ ok: true });
        }
        throw new Error('Unknown action.');
    }
    catch (e) {
        return Response.json({ error: e instanceof z.ZodError ? 'Check the form fields.' : e instanceof Error ? e.message : String(e) }, { status: 400 });
    }
}
