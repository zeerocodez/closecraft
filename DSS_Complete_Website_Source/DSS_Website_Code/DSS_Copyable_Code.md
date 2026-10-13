# DSS landing page and affiliate dashboard code

These are the React/TypeScript and CSS files from the DSS site. Open an individual file to copy it, or use the complete project package. They are not standalone HTML snippets.

## File map

| Purpose | File |
|---|---|
| Landing page interface | app/ui/Landing.tsx |
| Affiliate dashboard interface | app/ui/Dashboard.tsx |
| Shared CSS | app/globals.css |
| Shared logo, buttons and modal | app/ui/shared.tsx |
| Landing page route | app/page.tsx |
| Dashboard route and sign-in | app/dashboard/page.tsx |
| Affiliate records API | app/api/affiliate/route.ts |
| Enrolment enquiry API | app/api/enquiry/route.ts |
| Referral redirect and visit tracking | app/r/[code]/route.ts |
| Admin interface and API | app/ui/Admin.tsx and app/api/admin/route.ts |
| Database tables | db/schema.ts |
| Database migration | drizzle/0000_fancy_shape.sql |

## Use the code

Keep the directory structure intact. The page components import shared components and rules; copying only one page file does not provide a complete application.

This is the Vinext/Sites implementation, using a Cloudflare D1 database and hosted ChatGPT identity. When moving it into an unrelated hosting environment, replace the authentication integration and supply a compatible server/database runtime.

The exported hosting manifest keeps the DB binding but omits the existing live project ID, so a copied project will not accidentally target the published DSS site.

Install dependencies using the included pnpm lockfile. Use Node 22.13 or newer and pnpm 11.25:

    pnpm install --frozen-lockfile
    pnpm exec tsc --noEmit
    node --experimental-strip-types --test tests/rules.test.mjs

A clean copy defaults to the portable local profile. Build with pnpm build. Apply the included D1 migration to the local database before testing database-backed pages, using the generated dist/server/wrangler.json configuration and the .wrangler/state persistence folder. Then run pnpm dev. See the runtime notes in README.md. Production deployment still needs a compatible Cloudflare/Sites environment.

## Configure the actual business

Authorise the owner account using DSS_ADMIN_EMAIL in runtime settings. Add checkout links and the course price in /admin. Publish the affiliate commission terms, then approve partners.

Dashboard demonstration figures are illustrative. The actual account starts with empty records. Selar/Nestuge purchases are verified manually before commission is recorded; payment webhooks and banking transfers are not integrated.

## Complete copyable source

### app/layout.tsx

```tsx
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DSS | Learn to close the deal', description: 'Practical high-ticket closing and digital sales training. Build your sales kit through 16 lessons, with an affiliate programme for approved partners.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) { return <html lang="en"><body>{children}</body></html>; }
```

### app/page.tsx

```tsx
import Landing from './ui/Landing';
import { getProgramme } from './server';
export const dynamic = 'force-dynamic';
export default async function Page() { return <Landing programme={await getProgramme()}/>; }
```

### app/ui/Landing.tsx

