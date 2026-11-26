'use client';
import { useEffect, useState, FormEvent } from 'react';
import { LayoutDashboard, MousePointer2, Wallet, FolderOpen, UserRound, ArrowUpRight, ArrowRight, ArrowLeft, Copy, Check, Download, TrendingUp, ChevronRight, Link2, RefreshCw, Settings2 } from 'lucide-react';
import { Logo, Action, money } from './shared';
import type { Programme } from '../rules';
type Sale = {
    id: string;
    reference: string;
    platform: string;
    amount: number;
    commission: number;
    status: string;
    eligible: number;
    created: number;
};
type Payout = {
    id: string;
    amount: number;
    reference: string;
    created: number;
};
type Data = {
    profile: null | {
        name: string;
        email: string;
        code: string;
        status: string;
        channel: string;
    };
    clicks: number;
    enquiries: number;
    sales: Sale[];
    payouts: Payout[];
};
const empty: Data = { profile: null, clicks: 0, enquiries: 0, sales: [], payouts: [] };
const demoData: Data = { profile: { name: 'Sample partner', email: 'Example account', code: 'DSS-DEMO', status: 'approved', channel: 'Example campaign' }, clicks: 128, enquiries: 18, sales: Array.from({ length: 6 }, (_, i) => ({ id: 'demo-' + i, reference: 'EXAMPLE-00' + (i + 1), platform: i % 2 ? 'Nestuge' : 'Selar', amount: 5000000, commission: 1500000, status: i < 2 ? 'pending' : 'paid', eligible: Date.now() + (i < 2 ? 86400000 : 0), created: Date.now() - (i + 1) * 86400000 })), payouts: [{ id: 'example-payout', amount: 6000000, reference: 'EXAMPLE-PAYOUT', created: Date.now() - 86400000 }] };
const tabs = [['overview', 'Overview', LayoutDashboard], ['referrals', 'Referrals', MousePointer2], ['payouts', 'Payouts', Wallet], ['toolkit', 'Promotion toolkit', FolderOpen], ['profile', 'My account', UserRound]] as const;
export default function Dashboard({ name, programme: p, admin }: {
    name: string;
    programme: Programme;
    admin: boolean;
}) {
    const [tab, setTab] = useState('overview'), [demo, setDemo] = useState(false), [data, setData] = useState<Data>(empty), [loading, setLoading] = useState(true), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [filter, setFilter] = useState('all'), [copied, setCopied] = useState(false);
    async function load() { setLoading(true); try {
        const r = await fetch('/api/affiliate', { cache: 'no-store' }), j = await r.json() as Data & {
            error?: string;
        };
        if (!r.ok)
            throw new Error(j.error);
        setData(j);
    }
    catch (e) {
        setMessage(e instanceof Error ? e.message : 'Unable to load your account.');
    }
    finally {
        setLoading(false);
    } }
    useEffect(() => { setDemo(new URLSearchParams(location.search).get('demo') === '1'); load(); }, []);
    const d = demo ? demoData : data, valid = d.profile?.status === 'approved', now = Date.now(), sales = d.sales.filter(s => s.status !== 'reversed'), earned = sales.reduce((n, s) => n + s.commission, 0), available = sales.filter(s => s.status === 'pending' && s.eligible <= now).reduce((n, s) => n + s.commission, 0), pending = sales.filter(s => s.status === 'pending' && s.eligible > now).reduce((n, s) => n + s.commission, 0), paid = d.payouts.reduce((n, s) => n + s.amount, 0);
    const link = !demo && valid ? location.origin + '/r/' + d.profile?.code : 'Your link appears after approval';
    async function copy(text: string) { try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    }
    catch {
        setMessage('Copy is unavailable in this browser. Select the text and copy it manually.');
    } }
    function exportCsv() { const rows = [['Reference', 'Platform', 'Sale value NGN', 'Commission NGN', 'Status', 'Date'], ...d.sales.map(s => [s.reference, s.platform, s.amount / 100, s.commission / 100, s.status, new Date(s.created).toISOString()])]; const csv = rows.map(row => row.map(v => '"' + String(v).replace(/^[=+\-@]/, "'").replaceAll('"', '""') + '"').join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = demo ? 'DSS_DEMO_Referrals.csv' : 'DSS_Referrals.csv'; a.click(); URL.revokeObjectURL(a.href); }
    async function apply(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setMessage(''); const f = new FormData(e.currentTarget); try {
        const r = await fetch('/api/affiliate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.get('name'), channel: f.get('channel'), consent: f.get('consent') === 'on' }) }), j = await r.json() as {
            error?: string;
        };
        if (!r.ok)
            throw new Error(j.error);
        setMessage('Application saved. Your status is pending review.');
        await load();
    }
    catch (e) {
        setMessage(e instanceof Error ? e.message : 'Could not save your application.');
    }
    finally {
        setBusy(false);
    } }
    const caption = 'DSS teaches practical digital sales through 16 lessons. Build your offer fact sheet and practise a complete sales conversation. See the programme details: [insert your approved DSS referral link]. Disclosure: I may earn a commission if you buy through my link.';
    return <div className="dashboard-shell"><aside className="sidebar"><Logo /><div className="sidebar-label">PARTNER WORKSPACE</div><nav aria-label="Dashboard">{tabs.map(([id, title, Icon]) => <button className={tab === id ? 'selected' : ''} key={id} onClick={() => { setTab(id); setMessage(''); }}><Icon size={19}/>{title}{tab === id && <ChevronRight size={15}/>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-callout"><span>Make a useful introduction.</span><p>Recommend DSS to people the programme suits.</p><a href="/#affiliates">Read the offer <ArrowUpRight size={15}/></a></div>{admin && <a href="/admin"><Settings2 size={17}/> Manage DSS</a>}<a href="/"><ArrowLeft size={17}/> Back to DSS</a></div></aside>
 <div className="dashboard-main"><header className="dashboard-header"><a href="/" className="dashboard-mobile-logo">DSS<span>.</span></a><div><span className="breadcrumb">Partner portal</span><ChevronRight size={13}/><strong>{tabs.find(t => t[0] === tab)?.[1]}</strong></div><div className="account-chip"><span>{name[0].toUpperCase()}</span><p>{name}<small>Affiliate account</small></p></div></header><div className="dashboard-content">
 <div className="dashboard-title"><div><div className="eyebrow">YOUR DSS WORKSPACE</div><h1>{tab === 'overview' ? 'Every introduction starts here.' : tabs.find(t => t[0] === tab)?.[1]}</h1><p>{tab === 'overview' ? 'See your activity and keep track of eligible commission.' : 'Clear records. Useful tools. A better partner experience.'}</p></div><button className="button secondary compact" onClick={() => setDemo(!demo)}>{demo ? 'My actual account' : 'Preview dashboard'}<ArrowUpRight size={16}/></button></div>
 {demo && <div className="demo-banner"><span className="demo-pill">DEMO MODE</span>Sample activity and amounts for illustration. Nothing here is an actual sale or payout.<button onClick={() => setDemo(false)}>Exit demo</button></div>}
 {!demo && !p.live && <div className="status-banner"><span className="status-dot"/> Affiliate terms are awaiting publication. You can save an application; promotion starts after approval.</div>}
 {message && <div className="form-message" role="status">{message}</div>}
 <div className="dashboard-mobile-tabs">{tabs.map(([id, title]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{title}</button>)}</div>
 {loading && !demo ? <div className="empty-state"><RefreshCw />Loading your account…</div> : <>
 {(tab === 'overview' || tab === 'referrals') && <>
 {tab === 'overview' && <div className="stat-grid">{[[MousePointer2, 'Link visits', String(d.clicks), 'Visits via your approved link'], [TrendingUp, 'Verified sales', String(sales.length), 'Refunds excluded'], [Wallet, 'Commission credited', money(earned), 'Before reversals and settlement'], [Check, 'Payouts recorded', money(paid), 'Completed transfer records']].map(([Icon, label, value, note]) => { const I = Icon as typeof Wallet; return <div className="stat-card" key={String(label)}><div><span>{String(label)}</span><I size={19}/></div><strong>{String(value)}</strong><small>{String(note)}</small></div>; })}</div>}
 <div className="dashboard-columns"><section className="panel activity-panel"><div className="panel-heading"><div><h2>{tab === 'overview' ? 'Referral activity' : 'Your referred sales'}</h2><p>{demo ? 'Illustrative last 7 days' : 'Visits and enquiries from your approved referral link'}</p></div><span className="badge">ACTIVITY</span></div>{tab === 'overview' && (demo ? <div className="activity-chart"><div className="chart-y"><span>40</span><span>20</span><span>0</span></div><div className="chart-bars">{[12, 25, 16, 32, 21, 36, 28].map((n, i) => <div key={i}><div style={{ height: n * 3.1 }}><span>{n}</span></div><label>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</label></div>)}</div></div> : <div className="empty-chart"><MousePointer2 size={28}/><h3>{d.clicks ? d.clicks + ' tracked visits' : 'Your first introduction is ahead.'}</h3><p>{d.enquiries} attributed enquiries. View the verified-sales table below for commission-bearing activity.</p></div>)}<div className="activity-summary"><div><span>Attributed enquiries</span><strong>{d.enquiries}</strong></div><div><span>Verified sales</span><strong>{sales.length}</strong></div><div><span>Sales per tracked visit</span><strong>{d.clicks ? (sales.length / d.clicks * 100).toFixed(1) + '%' : '—'}</strong></div></div></section><section className="panel link-panel"><div className="link-icon"><Link2 size={24}/></div><h2>Your referral link</h2><p>Share it with a relevant audience. Disclose that you may earn a commission.</p><div className="referral-link">{demo ? 'Example link shown after approval' : link}</div><button className="button primary compact" disabled={!valid || demo} onClick={() => copy(link)}>{copied ? 'Copied' : 'Copy my link'}{copied ? <Check size={16}/> : <Copy size={16}/>}</button><a className="text-link" href="#" onClick={e => { e.preventDefault(); setTab('toolkit'); }}>Get promotion resources <ArrowRight size={16}/></a></section></div>
 <section className="panel table-panel"><div className="panel-heading"><div><h2>Sales & commission</h2><p>Credited after payment verification.</p></div><div className="table-actions"><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter sales status"><option value="all">All statuses</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="reversed">Reversed</option></select><button onClick={exportCsv}><Download size={16}/>Export</button></div></div><div className="table-scroll"><table><thead><tr><th>Order reference</th><th>Platform</th><th>Sale value</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead><tbody>{d.sales.filter(s => filter === 'all' || s.status === filter).map(s => <tr key={s.id}><td>{s.reference}</td><td>{s.platform}</td><td>{money(s.amount)}</td><td>{money(s.commission)}</td><td><span className={'sale-status ' + s.status}>{s.status}</span></td><td>{new Date(s.created).toLocaleDateString('en-GB')}</td></tr>)}</tbody></table></div>{!d.sales.filter(s => filter === 'all' || s.status === filter).length && <div className="table-empty">No matching verified sales yet. Visits and enquiries do not create commission.</div>}</section>
 </>}
 {tab === 'payouts' && <><div className="balance-grid"><div className="balance-card"><span>Available commission</span><h2>{money(available)}</h2><p>Cleared and awaiting a recorded payout.</p></div><div className="balance-card"><span>Pending clearance</span><h2>{money(pending)}</h2><p>Subject to payment verification and refunds.</p></div></div><section className="panel"><div className="panel-heading"><div><h2>Payout history</h2><p>These records confirm transfers made separately by DSS.</p></div><Wallet size={22}/></div><div className="table-scroll"><table><thead><tr><th>Transfer reference</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{d.payouts.map(s => <tr key={s.id}><td>{s.reference}</td><td>{money(s.amount)}</td><td>{new Date(s.created).toLocaleDateString('en-GB')}</td><td><span className="sale-status paid">Recorded</span></td></tr>)}</tbody></table></div>{!d.payouts.length && <div className="table-empty">No payouts recorded yet.</div>}<p className="panel-note">{p.live ? p.holdDays + '-day clearance period. Minimum payout ' + money(p.minimum) + '.' : 'Your clearance period and minimum payout will be shown when the programme terms are published.'} This portal records settlements. It does not move money.</p></section></>}
 {tab === 'toolkit' && <div className="toolkit-grid"><section className="panel"><div className="resource-icon"><FileIcon /></div><h2>A message you can adapt</h2><p>Make the wording relevant to your own audience. Keep the referral disclosure.</p><div className="caption">{caption}</div><button className="button secondary compact" onClick={() => copy(caption)}>{copied ? 'Copied' : 'Copy the message'}<Copy size={16}/></button></section><section className="panel toolkit-rules"><FolderOpen size={30}/><h2>Promote responsibly.</h2><ul><li>Describe the actual course materials and practical tasks.</li><li>Use your approved link and disclose your relationship.</li><li>Get permission before using anyone’s results or identity.</li><li>Keep job promises and invented income claims out of your message.</li></ul><a className="text-link" href="/DSS_Sample_Lesson.pdf" target="_blank" rel="noopener">Share the free sample lesson <Download size={17}/></a><a className="text-link" href="/">Review the DSS offer <ArrowUpRight size={17}/></a></section></div>}
 {(tab === 'profile' || (tab === 'overview' && !d.profile)) && <section className="panel application-panel">{d.profile ? <><div className="panel-heading"><div><h2>Your partner profile</h2><p>Your current application and account details.</p></div><span className={'sale-status ' + d.profile.status}>{d.profile.status}</span></div><dl className="profile-grid"><div><dt>Name</dt><dd>{d.profile.name}</dd></div><div><dt>Account email</dt><dd>{d.profile.email}</dd></div><div><dt>Partner code</dt><dd>{d.profile.code}</dd></div><div><dt>Promotion plan</dt><dd>{d.profile.channel}</dd></div></dl>{d.profile.status === 'pending' && <p>Application saved. Your link becomes active only after DSS approval and publication of the programme terms.</p>}</> : <><div className="eyebrow">BECOME A DSS PARTNER</div><h2>Make a useful introduction.</h2><p>Tell DSS how you would recommend the programme. Your application is reviewed before you can promote.</p><form onSubmit={apply}><div className="form-row"><label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label><label>How will you promote DSS?<textarea name="channel" required minLength={5} maxLength={500} placeholder="Describe your audience and the channels you use."/></label></div><label className="checkbox"><input type="checkbox" name="consent" required/>I agree to an application review and will wait for approval and confirmed terms before promoting.</label><button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Apply to the programme'}<ArrowUpRight size={17}/></button></form></>}</section>}
 </>}
 <div className="dashboard-footer"><span>THE DIGITAL SALES SCHOOL</span><a href="/#affiliates">Read programme information <ArrowUpRight size={14}/></a></div>
 </div></div></div>;
}
function FileIcon() { return <Copy size={28}/>; }
