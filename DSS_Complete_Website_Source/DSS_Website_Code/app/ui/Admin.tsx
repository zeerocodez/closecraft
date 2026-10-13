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