```tsx
'use client';
import { useEffect, useState, FormEvent } from 'react';
import { ArrowUpRight, ArrowRight, Check, Menu, X, Headphones, BookOpen, FileText, BarChart3, Target, Mic, ShieldCheck, Download, MoveUpRight, CheckCircle2 } from 'lucide-react';
import { Logo, Action, Modal, money } from './shared';
import type { Programme } from '../rules';
const modules = [
    ['Sales foundations', 'Understand the sales job. Explain the offer without overselling.', 'An offer fact sheet and a 60-second pitch.'],
    ['Buyers & offers', 'Find the people your offer can help and shape a clear offer.', 'A specific buyer profile and an offer outline.'],
    ['Prospecting', 'Research relevant prospects and open useful conversations.', '20 researched prospects and personalised messages.'],
    ['Qualification & appointments', 'Check need and buying readiness before booking the next call.', 'A qualification record and appointment handoff.'],
    ['Discovery & presentation', 'Ask better questions. Present what matters to this buyer.', 'Discovery notes and a relevant solution presentation.'],
    ['Objections & decisions', 'Understand the concern, then ask for a clear decision.', 'An objection response map and a written proposal.'],
    ['Sales operations', 'Track next actions, onboard buyers and check AI drafts.', 'A working pipeline and an onboarding checklist.'],
    ['Applied sales lab', 'Put the work together and practise a complete conversation.', 'A final sales kit and a scored role-play recording.'],
];
export default function Landing({ programme: p }: {
    programme: Programme;
}) {
    const [menu, setMenu] = useState(false), [route, setRoute] = useState('business'), [modal, setModal] = useState(''), [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [deal, setDeal] = useState(250000), [rate, setRate] = useState(10), [referral, setReferral] = useState('');
    useEffect(() => { const r = new URLSearchParams(window.location.search).get('ref'); if (r && /^DSS-[A-F0-9]{12}$/.test(r)) {
        setReferral(r);
        sessionStorage.setItem('dss_ref', r);
    }
    else
        setReferral(sessionStorage.getItem('dss_ref') ?? ''); }, []);
    const enquire = () => { setStatus(''); setModal('enrol'); };
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setStatus(''); const f = new FormData(e.currentTarget); try {
        const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.get('name'), email: f.get('email'), goal: f.get('goal'), consent: f.get('consent') === 'on', website: f.get('website'), referral }) });
        const data = await response.json() as {
            error?: string;
        };
        if (!response.ok) {
            if (response.status === 401)
                setStatus('signin');
            else
                throw new Error(data.error);
        }
        else
            setStatus('success');
    }
    catch (e) {
        setStatus(e instanceof Error ? e.message : 'Unable to save. Please try again.');
    }
    finally {
        setBusy(false);
    } }
    const checkout = p.selar || p.nestuge;
    return <>
 <div className="announcement">THE DIGITAL SALES SCHOOL <span>Learn the skill behind the sale.</span><a href="#programme">Meet the programme <ArrowUpRight size={13}/></a></div>
 <header className="site-header"><div className="wrap nav"><Logo /><nav className={menu ? 'navlinks open' : 'navlinks'} aria-label="Main navigation"><a href="#why" onClick={() => setMenu(false)}>Why closing?</a><a href="#programme" onClick={() => setMenu(false)}>The programme</a><a href="#affiliates" onClick={() => setMenu(false)}>Affiliates</a><a href="/dashboard">Partner dashboard <ArrowUpRight size={14}/></a></nav><button className="nav-cta" onClick={enquire}>Get started <ArrowUpRight size={16}/></button><button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle menu">{menu ? <X /> : <Menu />}</button></div></header>
 <main>
 <section className="hero wrap">
  <div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> HIGH-TICKET CLOSING. REAL PRACTICE.</div><h1>Great offers<br />need great<br /><span>closers.</span><svg viewBox="0 0 270 16" aria-hidden="true"><path d="M2 12Q126-3 265 6" fill="none" stroke="currentColor" strokeWidth="5"/></svg></h1><p className="hero-description">You can build a brilliant product and still struggle to sell it. Learn to lead the conversation that turns a suitable buyer’s interest into a clear decision.</p><div className="hero-actions"><Action onClick={enquire}>Build your closing skill</Action><a href="/DSS_Sample_Lesson.pdf" className="text-link" target="_blank" rel="noopener">Try a free lesson <Download size={17}/></a></div><div className="hero-footnote"><CheckCircle2 size={17}/> Beginner friendly <span>•</span> Built around practical work</div></div>
  <div className="hero-art" aria-label="Preview of the DSS materials and a sales practice conversation"><div className="art-top"><span className="tiny-tag">THE SKILL BEHIND THE SALE</span><MoveUpRight size={42}/></div><div className="course-book"><div className="book-spine"/><div className="book-face"><div className="book-mark">DSS<span>.</span></div><span className="book-kicker">THE DIGITAL SALES SCHOOL</span><h2>Own the<br />conversation.<br /><em>Close the deal.</em></h2><div className="book-lines"><span /><span /><span /><span /></div><div className="book-bottom">PRACTICAL DIGITAL SALES<br /><b>EMMANUEL EFFIONG</b></div></div></div><div className="call-card"><div className="call-icon"><Headphones size={20}/></div><div><strong>“Let’s understand what you need.”</strong><span>Discovery comes before the pitch.</span></div><div className="sound-bars"><i /><i /><i /><i /><i /></div></div><div className="art-caption"><span>YOUR NEXT SKILL STARTS HERE</span><span>01 / DSS</span></div></div>
 </section>
 <div className="course-strip"><div className="wrap strip-inner"><div><strong>08</strong><span>Focused modules</span></div><div><strong>16</strong><span>Practical lessons</span></div><div><strong>30</strong><span>Day learning plan</span></div><div className="strip-note"><Mic size={26}/><span>Learn it.<br /><b>Then practise it.</b></span></div></div></div>
 <section className="section wrap problem" id="why"><div><div className="eyebrow">THE GAP DSS HELPS YOU CLOSE</div><h2>You have the offer.<br />Can you close<br /><span className="orange">the conversation?</span></h2></div><div className="problem-body"><p>A prospect asks for your price. You send it. They say, “I’ll get back to you.” Then nothing.</p><p>What happened before that moment matters. Did you understand the problem? Establish fit? Make the value clear? DSS helps you work through that conversation, so you can see where a sale moves forward and where it gets stuck.</p><div className="problem-line"><span>01</span><div><strong>For your own business</strong><p>Sell your offer with a clearer process and a pipeline you can act on.</p></div></div><div className="problem-line"><span>02</span><div><strong>For a remote sales path</strong><p>Prepare honest work samples that show how you qualify buyers and handle sales calls.</p></div></div></div></section>
 <section className="dark-section"><div className="wrap section"><div className="section-heading"><div><div className="eyebrow">HIGH-TICKET CLOSING, EXPLAINED</div><h2>A bigger price needs<br />a better conversation.</h2></div><p>High-ticket closing means helping a suitable buyer decide on a higher-value offer. You need to understand the offer’s limits as well as its value.</p></div><div className="closing-grid"><div className="closing-step"><Target /><span>UNDERSTAND THE BUYER</span><h3>Find the real need.</h3><p>Ask what needs to change and how the buyer will evaluate a solution.</p></div><div className="closing-step"><Headphones /><span>HANDLE THE CONCERN</span><h3>Listen before you answer.</h3><p>Use questions to uncover what “too expensive” or “not now” actually means.</p></div><div className="closing-step"><ShieldCheck /><span>SUPPORT THE DECISION</span><h3>Make the next step clear.</h3><p>Explain the terms, ask for a decision and record what you agreed.</p></div><div className="closing-step calculator"><span>UNDERSTAND COMMISSION</span><h3>Work out the numbers.</h3><label>Example deal value <strong>{money(deal * 100)}</strong><input type="range" min="50000" max="1000000" step="50000" value={deal} onChange={e => setDeal(Number(e.target.value))}/></label><label>Example commission <strong>{rate}%</strong><input type="range" min="5" max="30" value={rate} onChange={e => setRate(Number(e.target.value))}/></label><div className="calculator-result">{money(deal * rate)}<span>Illustrative commission on one paid deal</span></div><small>A calculation, not an earnings forecast or DSS affiliate rate. Actual terms depend on completed sales.</small></div></div></div></section>
 <section className="section wrap" id="programme"><div className="section-heading"><div><div className="eyebrow">THE DSS PRACTICAL PROGRAMME</div><h2>30 days. A sales kit<br />you can actually use.</h2></div><p>Work through the lessons, complete the worksheets and practise with a partner. Keep evidence of what you can do.</p></div><div className="route-switch" role="group" aria-label="Choose your learning route"><button className={route === 'business' ? 'active' : ''} onClick={() => setRoute('business')}>I sell my own offer</button><button className={route === 'remote' ? 'active' : ''} onClick={() => setRoute('remote')}>I want a remote sales path</button></div><div className="route-output"><ArrowRight size={20}/><p>{route === 'business' ? 'Your outcome: an offer fact sheet, researched prospects and a sales kit for your own business.' : 'Your outcome: an honest entry-level portfolio with research samples, handoff notes and a recorded practice conversation.'}</p></div><div className="curriculum">{modules.map((m, i) => <details key={m[0]} open={i === 0 ? true : undefined}><summary><span className="module-number">{String(i + 1).padStart(2, '0')}</span><div><h3>{m[0]}</h3><span>LESSONS {i * 2 + 1} & {i * 2 + 2}</span></div><span className="expand">+</span></summary><div className="module-content"><p>{m[1]}</p><div><Check size={18}/><strong>Your practical output:</strong> {m[2]}</div></div></details>)}</div></section>
 <section className="materials-section"><div className="wrap section materials-grid"><div><div className="eyebrow">MORE THAN SOMETHING TO READ</div><h2>Open the lesson.<br />Do the work.</h2><p>Every lesson gives you a task. You’ll finish with a complete project and a clear view of what still needs practice.</p><a href="/DSS_Sample_Lesson.pdf" target="_blank" rel="noopener" className="text-link">Download a sample lesson <ArrowUpRight size={18}/></a></div><div className="materials-list">{[[BookOpen, 'Student handbook', 'Clear explanations to follow at your own pace.'], [FileText, 'Practical workbook', 'Worksheets that turn the lesson into usable work.'], [BarChart3, 'Pipeline tracker', 'Record prospects, buyer responses and your next actions.'], [Mic, 'Role plays & assessment', 'Practise a full conversation and score it against the rubric.']].map(([Icon, t, d]) => { const I = Icon as typeof BookOpen; return <div className="material" key={String(t)}><I size={23}/><div><h3>{String(t)}</h3><p>{String(d)}</p></div></div>; })}</div></div></section>
 <section className="section wrap practice"><div className="section-heading"><div><div className="eyebrow">A TASTE OF THE PRACTICE</div><h2>When the buyer says<br />“it’s expensive”.</h2></div><p>Before you reach for a discount, find out what the concern means in this situation.</p></div><div className="practice-grid"><div className="buyer-speech"><span>THE BUYER</span><h3>“I like what you’re offering.<br />But it’s expensive.”</h3><div className="speech-footer">A practice prompt from your sales conversation.</div></div><div className="seller-speech"><span>A QUESTION TO ADAPT</span><h3>“When you say expensive, is the concern the budget available or whether the value justifies the price?”</h3><p>Use the answer to explore fit and decision conditions. A useful question gives you more to work with than a rehearsed argument.</p></div></div></section>
 <section className="affiliate-section" id="affiliates"><div className="wrap section affiliate-grid"><div><div className="eyebrow">THE DSS AFFILIATE PROGRAMME</div><h2>Know someone<br />who needs this skill?<br /><span>Make the introduction.</span></h2><p>Recommend DSS to people the programme suits. Approved partners receive a referral link and can follow their attributed activity in the partner dashboard.</p><div className="affiliate-points"><div><Check /> Apply and agree the programme terms.</div><div><Check /> Share your link with a relevant audience.</div><div><Check /> Earn commission on verified eligible sales.</div><div><Check /> Track your balance and recorded payouts.</div></div><Action href="/dashboard">Explore the affiliate portal</Action><p className="small-note">{p.live ? (p.rate / 100) + '% commission. ' + p.holdDays + '-day clearance period. Minimum payout ' + money(p.minimum) + '.' : 'Affiliate terms will be shared before partners are approved to promote. Applications do not create a right to commission.'}</p></div><a className="dashboard-teaser" href="/dashboard?demo=1" aria-label="Open an illustrative affiliate dashboard"><div className="teaser-top"><span>DSS PARTNER PORTAL</span><span className="demo-pill">DEMO</span></div><div className="teaser-title">Your referrals.<br />A clearer picture.</div><div className="teaser-stats"><div><span>Link visits</span><b>128</b></div><div><span>Verified sales</span><b>06</b></div></div><div className="teaser-chart">{[22, 35, 27, 53, 39, 70, 55, 89, 77, 96].map((n, i) => <i key={i} style={{ height: n + '%' }}/>)}</div><div className="teaser-bottom"><span>Illustrative activity. No real earnings shown.</span><ArrowUpRight size={24}/></div></a></div></section>
 <section className="section wrap founder"><div className="founder-mark">EE<span>Emmanuel Effiong</span></div><div><div className="eyebrow">MEET YOUR COURSE CREATOR</div><h2>Built around the work<br />a seller has to do.</h2><p>DSS is created by Emmanuel Effiong for people who want a practical bridge between having an offer and knowing how to sell it. You’ll use your own offer or a clearly labelled simulation, so the work stays relevant to your starting point.</p><p className="founder-signature">Emmanuel Effiong <span>Creator, The Digital Sales School</span></p></div></section>
 <section className="offer-section" id="enrol"><div className="wrap offer-inner"><div><div className="eyebrow">PUT THE SKILL TO WORK</div><h2>Your next sales call<br />deserves better<br /><span>preparation.</span></h2><p>Start with the programme details. See what’s included and choose the learning route that fits your goal.</p></div><div className="offer-card"><div className="offer-label">DSS PRACTICAL DIGITAL SALES</div><h3>High-ticket closing.<br />A practical starting point.</h3><ul><li><Check /> 8 modules and 16 lessons</li><li><Check /> Student handbook and practical workbook</li><li><Check /> Pipeline tracker and sales templates</li><li><Check /> Final project with a scored practice call</li></ul>{p.price ? <div className="offer-price">{money(p.price)}<span>Check the final price and purchase terms at checkout.</span></div> : <p className="offer-detail">Get the current enrolment details before you commit.</p>}{checkout ? <Action href={checkout}>Enrol in DSS</Action> : <Action onClick={enquire}>Get enrolment details</Action>}{p.selar && p.nestuge && <a href={p.nestuge} className="text-link">Prefer Nestuge? Continue here <ArrowUpRight size={15}/></a>}<small>Digital learning materials. Self-study completion depends on the required practical work. Income and employment are not guaranteed.</small></div></div></section>
 <section className="section wrap faq"><div><div className="eyebrow">BEFORE YOU START</div><h2>Your questions,<br />answered.</h2></div><div>{[
            ['Do I need sales experience?', 'You can start as a beginner. The first lessons cover offer knowledge and the sales job. Be willing to complete the assignments and practise with a partner.'],
            ['Is this only for people looking for remote jobs?', 'No. Choose the Business Builder route if you sell your own offer. Choose Remote Sales Starter if you want to prepare entry-level sales work samples. Both routes use the same core lessons.'],
            ['Will I get a job or earn a fixed amount?', 'The programme helps you develop skills and evidence of your work. It does not guarantee a role, client or income. Hiring and internship decisions remain separate.'],
            ['What do I need to take part?', 'A device for reading the materials, access to the tracker and a way to record a practice call. You also need a partner for role play and either an authorised offer or a labelled simulation.'],
            ['What does completion involve?', 'Complete the final-project evidence, reach at least 8 out of 10 on the knowledge check and 12 out of 16 on the practice rubric, and correct any critical failure. A separately assessed review requires an authorised reviewer.'],
            ['How does the affiliate programme work?', 'Apply through the partner portal. After approval and agreement on the current terms, share your referral link. Verified eligible sales are credited to your account; refunded sales can reverse commission. Visits and enquiries alone do not earn commission.'],
            ['Where do I pay and get my materials?', 'DSS is intended for delivery through Selar and Nestuge. Use the available checkout button or request the current enrolment details. Read the access and refund terms on the checkout page before paying.'],
        ].map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
 </main>
 <footer className="footer"><div className="wrap"><div className="footer-top"><Logo dark/><p>The skill behind the sale.</p><a href="/dashboard">Affiliate dashboard <ArrowUpRight size={17}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} The Digital Sales School. Created by Emmanuel Effiong.</span><div><button onClick={() => setModal('privacy')}>Privacy</button><button onClick={() => setModal('terms')}>Programme terms</button><a href="#enrol">Enrolment</a></div></div></div></footer>
 <div className="mobile-sticky"><span>Build your closing skill.</span><button onClick={enquire}>Get started <ArrowUpRight size={16}/></button></div>
 <Modal open={!!modal} onClose={() => setModal('')} title={modal === 'enrol' ? 'Start with the details.' : modal === 'privacy' ? 'Your information.' : 'Know what you’re joining.'}>
 {modal === 'enrol' ? (status === 'success' ? <div className="success-panel"><CheckCircle2 size={44}/><h3>Your enquiry is saved.</h3><p>DSS can review your learning goal and contact details. This is an enquiry, not a paid registration.</p><Action href="/DSS_Sample_Lesson.pdf">Read your free lesson</Action></div> : <form onSubmit={submit}><p>Tell us where you want to use the skill. No payment is taken on this form.</p><label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label><label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email"/></label><label>Your learning goal<select name="goal" defaultValue={route === 'business' ? 'Business Builder' : 'Remote Sales Starter'}><option>Business Builder</option><option>Remote Sales Starter</option></select></label><label className="trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><label className="checkbox"><input name="consent" type="checkbox" required/>I agree that DSS can use these details to review and respond to my enquiry.</label>{status === 'signin' ? <p className="form-message"><a href={'/signin-with-chatgpt?return_to=' + encodeURIComponent('/?ref=' + referral + '#enrol')} target="_top">Sign in to save your enquiry <ArrowUpRight size={15}/></a></p> : status && <p className="form-message" role="alert">{status}</p>}<button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Save my enquiry'}<ArrowUpRight size={18}/></button><small>We don’t add you to promotional mailing lists from this form.</small></form>) : modal === 'privacy' ? <div className="legal"><p>We store enquiry details and affiliate profiles so DSS can review requests and manage referrals. Account access uses ChatGPT sign-in.</p><p>Your affiliate records are shown only to your account and authorised DSS administrators.</p><p>Approved referral links use a visitor cookie for 30 days to reduce repeat visit counts. Referral attribution is retained for the browsing session and attached to an enquiry when the link is used.</p><p>To request correction or deletion, contact DSS through your purchase platform. Financial records may need to be retained for settlement.</p></div> : <div className="legal"><p>DSS provides digital self-study materials and practical tasks. An enquiry does not confirm payment or course access. Review purchase and refund terms on the chosen checkout platform.</p><p>Completion requires the stated project evidence and pass standard. Self-study completion is separate from a reviewed assessment. No job, internship or earnings amount is guaranteed.</p><p>Affiliate approval and current commission terms are required before promotion. Use accurate claims and disclose your referral relationship. No spam, self-referrals or misleading earnings promises.</p><p>{p.live ? 'The affiliate rate is ' + p.rate / 100 + '%. Sales clear after ' + p.holdDays + ' days, subject to payment verification and refunds. The minimum recorded payout is ' + money(p.minimum) + '.' : 'The affiliate programme is accepting expressions of interest. Commission and settlement terms must be confirmed before partners are approved.'}</p><p>Commission is credited after a qualifying purchase is verified. Reversed payments remove unpaid commission. Payout history records completed transfers; this site does not transfer money.</p></div>}
 </Modal>
 </>;
}
```

### app/dashboard/page.tsx

```tsx
import Dashboard from '../ui/Dashboard';
import { requireChatGPTUser } from '../chatgpt-auth';
import { getProgramme, isAdmin } from '../server';
export const dynamic = 'force-dynamic';
export default async function Page() { const user = await requireChatGPTUser('/dashboard'); return <Dashboard name={user.fullName ?? 'DSS partner'} programme={await getProgramme()} admin={await isAdmin()}/>; }
```

### app/ui/Dashboard.tsx

```tsx
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
```

### app/ui/shared.tsx

```tsx
'use client';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
export function Logo({ dark = false }: {
    dark?: boolean;
}) { return <a href="/" className={'logo ' + (dark ? 'light' : '')} aria-label="DSS home"><svg width="33" height="33" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M7.3 32.7L32.7 7.3" stroke="currentColor" strokeWidth="6"/></svg><span>DSS<span className="logo-dot">.</span></span></a>; }
export function Action({ children, onClick, href, secondary = false }: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    secondary?: boolean;
}) { const c = 'button ' + (secondary ? 'secondary' : 'primary'); return href ? <a className={c} href={href}>{children}<ArrowUpRight size={18}/></a> : <button className={c} onClick={onClick}>{children}<ArrowUpRight size={18}/></button>; }
export function Modal({ open, onClose, title, children }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) { const ref = useRef<HTMLDialogElement>(null); useEffect(() => { const el = ref.current; if (open && !el?.open)
    el?.showModal(); if (!open && el?.open)
    el.close(); }, [open]); return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e => { if (e.target === ref.current)
    onClose(); }} aria-labelledby="modal-title"><button className="close-modal" onClick={onClose} aria-label="Close dialog">×</button><div className="eyebrow">THE DIGITAL SALES SCHOOL</div><h2 id="modal-title">{title}</h2>{children}</dialog>; }
export const money = (kobo: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
```

