import { requireChatGPTUser } from '../chatgpt-auth';
import { isAdmin } from '../server';
import Admin from '../ui/Admin';
export const dynamic = 'force-dynamic';
export default async function Page() { await requireChatGPTUser('/admin'); if (!await isAdmin())
    return <main className="access-page"><a className="logo" href="/">DSS.</a><div className="eyebrow">OWNER WORKSPACE</div><h1>Admin access needs<br />to be enabled.</h1><p>This account has not been authorised to manage DSS. Enquiries and affiliate applications are saved separately from the public page.</p><a className="button primary" href="/dashboard">Return to partner portal</a></main>; return <Admin />; }
