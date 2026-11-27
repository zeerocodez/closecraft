import { getDb } from '../db';
import { programme } from '../db/schema';
import { defaultProgramme } from './rules';
import { env } from 'cloudflare:workers';
import { getChatGPTUser } from './chatgpt-auth';
export async function getProgramme() { const row = await getDb().select().from(programme).limit(1); return row[0] ?? defaultProgramme; }
export async function isAdmin() { const u = await getChatGPTUser(); const admin = (env as unknown as {
    DSS_ADMIN_EMAIL?: string;
}).DSS_ADMIN_EMAIL; return !!(u && admin && u.email.toLowerCase() === admin.toLowerCase()); }
export function sameOrigin(r: Request) { return r.headers.get('origin') === new URL(r.url).origin; }