### app/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
  --ink:#172324;
  --orange:#ee5b32;
  --paper:#fffefa;
  --cream:#f4f0e8;
  --muted:#626c69;
  --line:#dddeda;
  --green:#275c48;
  --peach:#f4d9ca
}
* {
  box-sizing:border-box
}
html {
  scroll-behavior:smooth;
  scroll-padding-top:90px
}
body {
  margin:0;
  background:var(--paper);
  color:var(--ink);
  font-family:'DM Sans',Arial,sans-serif;
  font-size:16px;
  -webkit-font-smoothing:antialiased
}
h1,h2,h3,p {
  margin:0
}
h1,h2,h3 {
  font-family:Manrope,Arial,sans-serif;
  font-weight:800
}
h2 {
  font-size:48px;
  line-height:1.16;
  letter-spacing:-2px
}
h3 {
  line-height:1.3
}
p {
  line-height:1.7;
  color:var(--muted)
}
a {
  color:inherit;
  text-decoration:none
}
button,input,select,textarea {
  font:inherit
}
button {
  cursor:pointer
}
button:disabled {
  opacity:.45;
  cursor:not-allowed
}
a,button,input,summary {
  touch-action:manipulation
}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible {
  outline:3px solid var(--orange);
  outline-offset:4px
}
svg {
  flex-shrink:0
}
a,button {
  transition:background .18s,color .18s,transform .18s
}
.wrap {
  width:min(1180px,calc(100% - 80px));
  margin:auto
}
.section {
  padding-top:108px;
  padding-bottom:108px
}
.eyebrow {
  font-size:11px;
  font-weight:700;
  letter-spacing:1.5px;
  line-height:1.7;
  margin-bottom:24px;
  display:flex;
  align-items:center;
  gap:9px
}
.orange {
  color:var(--orange)
}
.button {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:28px;
  padding:18px 24px;
  min-height:56px;
  font-weight:700;
  font-size:14px;
  border:1px solid transparent;
  border-radius:6px;
  line-height:1.2
}
.button.primary {
  background:var(--orange);
  color:white
}
.button.primary:hover {
  background:#d84c26;
  transform:translateY(-2px)
}
.button.secondary {
  background:transparent;
  border-color:var(--line)
}
.button.secondary:hover {
  background:var(--cream)
}
.button.compact {
  padding:12px 16px;
  min-height:44px;
  gap:15px
}
.text-link {
  display:inline-flex;
  align-items:center;
  gap:12px;
  font-size:14px;
  font-weight:700
}
.text-link:hover {
  color:var(--orange)
}
.logo {
  display:inline-flex;
  gap:11px;
  align-items:center;
  font-size:31px;
  font-weight:800;
  letter-spacing:-1.6px;
  line-height:1
}
.logo svg,.logo-dot {
  color:var(--orange)
}
.logo.light {
  color:white
}
.announcement {
  background:var(--ink);
  color:white;
  padding:11px 40px;
  display:flex;
  justify-content:center;
  gap:22px;
  align-items:center;
  font-size:10px;
  font-weight:700;
  letter-spacing:1.2px
}
.announcement span {
  font-weight:400;
  color:#bfc7c1;
  letter-spacing:0;
  font-size:12px
}
.announcement a {
  display:flex;
  align-items:center;
  gap:4px;
  color:#f8ae8d;
  letter-spacing:0
}
.site-header {
  position:sticky;
  top:0;
  z-index:20;
  background:rgba(255,254,250,.96);
  border-bottom:1px solid var(--line);
  backdrop-filter:blur(12px)
}
.nav {
  height:88px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:30px
}
.navlinks {
  display:flex;
  gap:27px;
  font-size:13px;
  align-items:center
}
.navlinks a {
  display:flex;
  gap:5px;
  align-items:center
}
.navlinks a:hover {
  color:var(--orange)
}
.nav-cta {
  border:1px solid var(--ink);
  border-radius:5px;
  padding:12px 18px;
  display:flex;
  gap:20px;
  background:none;
  font-size:13px;
  font-weight:700
}
.nav-cta:hover {
  background:var(--ink);
  color:white
}
.menu-button {
  display:none
}
.hero {
  display:grid;
  grid-template-columns:1.06fr 1fr;
  gap:64px;
  padding-top:64px;
  padding-bottom:74px;
  align-items:center
}
.hero .eyebrow {
  font-size:10px;
  letter-spacing:1.1px;
  margin-bottom:21px
}
.pulse-dot {
  width:6px;
  height:6px;
  display:inline-block;
  background:var(--orange);
  border-radius:50%
}
.hero h1 {
  font-size:88px;
  line-height:1.03;
  letter-spacing:-5px;
  position:relative
}
.hero h1 span {
  color:var(--orange)
}
.hero h1 svg {
  display:block;
  width:260px;
  height:17px;
  margin-top:5px;
  color:var(--orange)
}
.hero-description {
  margin:27px 0;
  max-width:460px;
  font-size:17px;
  line-height:1.7
}
.hero-actions {
  display:flex;
  gap:24px;
  align-items:center;
  flex-wrap:wrap
}
.hero-footnote {
  font-size:11px;
  color:var(--muted);
  display:flex;
  gap:9px;
  align-items:center;
  margin-top:23px
}
.hero-footnote svg {
  color:var(--green)
}
.hero-art {
  position:relative;
  height:554px;
  border-radius:12px;
  background:var(--peach);
  padding:26px;
  overflow:hidden
}
.hero-art:before {
  content:'';
  position:absolute;
  inset:100px -120px -210px 25px;
  border:1px solid #d59e84;
  border-radius:50%;
  transform:rotate(-22deg)
}
.hero-art:after {
  content:'';
  position:absolute;
  inset:60px -180px -240px -20px;
  border:1px solid #d59e8470;
  border-radius:50%;
  transform:rotate(-22deg)
}
.art-top {
  display:flex;
  justify-content:space-between;
  align-items:center;
  position:relative;
  z-index:1
}
.tiny-tag {
  font-size:9px;
  letter-spacing:1.2px;
  font-weight:700;
  border:1px solid #ca9e88;
  padding:9px;
  border-radius:4px
}
.course-book {
  position:absolute;
  top:104px;
  left:21%;
  width:61%;
  height:354px;
  transform:rotate(-7deg);
  z-index:2;
  filter:drop-shadow(15px 20px 14px #87512c40)
}
.book-face {
  height:100%;
  padding:24px 27px;
  background:var(--ink);
  color:white;
  position:relative;
  overflow:hidden;
  border-radius:3px 7px 7px 3px;
  border-left:1px solid #56746a
}
.book-spine {
  position:absolute;
  left:-16px;
  top:5px;
  bottom:-1px;
  width:17px;
  background:#0d1616;
  transform:skewY(-30deg);
  border-radius:3px 0 0 3px
}
.book-mark {
  font-weight:800;
  font-size:31px;
  letter-spacing:-2px
}
.book-mark span {
  color:var(--orange)
}
.book-kicker {
  display:block;
  font-size:6px;
  letter-spacing:1.3px;
  margin-top:21px;
  color:#c5cbc3
}
.book-face h2 {
  font-size:29px;
  line-height:1.17;
  letter-spacing:-1.5px;
  margin-top:9px
}
.book-face h2 em {
  font-style:normal;
  color:#f5a783
}
.book-lines {
  display:flex;
  gap:12px;
  position:absolute;
  bottom:70px;
  right:-60px;
  transform:rotate(-26deg)
}
.book-lines span {
  display:block;
  width:200px;
  height:13px;
  border-top:1px solid #ba5d3c
}
.book-bottom {
  position:absolute;
  bottom:21px;
  font-size:6px;
  letter-spacing:1px;
  line-height:1.8
}
.book-bottom b {
  color:#c4cdc6;
  font-size:7px
}
.call-card {
  position:absolute;
  left:21px;
  right:21px;
  bottom:64px;
  z-index:4;
  background:white;
  box-shadow:0 12px 25px #5a352b10;
  display:flex;
  align-items:center;
  gap:13px;
  padding:18px;
  border-radius:7px
}
.call-card strong {
  font-size:11px;
  display:block
}
.call-card span {
  display:block;
  font-size:9px;
  color:var(--muted);
  margin-top:5px
}
.call-icon {
  background:#e9f0e8;
  color:var(--green);
  border-radius:50%;
  padding:11px;
  display:flex
}
.sound-bars {
  display:flex;
  gap:3px;
  margin-left:auto;
  align-items:center
}
.sound-bars i {
  width:3px;
  background:var(--orange);
  height:12px;
  border-radius:2px
}
.sound-bars i:nth-child(even) {
  height:23px
}
.sound-bars i:nth-child(3) {
  height:31px
}
.art-caption {
  position:absolute;
  bottom:24px;
  left:26px;
  right:26px;
  display:flex;
  justify-content:space-between;
  font-size:8px;
  letter-spacing:1px;
  z-index:4
}
.course-strip {
  border-block:1px solid var(--line);
  background:var(--cream)
}
.strip-inner {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  padding:28px 0
}
.strip-inner>div {
  display:flex;
  align-items:center;
  gap:17px;
  padding-left:32px;
  border-left:1px solid #d7d5ce
}
.strip-inner>div:first-child {
  padding-left:0;
  border:0
}
.strip-inner strong {
  font-size:35px;
  letter-spacing:-1px
}
.strip-inner span {
  font-size:12px;
  color:var(--muted)
}
.strip-inner .strip-note {
  gap:16px
}
.strip-note span {
  line-height:1.6
}
.strip-note b {
  color:var(--ink)
}
.problem {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:95px
}
.problem-body>p:first-child {
  color:var(--ink);
  font-size:21px;
  line-height:1.5;
  margin-bottom:23px
}
.problem-body>p {
  font-size:15px
}
.problem-line {
  display:flex;
  gap:22px;
  border-top:1px solid var(--line);
  padding-top:20px;
  margin-top:27px
}
.problem-line>span {
  color:var(--orange);
  font-size:12px;
  font-weight:700
}
.problem-line strong {
  font-size:15px
}
.problem-line p {
  font-size:13px;
  margin-top:7px
}
.dark-section {
  background:var(--ink);
  color:white
}
.dark-section p {
  color:#bfc7c2
}
.dark-section .eyebrow {
  color:#f3a382
}
.section-heading {
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:80px;
  margin-bottom:44px
}
.section-heading>p {
  width:330px;
  flex-shrink:0;
  font-size:15px
}
.closing-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0
}
.closing-step {
  padding:35px;
  border:1px solid #3b4541;
  margin:0 -1px -1px 0;
  min-height:235px
}
.closing-step>svg {
  color:#f29b75;
  width:28px;
  height:28px;
  margin-bottom:27px
}
.closing-step>span {
  display:block;
  font-size:9px;
  letter-spacing:1.2px;
  color:#d3d8d0;
  margin-bottom:12px
}
.closing-step h3 {
  font-size:25px;
  letter-spacing:-.7px;
  margin-bottom:13px
}
.closing-step p {
  font-size:14px;
  max-width:400px
}
.calculator {
  background:#253431
}
.calculator label {
  font-size:11px;
  font-weight:400;
  display:block;
  margin:18px 0 0
}
.calculator label strong {
  float:right;
  font-size:13px
}
.calculator input[type=range] {
  display:block;
  width:100%;
  height:4px;
  margin:16px 0 5px;
  accent-color:var(--orange);
  padding:0
}
.calculator-result {
  font-size:29px;
  font-weight:800;
  margin-top:24px
}
.calculator-result span {
  display:block;
  font-size:10px;
  font-weight:400;
  color:#c5cec6;
  margin-top:6px
}
.calculator small {
  font-size:10px;
  color:#bec9c0;
  line-height:1.5;
  display:block;
  margin-top:15px;
  max-width:400px
}
.route-switch {
  display:inline-flex;
  padding:5px;
  background:var(--cream);
  border-radius:8px
}
.route-switch button {
  border:0;
  border-radius:5px;
  padding:13px 20px;
  background:none;
  color:var(--muted);
  font-size:12px;
  font-weight:700
}
.route-switch button.active {
  background:white;
  color:var(--ink);
  box-shadow:0 2px 9px #1e342211
}
.route-output {
  display:flex;
  gap:13px;
  margin:20px 0 33px;
  align-items:flex-start;
  font-size:13px;
  max-width:800px
}
.route-output svg {
  color:var(--orange);
  margin-top:2px
}
.curriculum {
  border-top:1px solid var(--line)
}
.curriculum details {
  border-bottom:1px solid var(--line)
}
summary {
  cursor:pointer;
  list-style:none
}
summary::-webkit-details-marker {
  display:none
}
.curriculum summary {
  padding:24px 10px;
  display:flex;
  gap:26px;
  align-items:center
}
.module-number {
  font-size:18px;
  color:#88918b;
  width:32px
}
.curriculum h3 {
  font-size:20px;
  letter-spacing:-.5px
}
.curriculum summary div>span {
  font-size:8px;
  letter-spacing:1px;
  display:block;
  margin-top:7px;
  color:var(--muted)
}
.expand {
  margin-left:auto;
  font-size:25px;
  font-weight:400
}
.curriculum details[open] .expand {
  transform:rotate(45deg)
}
.module-content {
  padding:0 42px 27px 68px;
  font-size:14px
}
.module-content>div {
  display:flex;
  align-items:center;
  gap:7px;
  flex-wrap:wrap;
  margin-top:14px;
  color:var(--green);
  font-size:12px
}
.materials-section {
  background:var(--cream)
}
.materials-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:110px
}
.materials-grid>div>p {
  margin:24px 0;
  font-size:15px;
  max-width:390px
}
.material {
  display:flex;
  gap:24px;
  padding:22px 0;
  border-bottom:1px solid #d5d9d0
}
.material:first-child {
  padding-top:0
}
.material svg {
  color:var(--orange);
  margin-top:4px
}
.material h3 {
  font-size:17px
}
.material p {
  font-size:13px;
  line-height:1.6;
  margin-top:8px
}
.practice-grid {
  display:grid;
  grid-template-columns:1fr 1.1fr;
  gap:28px
}
.buyer-speech {
  background:#eee8de;
  border-radius:8px;
  padding:40px
}
.buyer-speech>span,.seller-speech>span {
  font-size:9px;
  letter-spacing:1px;
  font-weight:700
}
.buyer-speech h3 {
  font-size:27px;
  line-height:1.45;
  margin-top:25px;
  letter-spacing:-.5px
}
.speech-footer {
  font-size:11px;
  color:var(--muted);
  margin-top:54px
}
.seller-speech {
  border:1px solid var(--line);
  border-radius:8px;
  padding:40px
}
.seller-speech>span {
  color:var(--orange)
}
.seller-speech h3 {
  font-size:22px;
  line-height:1.5;
  margin-top:25px;
  letter-spacing:-.5px
}
.seller-speech p {
  font-size:13px;
  margin-top:23px
}
.affiliate-section {
  background:#e6ece2
}
.affiliate-grid {
  display:grid;
  grid-template-columns:1.15fr 1fr;
  gap:75px;
  align-items:center
}
.affiliate-grid h2 {
  font-size:44px
}
.affiliate-grid h2>span {
  color:var(--green)
}
.affiliate-grid>div>p {
  font-size:15px;
  margin:24px 0;
  max-width:470px
}
.affiliate-points {
  display:grid;
  gap:13px;
  margin:27px 0
}
.affiliate-points>div {
  display:flex;
  gap:12px;
  font-size:13px
}
.affiliate-points svg {
  width:17px;
  height:17px;
  color:var(--green)
}
.affiliate-grid>div>.small-note {
  font-size:10px;
  margin:17px 0 0;
  line-height:1.6;
  max-width:425px
}
.dashboard-teaser {
  background:var(--paper);
  border:1px solid #b8c7b7;
  border-radius:9px;
  padding:30px;
  display:block;
  transform:rotate(3deg);
  box-shadow:12px 18px 0 #cfdcca
}
.dashboard-teaser:hover {
  transform:rotate(0deg)
}
.teaser-top {
  display:flex;
  justify-content:space-between;
  align-items:center;
  font-size:9px;
  font-weight:700;
  letter-spacing:1px
}
.demo-pill {
  background:#fbe6b5;
  color:#795512;
  border:1px solid #eed79f;
  padding:4px 7px;
  border-radius:4px;
  font-size:8px;
  font-weight:700;
  letter-spacing:.7px
}
.teaser-title {
  font-size:34px;
  font-weight:800;
  line-height:1.2;
  letter-spacing:-1px;
  margin:32px 0
}
.teaser-stats {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:15px;
  padding-bottom:24px
}
.teaser-stats span {
  font-size:11px;
  color:var(--muted);
  display:block
}
.teaser-stats b {
  font-size:31px;
  display:block;
  margin-top:8px
}
.teaser-chart {
  height:128px;
  display:flex;
  gap:13px;
  align-items:flex-end;
  border-bottom:1px solid var(--line);
  padding:0 0 12px
}
.teaser-chart i {
  flex:1;
  background:#285a47;
  border-radius:3px 3px 0 0;
  min-width:5px
}
.teaser-chart i:last-child {
  background:var(--orange)
}
.teaser-bottom {
  display:flex;
  align-items:center;
  justify-content:space-between;
  font-size:9px;
  color:var(--muted);
  margin-top:20px;
  gap:20px
}
.founder {
  display:grid;
  grid-template-columns:.7fr 1.3fr;
  gap:90px;
  align-items:center
}
.founder-mark {
  height:305px;
  background:var(--ink);
  color:#f6aa83;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  font-family:Manrope,Arial,sans-serif;
  font-size:105px;
  font-weight:800;
  letter-spacing:-10px;
  position:relative
}
.founder-mark:before,.founder-mark:after {
  content:'';
  position:absolute;
  width:75%;
  height:75%;
  border:1px solid #525f53;
  transform:rotate(-10deg)
}
.founder-mark:after {
  transform:rotate(10deg)
}
.founder-mark span {
  font-family:'DM Sans',Arial,sans-serif;
  font-size:10px;
  letter-spacing:2px;
  color:#c4cbc3;
  margin-top:22px;
  z-index:1;
  text-transform:uppercase
}
.founder>div>p {
  font-size:14px;
  margin-top:23px
}
.founder .founder-signature {
  color:var(--ink);
  font-weight:700
}
.founder-signature span {
  display:block;
  font-size:11px;
  color:var(--muted);
  font-weight:400;
  margin-top:5px
}
.offer-section {
  background:#f0d1c0
}
.offer-inner {
  padding:94px 0;
  display:grid;
  grid-template-columns:1.1fr 1fr;
  gap:100px;
  align-items:center
}
.offer-inner>div>p {
  font-size:15px;
  margin-top:24px;
  max-width:370px;
  color:#4f5a50
}
.offer-inner h2 {
  font-size:53px
}
.offer-inner h2 span {
  color:#9a3d26
}
.offer-card {
  background:var(--paper);
  border-radius:9px;
  padding:35px;
  border:1px solid #d8bca9
}
.offer-label {
  font-size:9px;
  letter-spacing:1.2px;
  color:var(--muted);
  font-weight:700;
  margin-bottom:20px
}
.offer-card h3 {
  font-size:24px;
  letter-spacing:-.8px
}
.offer-card ul {
  list-style:none;
  padding:22px 0 24px;
  margin:0;
  display:grid;
  gap:15px;
  border-bottom:1px solid var(--line)
}
.offer-card li {
  display:flex;
  gap:10px;
  align-items:flex-start;
  font-size:12px
}
.offer-card li svg {
  width:16px;
  height:16px;
  color:var(--green)
}
.offer-detail {
  font-size:12px!important;
  line-height:1.6;
  margin:22px 0!important
}
.offer-card .button {
  width:100%
}
.offer-card .text-link {
  font-size:11px;
  margin-top:18px
}
.offer-card small {
  display:block;
  font-size:10px;
  line-height:1.6;
  color:var(--muted);
  margin-top:19px
}
.offer-price {
  font-size:35px;
  font-weight:800;
  margin:22px 0
}
.offer-price span {
  display:block;
  font-size:10px;
  font-weight:400;
  color:var(--muted);
  margin-top:9px
}
.faq {
  display:grid;
  grid-template-columns:.85fr 1.3fr;
  gap:80px
}
.faq details {
  border-bottom:1px solid var(--line)
}
.faq details:first-child {
  border-top:1px solid var(--line)
}
.faq summary {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:15px;
  padding:23px 0;
  font-size:14px;
  font-weight:700;
  line-height:1.5
}
.faq summary span {
  font-size:20px;
  font-weight:400
}
.faq details[open] summary span {
  transform:rotate(45deg)
}
.faq details p {
  font-size:13px;
  padding:0 30px 22px 0
}
.footer {
  background:var(--ink);
  color:#c4cec8;
  padding:40px 0 24px
}
.footer-top {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding-bottom:33px;
  border-bottom:1px solid #3b4640
}
.footer-top p {
  font-size:13px;
  color:#b9c3bc
}
.footer-top>a:last-child {
  display:flex;
  align-items:center;
  gap:8px;
  font-size:12px
}
.footer-bottom {
  display:flex;
  justify-content:space-between;
  gap:30px;
  font-size:9px;
  padding-top:25px
}
.footer-bottom>div {
  display:flex;
  gap:20px
}
.footer-bottom button {
  background:none;
  border:0;
  padding:0;
  color:inherit;
  font-size:inherit
}
.mobile-sticky {
  display:none
}
.modal {
  max-width:520px;
  width:calc(100% - 35px);
  padding:40px;
  border:1px solid var(--line);
  border-radius:12px;
  color:var(--ink);
  background:var(--paper);
  max-height:90vh;
  overflow:auto
}
.modal::backdrop {
  background:#13241cd0;
  backdrop-filter:blur(5px)
}
.modal h2 {
  font-size:34px;
  letter-spacing:-1.2px;
  margin-bottom:22px
}
.modal .eyebrow {
  font-size:8px;
  margin-bottom:12px
}
.close-modal {
  position:absolute;
  right:17px;
  top:12px;
  border:0;
  background:none;
  font-size:28px;
  color:var(--muted);
  width:32px;
  height:32px
}
.modal p,.legal p {
  font-size:13px;
  margin-bottom:20px
}
.modal form>p {
  margin-bottom:25px
}
label {
  display:block;
  font-size:12px;
  font-weight:600;
  margin:18px 0
}
input:not([type=range]):not([type=checkbox]),select,textarea {
  display:block;
  width:100%;
  border:1px solid #cdd2cb;
  border-radius:5px;
  padding:12px;
  margin-top:9px;
  background:white;
  color:var(--ink);
  outline-offset:2px
}
textarea {
  min-height:100px;
  resize:vertical
}
input[type=checkbox] {
  accent-color:var(--orange);
  width:16px;
  height:16px;
  flex-shrink:0
}
.checkbox {
  display:flex;
  align-items:flex-start;
  gap:9px;
  font-size:11px;
  font-weight:400;
  line-height:1.6
}
.checkbox input {
  margin:3px 0 0
}
.trap {
  position:absolute!important;
  left:-9999px!important
}
.modal form>.button {
  width:100%
}
.modal small {
  font-size:9px;
  color:var(--muted);
  display:block;
  margin-top:15px
}
.form-message {
  background:#f6eadb;
  border:1px solid #e6cbaa;
  padding:13px 18px;
  border-radius:5px;
  font-size:12px;
  line-height:1.6;
  color:#624d30;
  margin:15px 0
}
.form-message a {
  display:flex;
  align-items:center;
  gap:8px;
  text-decoration:underline
}
.success-panel {
  text-align:center
}
.success-panel svg {
  color:var(--green)
}
.success-panel h3 {
  font-size:24px;
  margin:18px 0
}
.success-panel .button {
  margin-top:5px
}
.small-note {
  font-size:11px;
  color:var(--muted)
}
.form-row {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:22px
}

