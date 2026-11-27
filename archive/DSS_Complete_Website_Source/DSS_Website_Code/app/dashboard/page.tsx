import Dashboard from '../ui/Dashboard';
import { requireChatGPTUser } from '../chatgpt-auth';
import { getProgramme, isAdmin } from '../server';
export const dynamic = 'force-dynamic';
export default async function Page() { const user = await requireChatGPTUser('/dashboard'); return <Dashboard name={user.fullName ?? 'DSS partner'} programme={await getProgramme()} admin={await isAdmin()}/>; }