/* Partner workspace */

.dashboard-shell {
  display:flex;
  min-height:100vh;
  background:#f5f6f1
}
.sidebar {
  width:238px;
  flex-shrink:0;
  border-right:1px solid #dde2d9;
  background:var(--paper);
  padding:34px 22px;
  position:fixed;
  inset:0 auto 0 0;
  display:flex;
  flex-direction:column;
  z-index:10
}
.sidebar .logo {
  margin-left:13px
}
.sidebar-label {
  font-size:8px;
  letter-spacing:1.4px;
  color:#8b948d;
  margin:47px 13px 16px;
  font-weight:700
}
.sidebar nav {
  display:grid;
  gap:6px
}
.sidebar nav button {
  display:flex;
  align-items:center;
  gap:12px;
  background:none;
  border:0;
  border-radius:6px;
  padding:13px;
  color:#69736c;
  text-align:left;
  font-size:12px
}
.sidebar nav button.selected {
  background:#e9eee4;
  color:#245740;
  font-weight:700
}
.sidebar nav button>svg:last-child:not(:first-child) {
  margin-left:auto
}
.sidebar nav button:hover {
  background:var(--cream)
}
.sidebar-bottom {
  margin-top:auto;
  padding-top:30px
}
.sidebar-bottom>a {
  display:flex;
  align-items:center;
  gap:11px;
  font-size:11px;
  color:var(--muted);
  padding:12px
}
.sidebar-callout {
  padding:18px 15px;
  background:#f0e8de;
  border-radius:7px;
  margin-bottom:14px
}
.sidebar-callout>span {
  font-size:12px;
  font-weight:700
}
.sidebar-callout p {
  font-size:10px;
  line-height:1.6;
  margin:10px 0
}
.sidebar-callout a {
  font-size:10px;
  font-weight:700;
  display:flex;
  gap:8px;
  align-items:center
}
.dashboard-main {
  width:calc(100% - 238px);
  margin-left:238px;
  min-width:0
}
.dashboard-header {
  height:90px;
  border-bottom:1px solid #dde2d9;
  background:var(--paper);
  padding:0 40px;
  display:flex;
  align-items:center;
  justify-content:space-between
}
.dashboard-header>div:first-of-type {
  display:flex;
  align-items:center;
  gap:13px;
  font-size:11px
}
.breadcrumb {
  color:var(--muted)
}
.account-chip {
  display:flex;
  gap:10px;
  align-items:center
}
.account-chip>span {
  background:#e4eadd;
  color:var(--green);
  border-radius:50%;
  width:35px;
  height:35px;
  display:grid;
  place-items:center;
  font-size:12px;
  font-weight:700
}
.account-chip p {
  font-size:11px;
  color:var(--ink);
  line-height:1.3
}
.account-chip small {
  display:block;
  font-size:9px;
  color:var(--muted);
  margin-top:5px
}
.dashboard-content {
  padding:37px 40px 22px;
  max-width:1500px;
  margin:auto
}
.dashboard-title {
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:25px;
  margin-bottom:25px
}
.dashboard-title .eyebrow {
  font-size:8px;
  margin-bottom:12px;
  color:var(--green)
}
.dashboard-title h1 {
  font-size:30px;
  line-height:1.25;
  letter-spacing:-1px
}
.dashboard-title p {
  font-size:12px;
  margin-top:11px
}
.dashboard-title .button {
  font-size:10px;
  background:var(--paper)
}
.demo-banner {
  display:flex;
  gap:12px;
  align-items:center;
  font-size:10px;
  background:#fff6df;
  border:1px solid #e6d2a6;
  border-radius:5px;
  padding:12px;
  margin-bottom:20px;
  line-height:1.5
}
.demo-banner button {
  margin-left:auto;
  white-space:nowrap;
  border:0;
  background:none;
  text-decoration:underline;
  font-size:10px
}
.status-banner {
  background:#ebf0e7;
  border:1px solid #d7e2d3;
  display:flex;
  align-items:center;
  gap:10px;
  font-size:10px;
  line-height:1.6;
  padding:12px 16px;
  border-radius:5px;
  margin-bottom:20px;
  color:var(--green)
}
.status-dot {
  width:6px;
  height:6px;
  border-radius:50%;
  background:#467344;
  flex-shrink:0
}
.stat-grid {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:15px;
  margin-bottom:24px
}
.stat-card {
  background:var(--paper);
  border:1px solid #dce2d7;
  border-radius:7px;
  padding:22px 20px
}
.stat-card>div {
  display:flex;
  gap:10px;
  justify-content:space-between;
  font-size:10px;
  color:var(--muted)
}
.stat-card svg {
  color:#84927f
}
.stat-card>strong {
  display:block;
  font-size:29px;
  margin:16px 0 9px;
  letter-spacing:-1px
}
.stat-card>small {
  font-size:8px;
  color:var(--muted)
}
.dashboard-columns {
  display:grid;
  grid-template-columns:1.65fr 1fr;
  gap:22px;
  margin-bottom:23px
}
.panel {
  background:var(--paper);
  border:1px solid #dce2d7;
  border-radius:8px;
  padding:26px;
  min-width:0
}
.panel h2 {
  font-size:16px;
  letter-spacing:-.4px
}
.panel p {
  font-size:11px;
  margin-top:8px
}
.panel-heading {
  display:flex;
  justify-content:space-between;
  gap:15px;
  align-items:flex-start;
  margin-bottom:22px
}
.panel-heading p {
  font-size:9px
}
.badge {
  background:#edf1e9;
  color:var(--green);
  border:1px solid #dbe3d5;
  font-size:8px;
  letter-spacing:.7px;
  padding:5px 7px;
  border-radius:4px
}
.activity-chart {
  display:flex;
  height:180px;
  padding-top:18px;
  gap:10px
}
.chart-y {
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  color:#84917f;
  font-size:8px;
  padding-bottom:27px;
  width:24px
}
.chart-bars {
  display:flex;
  flex:1;
  gap:18px;
  align-items:flex-end;
  border-bottom:1px solid #e2e5de;
  position:relative
}
.chart-bars:before,.chart-bars:after {
  content:'';
  position:absolute;
  left:0;
  right:0;
  top:20%;
  border-bottom:1px dashed #e1e6dc
}
.chart-bars:after {
  top:65%
}
.chart-bars>div {
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-end;
  height:100%;
  gap:10px;
  position:relative;
  z-index:1
}
.chart-bars>div>div {
  background:#b9cdb1;
  max-width:29px;
  width:100%;
  border-radius:4px 4px 0 0;
  position:relative
}
.chart-bars>div:nth-last-child(2)>div {
  background:var(--orange)
}
.chart-bars>div>div>span {
  display:none;
  position:absolute;
  top:-18px;
  left:0;
  font-size:8px
}
.chart-bars>div:hover>div>span {
  display:block
}
.chart-bars label {
  font-size:8px;
  color:var(--muted);
  margin:0 0 5px;
  font-weight:400
}
.activity-summary {
  display:flex;
  gap:22px;
  padding-top:22px;
  margin-top:18px;
  border-top:1px solid #e0e5da
}
.activity-summary>div {
  flex:1
}
.activity-summary span {
  font-size:8px;
  color:var(--muted);
  display:block
}
.activity-summary strong {
  font-size:17px;
  display:block;
  margin-top:9px
}
.empty-chart {
  height:183px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  text-align:center;
  color:#83917f;
  padding:20px
}
.empty-chart h3 {
  font-size:14px;
  color:var(--ink);
  margin-top:14px
}
.empty-chart p {
  max-width:330px;
  font-size:10px
}
.link-panel {
  display:flex;
  flex-direction:column;
  align-items:flex-start
}
.link-icon {
  padding:11px;
  border-radius:6px;
  background:#f6e6d7;
  color:var(--orange);
  display:flex;
  margin-bottom:20px
}
.link-panel p {
  font-size:10px;
  line-height:1.7;
  margin:10px 0 19px;
  max-width:270px
}
.referral-link {
  font-size:9px;
  padding:12px;
  border:1px solid #dce2d7;
  background:#f4f6ef;
  border-radius:5px;
  width:100%;
  overflow-wrap:anywhere;
  color:var(--muted);
  margin-bottom:14px
}
.link-panel .button {
  width:100%;
  font-size:11px
}
.link-panel .text-link {
  font-size:9px;
  gap:6px;
  margin:15px auto 0
}
.table-panel {
  margin-bottom:24px
}
.table-actions {
  display:flex;
  gap:12px;
  align-items:center
}
.table-actions select {
  font-size:9px;
  padding:7px;
  margin:0;
  min-width:105px
}
.table-actions button {
  font-size:9px;
  display:flex;
  align-items:center;
  gap:5px;
  background:none;
  border:0;
  padding:7px
}
.table-scroll {
  overflow:auto
}
table {
  border-collapse:collapse;
  width:100%;
  text-align:left;
  font-size:10px;
  white-space:nowrap
}
th {
  font-weight:500;
  color:var(--muted);
  background:#f4f6f0;
  font-size:9px;
  padding:13px 12px;
  border-bottom:1px solid #e0e5da
}
td {
  padding:15px 12px;
  border-bottom:1px solid #e8ebe2
}
td:first-child {
  font-weight:600
}
td small {
  display:block;
  margin-top:7px;
  color:var(--muted);
  font-weight:400
}
td button {
  font-size:10px;
  border:1px solid var(--line);
  background:none;
  border-radius:4px;
  padding:7px
}
.sale-status {
  display:inline-block;
  background:#edf1e8;
  color:#547345;
  font-size:8px;
  padding:5px 8px;
  border-radius:4px;
  text-transform:capitalize
}
.sale-status.pending {
  background:#faf0dc;
  color:#907128
}
.sale-status.paid,.sale-status.approved {
  background:#e6f1e3;
  color:#367348
}
.sale-status.reversed,.sale-status.rejected {
  background:#f5e5df;
  color:#9a5138
}
.table-empty {
  padding:30px 20px;
  color:var(--muted);
  font-size:11px;
  text-align:center;
  line-height:1.6
}
.application-panel {
  margin-top:23px
}
.application-panel>.eyebrow {
  font-size:8px;
  margin-bottom:12px
}
.application-panel>h2 {
  font-size:21px
}
.application-panel form {
  margin-top:15px
}
.application-panel textarea {
  min-height:70px
}
.application-panel .form-row {
  grid-template-columns:1fr 1.3fr
}
.application-panel .checkbox {
  font-size:10px
}
.application-panel .button {
  font-size:11px;
  min-height:44px;
  padding:13px 20px
}
.balance-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:23px;
  margin-bottom:23px
}
.balance-card {
  background:#e4eadf;
  padding:30px;
  border-radius:8px;
  border:1px solid #c6d5bf
}
.balance-card:nth-child(2) {
  background:#f1eadf;
  border-color:#ded1bb
}
.balance-card>span {
  font-size:11px
}
.balance-card h2 {
  font-size:36px;
  letter-spacing:-1px;
  margin:17px 0 9px
}
.balance-card p {
  font-size:10px
}
.panel-note {
  font-size:9px!important;
  margin-top:22px!important
}
.toolkit-grid {
  display:grid;
  grid-template-columns:1.1fr 1fr;
  gap:23px
}
.resource-icon {
  display:flex;
  color:var(--orange);
  margin-bottom:23px
}
.caption {
  font-size:12px;
  line-height:1.8;
  border:1px solid var(--line);
  padding:23px;
  background:#f4f5ee;
  border-radius:5px;
  margin:22px 0
}
.toolkit-rules>svg {
  color:var(--green);
  margin-bottom:24px
}
.toolkit-rules ul {
  padding-left:16px;
  font-size:11px;
  line-height:1.8;
  display:grid;
  gap:13px;
  margin:22px 0 25px
}
.toolkit-rules .text-link {
  display:flex;
  margin-top:17px;
  font-size:11px
}
.profile-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:24px;
  font-size:11px
}
.profile-grid dt {
  color:var(--muted);
  font-size:9px;
  margin-bottom:9px
}
.profile-grid dd {
  margin:0;
  overflow-wrap:anywhere;
  line-height:1.6
}
.dashboard-footer {
  display:flex;
  justify-content:space-between;
  align-items:center;
  border-top:1px solid #dce2d7;
  margin-top:33px;
  padding-top:19px;
  font-size:8px;
  color:var(--muted);
  letter-spacing:.8px
}
.dashboard-footer a {
  display:flex;
  gap:5px;
  align-items:center;
  font-size:8px;
  letter-spacing:0
}
.dashboard-mobile-logo,.dashboard-mobile-tabs {
  display:none
}
.empty-state {
  padding:50px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:15px;
  font-size:12px;
  color:var(--muted)
}
.admin-page {
  padding-bottom:60px
}
.admin-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:35px 0 55px;
  font-size:13px
}
.admin-page>h1 {
  font-size:45px;
  letter-spacing:-2px
}
.admin-page>p {
  margin:17px 0 30px;
  max-width:800px;
  font-size:14px
}
.admin-page .panel {
  margin-bottom:25px
}
.admin-fields {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0 25px
}
.admin-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:24px
}
.admin-page .button {
  min-height:45px;
  font-size:12px
}
.admin-page table select {
  font-size:10px;
  margin:0;
  min-width:95px;
  padding:7px
}
.admin-page td {
  max-width:280px;
  white-space:normal;
  line-height:1.7
}
.access-page {
  padding:80px 40px;
  max-width:720px;
  margin:auto
}
.access-page>.eyebrow {
  margin-top:65px
}
.access-page h1 {
  font-size:40px;
  letter-spacing:-1.5px
}
.access-page p {
  margin:25px 0;
  font-size:15px
}

@media(min-width:1450px) {
  .hero h1 {
    font-size:94px
  }
  .hero {
    padding-block:76px
  }
  .hero-art {
    height:577px
  }
  .course-book {
    top:110px;
    height:370px
  }
  .book-face h2 {
    font-size:31px
  }
}
@media(max-width:1100px) {
  .wrap {
    width:calc(100% - 60px)
  }
  .navlinks {
    gap:18px;
    font-size:11px
  }
  .nav {
    gap:16px
  }
  .hero {
    gap:32px
  }
  .hero h1 {
    font-size:74px;
    letter-spacing:-4px
  }
  .hero-art {
    height:520px
  }
  .course-book {
    left:20%;
    top:102px;
    width:65%;
    height:330px
  }
  .book-face {
    padding:22px
  }
  .book-face h2 {
    font-size:26px
  }
  .hero-actions {
    gap:15px
  }
  .hero-actions .button {
    font-size:12px;
    padding:17px
  }
  .hero-actions .text-link {
    font-size:12px
  }
  .section {
    padding-block:85px
  }
  h2 {
    font-size:42px
  }
  .section-heading {
    gap:40px
  }
  .section-heading>p {
    width:290px
  }
  .problem {
    gap:60px
  }
  .materials-grid {
    gap:70px
  }
  .affiliate-grid {
    gap:45px
  }
  .affiliate-grid h2 {
    font-size:37px
  }
  .offer-inner {
    gap:60px
  }
  .offer-inner h2 {
    font-size:45px
  }
  .faq {
    gap:45px
  }
  .sidebar {
    width:210px;
    padding:28px 15px
  }
  .dashboard-main {
    margin-left:210px;
    width:calc(100% - 210px)
  }
  .dashboard-header {
    padding-inline:25px
  }
  .dashboard-content {
    padding:30px 25px
  }
  .stat-grid {
    gap:10px
  }
  .stat-card {
    padding:18px 14px
  }
  .stat-card>strong {
    font-size:25px
  }
  .dashboard-title h1 {
    font-size:27px
  }
  .panel {
    padding:22px
  }
  .dashboard-columns {
    grid-template-columns:1.4fr 1fr;
    gap:16px
  }
  .activity-summary {
    gap:15px
  }
  .chart-bars {
    gap:12px
  }
}

@media(max-width:820px) {
  .wrap {
    width:calc(100% - 40px)
  }
  .announcement {
    font-size:8px;
    padding-inline:15px;
    gap:15px
  }
  .announcement span {
    display:none
  }
  .nav {
    height:73px
  }
  .navlinks {
    display:none
  }
  .navlinks.open {
    display:flex;
    position:absolute;
    top:73px;
    left:0;
    right:0;
    background:var(--paper);
    border-bottom:1px solid var(--line);
    padding:25px;
    flex-direction:column;
    align-items:flex-start;
    gap:24px;
    font-size:14px
  }
  .menu-button {
    display:flex;
    align-items:center;
    border:0;
    background:none;
    padding:9px
  }
  .nav-cta {
    margin-left:auto;
    font-size:11px;
    padding:10px 14px;
    gap:12px
  }
  .logo {
    font-size:28px
  }
  .logo svg {
    width:28px;
    height:28px
  }
  .hero {
    gap:25px;
    padding-block:47px;
    grid-template-columns:1fr 1fr;
    align-items:start
  }
  .hero h1 {
    font-size:58px;
    letter-spacing:-3px
  }
  .hero .eyebrow {
    font-size:8px;
    letter-spacing:.7px;
    line-height:1.7
  }
  .hero h1 svg {
    width:180px
  }
  .hero-description {
    font-size:13px;
    margin-block:23px
  }
  .hero-art {
    height:453px;
    margin-top:0;
    padding:17px
  }
  .art-top>svg {
    width:29px;
    height:29px
  }
  .tiny-tag {
    font-size:6px;
    padding:7px;
    letter-spacing:.6px
  }
  .course-book {
    top:88px;
    left:18%;
    width:68%;
    height:270px
  }
  .book-face {
    padding:18px
  }
  .book-face h2 {
    font-size:21px;
    letter-spacing:-1px
  }
  .book-kicker {
    font-size:5px;
    letter-spacing:.5px;
    margin-top:17px
  }
  .book-mark {
    font-size:25px
  }
  .book-bottom {
    font-size:5px;
    bottom:17px
  }
  .book-bottom b {
    font-size:6px
  }
  .book-lines {
    bottom:55px
  }
  .call-card {
    left:12px;
    right:12px;
    bottom:50px;
    padding:12px;
    gap:7px
  }
  .call-card strong {
    font-size:8px
  }
  .call-card span {
    font-size:7px
  }
  .call-icon {
    padding:7px
  }
  .call-icon svg {
    width:16px;
    height:16px
  }
  .sound-bars {
    display:none
  }
  .art-caption {
    font-size:6px;
    left:17px;
    right:17px;
    bottom:21px
  }
  .hero-footnote {
    font-size:9px;
    flex-wrap:wrap
  }
  .strip-inner>div {
    padding-left:18px;
    gap:12px
  }
  .strip-inner strong {
    font-size:28px
  }
  .strip-inner span {
    font-size:9px
  }
  .strip-note svg {
    width:22px
  }
  .section {
    padding-block:65px
  }
  h2 {
    font-size:34px;
    letter-spacing:-1.4px
  }
  .section-heading {
    gap:25px
  }
  .section-heading>p {
    width:250px;
    font-size:12px
  }
  .eyebrow {
    font-size:8px;
    letter-spacing:1px;
    margin-bottom:19px
  }
  .problem {
    gap:35px
  }
  .problem-body>p:first-child {
    font-size:17px
  }
  .problem-body>p {
    font-size:12px
  }
  .problem-line {
    gap:15px
  }
  .problem-line strong {
    font-size:12px
  }
  .problem-line p {
    font-size:11px
  }
  .closing-step {
    padding:27px
  }
  .closing-step h3 {
    font-size:21px
  }
  .closing-step p {
    font-size:12px
  }
  .materials-grid {
    gap:40px
  }
  .materials-grid>div>p {
    font-size:12px
  }
  .material {
    gap:17px
  }
  .material h3 {
    font-size:15px
  }
  .material p {
    font-size:11px
  }
  .material svg {
    width:20px
  }
  .buyer-speech,.seller-speech {
    padding:28px
  }
  .buyer-speech h3 {
    font-size:22px
  }
  .seller-speech h3 {
    font-size:19px
  }
  .affiliate-grid {
    gap:35px
  }
  .affiliate-grid h2 {
    font-size:31px
  }
  .affiliate-grid>div>p {
    font-size:12px
  }
  .affiliate-points>div {
    font-size:11px
  }
  .affiliate-grid .button {
    font-size:12px;
    padding:16px;
    gap:15px
  }
  .dashboard-teaser {
    padding:22px;
    box-shadow:8px 12px 0 #cfdcca
  }
  .teaser-title {
    font-size:27px
  }
  .teaser-chart {
    gap:8px
  }
  .teaser-top {
    font-size:6px
  }
  .teaser-bottom {
    font-size:7px
  }
  .teaser-stats span {
    font-size:9px
  }
  .founder {
    gap:40px
  }
  .founder-mark {
    height:250px;
    font-size:80px
  }
  .founder-mark span {
    font-size:7px
  }
  .founder>div>p {
    font-size:12px
  }
  .offer-inner {
    gap:35px;
    padding-block:65px
  }
  .offer-inner h2 {
    font-size:36px
  }
  .offer-card {
    padding:27px
  }
  .offer-card h3 {
    font-size:21px
  }
  .offer-inner>div>p {
    font-size:12px
  }
  .offer-card li {
    font-size:10px
  }
  .offer-label {
    font-size:7px
  }
  .offer-card .button {
    font-size:12px;
    padding:17px
  }
  .faq {
    gap:35px
  }
  .faq summary {
    font-size:12px;
    padding-block:21px
  }
  .faq details p {
    font-size:11px
  }
  .sidebar {
    display:none
  }
  .dashboard-main {
    width:100%;
    margin:0
  }
  .dashboard-header {
    height:72px
  }
  .dashboard-mobile-logo {
    display:block;
    font-size:26px;
    font-weight:800;
    letter-spacing:-1.5px
  }
  .dashboard-mobile-logo span {
    color:var(--orange)
  }
  .dashboard-header>.account-chip p {
    display:none
  }
  .dashboard-mobile-tabs {
    display:flex;
    gap:8px;
    overflow:auto;
    margin:0 0 22px;
    padding-bottom:7px
  }
  .dashboard-mobile-tabs button {
    white-space:nowrap;
    background:transparent;
    border:1px solid var(--line);
    border-radius:4px;
    padding:10px 13px;
    font-size:10px
  }
  .dashboard-mobile-tabs button.selected {
    background:var(--ink);
    color:white
  }
  .stat-grid {
    gap:14px
  }
  .dashboard-columns {
    grid-template-columns:1.7fr 1fr
  }
}

@media(max-width:600px) {
  .announcement {
    justify-content:space-between;
    padding-block:10px
  }
  .announcement a {
    font-size:9px
  }
  .nav {
    height:69px
  }
  .navlinks.open {
    top:69px
  }
  .wrap {
    width:calc(100% - 36px)
  }
  .hero {
    grid-template-columns:1fr;
    gap:34px;
    padding-top:37px;
    padding-bottom:38px
  }
  .hero h1 {
    font-size:66px;
    line-height:1.05;
    letter-spacing:-3.8px
  }
  .hero-copy .eyebrow {
    font-size:8px;
    margin-bottom:19px
  }
  .hero h1 svg {
    width:205px
  }
  .hero-description {
    font-size:15px;
    line-height:1.65;
    max-width:390px;
    margin-block:24px
  }
  .hero-actions {
    gap:21px
  }
  .hero-actions .button {
    padding:17px 21px;
    font-size:12px
  }
  .hero-actions .text-link {
    font-size:11px
  }
  .hero-footnote {
    font-size:9px;
    margin-top:18px
  }
  .hero-art {
    height:450px;
    max-width:420px;
    width:100%;
    margin:auto;
    padding:23px
  }
  .tiny-tag {
    font-size:8px;
    padding:8px
  }
  .art-top>svg {
    width:36px;
    height:36px
  }
  .course-book {
    top:90px;
    left:22%;
    width:60%;
    height:280px
  }
  .book-face {
    padding:21px
  }
  .book-face h2 {
    font-size:24px
  }
  .book-kicker {
    font-size:5px;
    letter-spacing:.8px
  }
  .book-mark {
    font-size:28px
  }
  .book-bottom {
    font-size:6px
  }
  .call-card {
    bottom:51px;
    left:17px;
    right:17px;
    padding:15px;
    gap:10px
  }
  .call-card strong {
    font-size:9px
  }
  .call-card span {
    font-size:8px
  }
  .call-icon {
    padding:10px
  }
  .sound-bars {
    display:flex
  }
  .art-caption {
    font-size:7px;
    left:23px;
    right:23px
  }
  .strip-inner {
    grid-template-columns:1fr 1fr;
    padding:10px 0
  }
  .strip-inner>div {
    border:0!important;
    padding:20px 12px!important;
    gap:13px
  }
  .strip-inner>div:nth-child(odd) {
    padding-left:0!important
  }
  .strip-inner>div:nth-child(-n+2) {
    border-bottom:1px solid #d7d5ce!important
  }
  .strip-inner strong {
    font-size:32px
  }
  .strip-inner span {
    font-size:11px
  }
  .section {
    padding-block:58px
  }
  h2 {
    font-size:35px;
    letter-spacing:-1.5px
  }
  .problem {
    grid-template-columns:1fr;
    gap:30px
  }
  .problem-body>p:first-child {
    font-size:19px;
    max-width:340px
  }
  .problem-body>p {
    font-size:14px
  }
  .problem-line {
    margin-top:23px
  }
  .problem-line strong {
    font-size:14px
  }
  .problem-line p {
    font-size:12px
  }
  .section-heading {
    flex-direction:column;
    align-items:flex-start;
    gap:22px;
    margin-bottom:30px
  }
  .section-heading>p {
    width:100%;
    max-width:370px;
    font-size:13px
  }
  .closing-grid {
    grid-template-columns:1fr
  }
  .closing-step {
    min-height:0;
    padding:29px
  }
  .closing-step>svg {
    margin-bottom:18px
  }
  .closing-step h3 {
    font-size:23px
  }
  .closing-step p {
    font-size:13px
  }
  .closing-step>span {
    font-size:8px
  }
  .calculator label {
    font-size:12px
  }
  .calculator-result {
    font-size:33px
  }
  .route-switch {
    display:flex
  }
  .route-switch button {
    flex:1;
    padding:12px 10px;
    font-size:10px;
    line-height:1.5
  }
  .route-output {
    font-size:11px;
    margin-bottom:24px
  }
  .curriculum summary {
    padding:22px 2px;
    gap:16px
  }
  .curriculum h3 {
    font-size:17px
  }
  .module-number {
    font-size:17px;
    width:26px
  }
  .module-content {
    padding:0 10px 25px 44px;
    font-size:12px
  }
  .module-content>div {
    font-size:11px;
    line-height:1.7
  }
  .materials-grid {
    grid-template-columns:1fr;
    gap:35px
  }
  .materials-grid>div>p {
    font-size:14px
  }
  .material {
    padding:22px 0;
    gap:20px
  }
  .material h3 {
    font-size:17px
  }
  .material p {
    font-size:12px
  }
  .practice-grid {
    grid-template-columns:1fr;
    gap:16px
  }
  .buyer-speech,.seller-speech {
    padding:29px
  }
  .buyer-speech h3 {
    font-size:23px
  }
  .speech-footer {
    margin-top:30px;
    font-size:10px
  }
  .seller-speech h3 {
    font-size:20px
  }
  .seller-speech p {
    font-size:12px
  }
  .affiliate-grid {
    grid-template-columns:1fr;
    gap:42px
  }
  .affiliate-grid h2 {
    font-size:36px
  }
  .affiliate-grid>div>p {
    font-size:14px
  }
  .affiliate-points>div {
    font-size:12px
  }
  .dashboard-teaser {
    margin:0 7px;
    transform:rotate(1deg);
    padding:27px
  }
  .teaser-title {
    font-size:32px
  }
  .teaser-top {
    font-size:8px
  }
  .teaser-chart {
    height:140px;
    gap:12px
  }
  .teaser-stats span {
    font-size:11px
  }
  .teaser-bottom {
    font-size:8px
  }
  .founder {
    grid-template-columns:1fr;
    gap:30px
  }
  .founder-mark {
    height:265px;
    max-width:330px;
    width:100%;
    font-size:100px
  }
  .founder-mark span {
    font-size:9px
  }
  .founder>div>p {
    font-size:14px
  }
  .offer-inner {
    grid-template-columns:1fr;
    gap:35px;
    padding-block:58px
  }
  .offer-inner h2 {
    font-size:42px
  }
  .offer-inner>div>p {
    font-size:14px
  }
  .offer-card {
    padding:28px
  }
  .offer-label {
    font-size:9px
  }
  .offer-card h3 {
    font-size:24px
  }
  .offer-card li {
    font-size:12px
  }
  .offer-detail {
    font-size:13px!important
  }
  .offer-card .button {
    font-size:13px
  }
  .faq {
    grid-template-columns:1fr;
    gap:30px
  }
  .faq summary {
    font-size:14px
  }
  .faq details p {
    font-size:13px
  }
  .footer {
    padding-top:33px;
    padding-bottom:91px
  }
  .footer-top {
    flex-wrap:wrap;
    gap:25px
  }
  .footer-top p {
    font-size:11px
  }
  .footer-top>a:last-child {
    font-size:11px;
    width:100%
  }
  .footer-bottom {
    flex-direction:column;
    gap:22px;
    font-size:9px;
    line-height:1.6
  }
  .mobile-sticky {
    display:flex;
    position:fixed;
    bottom:0;
    left:0;
    right:0;
    background:var(--paper);
    border-top:1px solid var(--line);
    z-index:19;
    padding:12px 18px calc(12px + env(safe-area-inset-bottom));
    justify-content:space-between;
    align-items:center
  }
  .mobile-sticky span {
    font-size:11px;
    font-weight:700
  }
  .mobile-sticky button {
    display:flex;
    gap:15px;
    align-items:center;
    background:var(--orange);
    border:0;
    color:white;
    padding:12px 15px;
    font-size:11px;
    font-weight:700;
    border-radius:5px
  }
  .modal {
    padding:30px 25px
  }
  .modal h2 {
    font-size:29px
  }
  .modal .eyebrow {
    font-size:7px
  }
  .dashboard-header {
    padding-inline:20px
  }
  .dashboard-header>div:first-of-type {
    font-size:9px;
    gap:8px
  }
  .dashboard-header .breadcrumb {
    display:none
  }
  .dashboard-content {
    padding:28px 18px
  }
  .dashboard-title {
    flex-direction:column;
    gap:15px
  }
  .dashboard-title h1 {
    font-size:28px
  }
  .dashboard-title p {
    font-size:11px
  }
  .dashboard-title .button {
    font-size:10px
  }
  .demo-banner {
    align-items:flex-start;
    gap:8px;
    flex-wrap:wrap;
    font-size:9px
  }
  .demo-banner button {
    margin-left:0
  }
  .status-banner {
    font-size:9px
  }
  .stat-grid {
    grid-template-columns:1fr 1fr;
    gap:11px
  }
  .stat-card {
    padding:18px 15px
  }
  .stat-card>div {
    font-size:9px
  }
  .stat-card>strong {
    font-size:26px;
    margin:17px 0 9px
  }
  .stat-card>small {
    font-size:8px;
    line-height:1.5
  }
  .dashboard-columns {
    grid-template-columns:1fr;
    gap:18px
  }
  .panel {
    padding:22px 18px
  }
  .panel h2 {
    font-size:17px
  }
  .panel-heading p {
    font-size:10px
  }
  .panel-heading {
    margin-bottom:22px;
    flex-wrap:wrap
  }
  .chart-bars {
    gap:20px
  }
  .activity-summary span {
    font-size:8px
  }
  .activity-summary strong {
    font-size:17px
  }
  .link-panel p {
    max-width:100%;
    font-size:11px
  }
  .link-panel .text-link {
    font-size:11px
  }
  .table-actions select {
    font-size:10px
  }
  .table-actions button {
    font-size:10px
  }
  .table-empty {
    font-size:10px;
    padding:25px 5px
  }
  .application-panel .form-row {
    grid-template-columns:1fr;
    gap:0
  }
  .application-panel .checkbox {
    font-size:10px
  }
  .balance-grid {
    grid-template-columns:1fr;
    gap:15px
  }
  .balance-card {
    padding:25px
  }
  .balance-card h2 {
    font-size:33px
  }
  .toolkit-grid {
    grid-template-columns:1fr;
    gap:18px
  }
  .toolkit-rules ul {
    font-size:12px
  }
  .caption {
    padding:18px;
    font-size:12px
  }
  .profile-grid {
    grid-template-columns:1fr
  }
  .dashboard-footer {
    align-items:flex-start;
    flex-direction:column;
    gap:17px;
    font-size:7px;
    margin-top:27px
  }
  .admin-header {
    padding-top:26px;
    padding-bottom:40px
  }
  .admin-page>h1 {
    font-size:34px
  }
  .admin-page>p {
    font-size:13px
  }
  .admin-fields,.admin-grid,.form-row {
    grid-template-columns:1fr;
    gap:0
  }
  .admin-grid {
    gap:8px
  }
  .access-page {
    padding:50px 25px
  }
  .access-page h1 {
    font-size:33px
  }
}

@media(prefers-reduced-motion:reduce) {
  html {
    scroll-behavior:auto
  }
  a,button {
    transition:none
  }
  .button:hover {
    transform:none
  }
  .dashboard-teaser {
    transform:none
  }
}
```

### app/rules.ts

```ts
export type Programme = {
    selar: string;
    nestuge: string;
    price: number | null;
    rate: number;
    holdDays: number;
    minimum: number;
    live: number;
};
export const defaultProgramme: Programme = { selar: '', nestuge: '', price: null, rate: 0, holdDays: 30, minimum: 1000000, live: 0 };
export function commissionFor(amount: number, rate: number) { if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isInteger(rate) || rate < 1 || rate > 10000)
    throw new Error('Invalid commission inputs'); return Math.floor(amount * rate / 10000); }
export function safeCheckout(value: unknown, host: string) { if (value === '')
    return ''; if (typeof value !== 'string')
    throw new Error('Invalid checkout link'); const u = new URL(value); if (u.protocol !== 'https:' || !(u.hostname === host || u.hostname.endsWith('.' + host)) || u.username || u.password)
    throw new Error('Use a secure ' + host + ' checkout link'); return u.href; }
export function validCode(value: unknown): value is string { return typeof value === 'string' && /^DSS-[A-F0-9]{12}$/.test(value); }
export function availableSales<T extends {
    status: string;
    eligible: number;
}>(list: T[], now: number) { return list.filter(s => s.status === 'pending' && s.eligible <= now); }
```

### app/server.ts

```ts
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
```

### app/chatgpt-auth.ts

```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export type ChatGPTUser = {
    userId: string;
    displayName: string;
    email: string;
    fullName: string | null;
};
const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
    const requestHeaders = await headers();
    const userId = requestHeaders.get(USER_ID_HEADER);
    const email = requestHeaders.get(USER_EMAIL_HEADER);
    if (!userId || !email)
        return null;
    const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
    const fullName = encodedFullName &&
        requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
        ? safeDecodeURIComponent(encodedFullName)
        : null;
    return {
        userId,
        displayName: fullName ?? email,
        email,
        fullName,
    };
}
export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> {
    const user = await getChatGPTUser();
    if (user)
        return user;
    redirect(chatGPTSignInPath(returnTo));
}
export function chatGPTSignInPath(returnTo: string): string {
    const safeReturnTo = safeRelativeReturnPath(returnTo);
    return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}
export function chatGPTSignOutPath(returnTo = "/"): string {
    const safeReturnTo = safeRelativeReturnPath(returnTo);
    return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}
function safeRelativeReturnPath(value: string): string {
    if (!value.startsWith("/") || value.startsWith("//"))
        return "/";
    let url: URL;
    try {
        url = new URL(value, "https://app.local");
    }
    catch {
        return "/";
    }
    if (url.origin !== "https://app.local")
        return "/";
    if (isReservedAuthPath(url.pathname))
        return "/";
    return `${url.pathname}${url.search}${url.hash}`;
}
function isReservedAuthPath(pathname: string): boolean {
    return (pathname === SIGN_IN_PATH ||
        pathname === SIGN_OUT_PATH ||
        pathname === CALLBACK_PATH);
}
function safeDecodeURIComponent(value: string): string | null {
    try {
        return decodeURIComponent(value);
    }
    catch {
        return null;
    }
}
```

### app/api/enquiry/route.ts

```ts
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
```

### app/api/affiliate/route.ts

```ts
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
```

### app/r/[code]/route.ts

```ts
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
```

### app/admin/page.tsx

```tsx
import { requireChatGPTUser } from '../chatgpt-auth';
import { isAdmin } from '../server';
import Admin from '../ui/Admin';
export const dynamic = 'force-dynamic';
export default async function Page() { await requireChatGPTUser('/admin'); if (!await isAdmin())
    return <main className="access-page"><a className="logo" href="/">DSS.</a><div className="eyebrow">OWNER WORKSPACE</div><h1>Admin access needs<br />to be enabled.</h1><p>This account has not been authorised to manage DSS. Enquiries and affiliate applications are saved separately from the public page.</p><a className="button primary" href="/dashboard">Return to partner portal</a></main>; return <Admin />; }
```

### app/ui/Admin.tsx

```tsx
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { Logo, money } from './shared';
import { defaultProgramme, type Programme } from '../rules';
type Affiliate = {
    userId: string;
    name: string;
    email: string;
    code: string;
    channel: string;
    status: string;
};
type Enquiry = {
    id: string;
    name: string;
    email: string;
    goal: string;
    referral: string | null;
    created: number;
};
type Sale = {
    id: string;
    reference: string;
    affiliate: string;
    amount: number;
    commission: number;
    status: string;
};
type Data = {
    programme: Programme;
    affiliates: Affiliate[];
    enquiries: Enquiry[];
    sales: Sale[];
};
export default function Admin() {
    const [d, setD] = useState<Data>({ programme: defaultProgramme, affiliates: [], enquiries: [], sales: [] }), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [ready, setReady] = useState(false);
    async function load() { const r = await fetch('/api/admin', { cache: 'no-store' }), j = await r.json() as Data & {
        error?: string;
    }; if (!r.ok)
        throw new Error(j.error); setD(j); setReady(true); }
    useEffect(() => { load().catch(e => setMessage(e.message)); }, []);
    async function save(body: unknown) { setBusy(true); setMessage(''); try {
        const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), j = await r.json() as {
            error?: string;
        };
        if (!r.ok)
            throw new Error(j.error);
        await load();
        setMessage('Saved.');
    }
    catch (e) {
        setMessage(e instanceof Error ? e.message : 'Unable to save.');
    }
    finally {
        setBusy(false);
    } }
    function settings(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); save({ action: 'settings', data: { selar: f.get('selar'), nestuge: f.get('nestuge'), price: f.get('price') ? Math.round(Number(f.get('price')) * 100) : null, rate: Math.round(Number(f.get('rate')) * 100), holdDays: Number(f.get('holdDays')), minimum: Math.round(Number(f.get('minimum')) * 100), live: f.get('live') === 'on' ? 1 : 0 } }); }
    function sale(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); save({ action: 'sale', code: f.get('code'), reference: f.get('reference'), platform: f.get('platform'), amount: Math.round(Number(f.get('amount')) * 100), verified: f.get('verified') === 'on' }); }
    function payout(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); save({ action: 'payout', code: f.get('code'), reference: f.get('reference'), verified: f.get('verified') === 'on' }); }
    return <main className="admin-page wrap"><header className="admin-header"><Logo /><a href="/dashboard">Partner portal ↗</a></header><div className="eyebrow">DSS OWNER WORKSPACE</div><h1>Programme control.</h1><p>Manage the offer and record verified sales. Payments are completed on the checkout platform; this workspace records reconciliation.</p>{message && <div className="form-message" role="status">{message}</div>}{ready && <><section className="panel"><h2>Offer & affiliate terms</h2><form onSubmit={settings} key={JSON.stringify(d.programme)}><div className="admin-fields"><label>Selar checkout URL<input name="selar" type="url" defaultValue={d.programme.selar}/></label><label>Nestuge checkout URL<input name="nestuge" type="url" defaultValue={d.programme.nestuge}/></label><label>Course price (NGN)<input name="price" type="number" min="1" step="0.01" defaultValue={d.programme.price ? d.programme.price / 100 : ''}/></label><label>Commission rate (%)<input name="rate" type="number" min="0" max="100" step="0.01" required defaultValue={d.programme.rate / 100}/></label><label>Clearance days<input name="holdDays" type="number" min="0" max="365" required defaultValue={d.programme.holdDays}/></label><label>Minimum payout (NGN)<input name="minimum" type="number" min="1" step="0.01" required defaultValue={d.programme.minimum / 100}/></label></div><label className="checkbox"><input name="live" type="checkbox" defaultChecked={!!d.programme.live}/>Publish these affiliate terms and open approvals.</label><p className="small-note">Close applications before changing published commission terms. Existing sale records retain their commission amounts.</p><button className="button primary" disabled={busy}>Save programme</button></form></section>
 <section className="panel"><h2>Partner applications</h2><div className="table-scroll"><table><thead><tr><th>Partner</th><th>Code</th><th>Promotion plan</th><th>Status</th><th>Action</th></tr></thead><tbody>{d.affiliates.map(a => <tr key={a.userId}><td>{a.name}<small>{a.email}</small></td><td>{a.code}</td><td>{a.channel}</td><td>{a.status}</td><td><select disabled={busy} aria-label={'Status for ' + a.name} value={a.status} onChange={e => save({ action: 'affiliate', userId: a.userId, status: e.target.value })}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></td></tr>)}</tbody></table></div>{!d.affiliates.length && <p className="table-empty">No applications yet.</p>}</section>
 <section className="panel"><h2>Enrolment enquiries</h2><div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Learning route</th><th>Referrer</th><th>Date</th></tr></thead><tbody>{d.enquiries.map(e => <tr key={e.id}><td>{e.name}</td><td>{e.email}</td><td>{e.goal}</td><td>{e.referral ?? 'Direct'}</td><td>{new Date(e.created).toLocaleDateString('en-GB')}</td></tr>)}</tbody></table></div>{!d.enquiries.length && <p className="table-empty">No enquiries yet.</p>}</section>
 <div className="admin-grid"><section className="panel"><h2>Record a verified sale</h2><p>Confirm the paid order and referral attribution on Selar or Nestuge before recording it. Do not credit a visit or unpaid enquiry.</p><form onSubmit={sale}><label>Approved partner<select name="code" required><option value="">Choose a partner</option>{d.affiliates.filter(a => a.status === 'approved').map(a => <option key={a.code} value={a.code}>{a.name} · {a.code}</option>)}</select></label><div className="form-row"><label>Order reference<input name="reference" required minLength={4} maxLength={150}/></label><label>Platform<select name="platform"><option>Selar</option><option>Nestuge</option></select></label></div><label>Eligible sale amount (NGN)<input name="amount" type="number" min="1" max="10000000" step="0.01" required/></label><label className="checkbox"><input name="verified" type="checkbox" required/>I checked payment and attribution against the platform record.</label><button className="button primary" disabled={busy}>Record sale</button></form></section>
 <section className="panel"><h2>Record a completed payout</h2><p>Complete the transfer separately, then enter its reference. This marks all cleared pending commission for the partner as paid.</p><form onSubmit={payout}><label>Partner<select name="code" required><option value="">Choose a partner</option>{d.affiliates.map(a => <option key={a.code} value={a.code}>{a.name} · {a.code}</option>)}</select></label><label>Transfer reference<input name="reference" required minLength={4} maxLength={150}/></label><label className="checkbox"><input name="verified" type="checkbox" required/>I confirm the transfer is completed and matches the partner’s cleared balance.</label><button className="button primary" disabled={busy}>Record completed payout</button></form></section></div>
 <section className="panel"><h2>Sale reconciliation</h2><div className="table-scroll"><table><thead><tr><th>Order</th><th>Partner</th><th>Amount</th><th>Commission</th><th>Status</th><th>Correction</th></tr></thead><tbody>{d.sales.map(s => <tr key={s.id}><td>{s.reference}</td><td>{s.affiliate}</td><td>{money(s.amount)}</td><td>{money(s.commission)}</td><td>{s.status}</td><td>{s.status === 'pending' && <button disabled={busy} onClick={() => { if (confirm('Confirm this order was refunded or invalidated? This reverses its unpaid commission.'))
            save({ action: 'refund', id: s.id }); }}>Reverse refunded sale</button>}</td></tr>)}</tbody></table></div></section></>}</main>;
}
```

### app/api/admin/route.ts

```ts
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
```

### db/schema.ts

```ts
import { sqliteTable,text,integer } from 'drizzle-orm/sqlite-core';
export const affiliates=sqliteTable('affiliates',{userId:text('user_id').primaryKey(),code:text('code').notNull().unique(),name:text('name').notNull(),email:text('email').notNull(),channel:text('channel').notNull(),status:text('status').notNull().default('pending'),created:integer('created').notNull()});
export const enquiries=sqliteTable('enquiries',{id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull(),email:text('email').notNull(),goal:text('goal').notNull(),referral:text('referral'),created:integer('created').notNull()});
export const clicks=sqliteTable('clicks',{id:text('id').primaryKey(),affiliate:text('affiliate').notNull(),visitor:text('visitor').notNull(),created:integer('created').notNull()});
export const sales=sqliteTable('sales',{id:text('id').primaryKey(),affiliate:text('affiliate').notNull(),reference:text('reference').notNull().unique(),platform:text('platform').notNull(),amount:integer('amount').notNull(),commission:integer('commission').notNull(),status:text('status').notNull().default('pending'),eligible:integer('eligible').notNull(),created:integer('created').notNull()});
export const payouts=sqliteTable('payouts',{id:text('id').primaryKey(),affiliate:text('affiliate').notNull(),amount:integer('amount').notNull(),reference:text('reference').notNull().unique(),created:integer('created').notNull()});
export const payoutClaims=sqliteTable('payout_claims',{saleId:text('sale_id').primaryKey(),payoutId:text('payout_id').notNull()});
export const programme=sqliteTable('programme',{id:text('id').primaryKey(),selar:text('selar').notNull().default(''),nestuge:text('nestuge').notNull().default(''),price:integer('price'),rate:integer('rate').notNull().default(0),holdDays:integer('hold_days').notNull().default(30),minimum:integer('minimum').notNull().default(1000000),live:integer('live').notNull().default(0)});
```

### db/index.ts

```ts
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}
```

### drizzle/0000_fancy_shape.sql

```sql
CREATE TABLE `affiliates` (
	`user_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`channel` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `affiliates_code_unique` ON `affiliates` (`code`);--> statement-breakpoint
CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate` text NOT NULL,
	`visitor` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`goal` text NOT NULL,
	`referral` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payout_claims` (
	`sale_id` text PRIMARY KEY NOT NULL,
	`payout_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate` text NOT NULL,
	`amount` integer NOT NULL,
	`reference` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payouts_reference_unique` ON `payouts` (`reference`);--> statement-breakpoint
CREATE TABLE `programme` (
	`id` text PRIMARY KEY NOT NULL,
	`selar` text DEFAULT '' NOT NULL,
	`nestuge` text DEFAULT '' NOT NULL,
	`price` integer,
	`rate` integer DEFAULT 0 NOT NULL,
	`hold_days` integer DEFAULT 30 NOT NULL,
	`minimum` integer DEFAULT 1000000 NOT NULL,
	`live` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate` text NOT NULL,
	`reference` text NOT NULL,
	`platform` text NOT NULL,
	`amount` integer NOT NULL,
	`commission` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`eligible` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_reference_unique` ON `sales` (`reference`);
```
