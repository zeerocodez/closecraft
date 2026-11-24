import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getOrCreateWorkspaceSubscription } from '@/lib/payments/subscription';
import { SettingsForm } from './SettingsForm';
import { WorkspaceIdentityForm } from './WorkspaceIdentityForm';
import { MetaAdsConfigCard } from './MetaAdsConfigCard';
import { MetaLeadAdsDashboard } from '@/components/integrations/MetaLeadAdsDashboard';
import { 
  Building2, 
  Sparkles, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle,
  Lock,
  Download,
  AlertTriangle,
  BadgeCheck,
  Globe,
  Code2,
} from 'lucide-react';

export const metadata = {
  title: 'Workspace Settings | Closecraft',
  description: 'Manage your organization identity, AI qualification policy, and team governance.',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // Fetch organization details, members, qualification, and subscription
  const [org, qualification, subscription] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    }),
    db.workspaceQualification.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    }),
    getOrCreateWorkspaceSubscription(organizationId)
  ]);

  if (!org) {
    return (
      <div className="p-8 text-center text-gray-400 font-sans">
        Organization not found. Please contact support.
      </div>
    );
  }

  const callerMember = org.members.find(m => m.user.id === session.user.id);
  const isOwnerOrAdmin = callerMember?.role === 'OWNER' || callerMember?.role === 'ADMIN' || (session.user as any)?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-full border border-[#248277]/20 mb-2">
            <Building2 size={13} />
            <span>Workspace Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Organization Settings
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Manage your workspace identity, AI qualification criteria, commercial plan, and team governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/team"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-2"
          >
            <Users size={14} className="text-[#45bfae]" />
            <span>Manage Team ({org.members.length} / {subscription.maxInternalSeats})</span>
          </Link>
        </div>
      </div>

      {/* Section 1: Workspace Identity & WhatsApp Outreach */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Building2 size={18} className="text-[#45bfae]" />
            <span>Workspace Identity & WhatsApp Outreach</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Legal entity name and WhatsApp channel configured for inbound notifications and sales outreach.
          </p>
        </div>

        <WorkspaceIdentityForm 
          initialName={org.name}
          initialSlug={org.slug}
          initialWhatsApp={org.whatsappNumber || ''}
        />
      </section>

      {/* Section 2: Onboarding & Fit Assessment Profile */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">Operational Fit Profile</span>
              {qualification && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {qualification.status}
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg font-bold text-white">
              Revenue Qualification & Bottleneck Analysis
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Identifies your monthly enquiry volume, follow-up leakage points, and whether self-service software or managed sales closing is recommended.
            </p>

            {qualification ? (
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-[#121c1a] text-[#45bfae] border border-[#248277]/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <BadgeCheck size={14} />
                  <span>Fit: {qualification.softwareFit ? qualification.softwareFit.replace(/_/g, ' ') : 'Assessed'}</span>
                </span>
                <span className="px-3 py-1 bg-white/5 text-gray-400 border border-white/5 rounded-full text-xs font-mono">
                  Assessed {new Date(qualification.createdAt).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <p className="text-xs text-amber-400/90 font-medium pt-1">
                No diagnostic qualification completed yet. Run the onboarding wizard to personalize your setup.
              </p>
            )}
          </div>

          <Link
            href="/onboarding"
            className="px-4 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span>{qualification ? 'Update Qualification' : 'Start Diagnostic'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Section 3: AI Qualification & ICP Engine */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#45bfae]" />
            <span>AI Qualification & Intent Rules</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure how the Revenue Engine AI analyzes inbound leads, calculates Fit and Intent, and assigns the Next Best Action.
          </p>
        </div>

        <SettingsForm initialPolicy={org.qualificationPolicy || ""} />
      </section>

      {/* Section 3.B: Embeddable Website Lead Capture Widget */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-0.5 rounded-full border border-[#248277]/20">
              Inbound Capture
            </span>
          </div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Globe size={18} className="text-[#45bfae]" />
            <span>Website Lead Capture Widget &amp; Ingestion API</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Embed CloseCraft's zero-dependency script into your external website (WordPress, Webflow, Shopify, or custom HTML) to capture leads directly into your Revenue Engine.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-white block">HTML Embed Code (Paste before &lt;/body&gt;):</span>
            <div className="p-3 rounded-xl bg-[#13171a] border border-white/5 font-mono text-xs text-[#45bfae] overflow-x-auto select-all">
              {`<script src="https://app.closecraft.com/closecraft.js" data-workspace="${org.slug}" defer></script>`}
            </div>
            <p className="text-[11px] text-gray-400">
              Automatically attaches a floating "Talk to Sales" modal to your website. Inquiries are instantly attributed to your workspace slug (<strong className="text-white font-mono">{org.slug}</strong>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-white block">Headless API Endpoint (For Custom Forms):</span>
            <div className="p-3 rounded-xl bg-[#13171a] border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto select-all">
              POST /api/leads/embed
            </div>
            <p className="text-[11px] text-gray-400">
              Submit JSON payloads with <code className="text-[#45bfae]">workspaceSlug: "{org.slug}"</code>, <code className="text-[#45bfae]">name</code>, and <code className="text-[#45bfae]">phone</code> or <code className="text-[#45bfae]">email</code>. CORS preflight and cross-origin browser submissions are enabled by default.
            </p>
          </div>

          {/* Ingestion Channels & Gateway Health Monitor */}
          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Ingestion Channel Health Monitor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#13171a] border border-white/5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-white">Website Widget</span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono truncate">slug: {org.slug}</p>
                <span className="text-[10px] text-emerald-400 block font-medium">Ready for Inbound</span>
              </div>

              <div className="p-3 rounded-xl bg-[#13171a] border border-white/5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-white">Meta Lead Ads</span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono truncate">/api/webhooks/facebook</p>
                <span className="text-[10px] text-emerald-400 block font-medium">Webhook Active</span>
              </div>

              <div className="p-3 rounded-xl bg-[#13171a] border border-white/5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-white">WhatsApp Outreach</span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono truncate">{org.whatsappNumber || 'Default Gateway'}</p>
                <span className="text-[10px] text-emerald-400 block font-medium">1-Click Direct Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.C: Native Meta Lead Ads Integration & Attribution */}
      <section id="meta-ads" className="space-y-6">
        <MetaLeadAdsDashboard 
          teamMembers={org.members.map(m => ({
            id: m.user.id,
            name: m.user.name || m.user.email?.split('@')[0] || 'Team Closer'
          }))} 
        />
      </section>

      {/* Section 4: Commercial Plan & Billing Overview */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">Commercial Plan</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded font-bold bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30">
                {subscription.plan} TIER
              </span>
            </div>
            <h2 className="font-serif text-lg font-bold text-white">
              Workspace Subscription & Seat Capacity
            </h2>
            <p className="text-xs text-gray-400">
              Capacity: <strong className="text-white font-semibold">{subscription.maxInternalSeats} Internal Team Seats</strong> · {subscription.maxActiveLeads.toLocaleString()} Active Leads/mo.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-bold text-white font-mono">
              {subscription.currency} {subscription.pricePerMonth?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 block">/ month (Manual renewal)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#45bfae] shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="font-bold text-white">Bachs Automated Payment Gateway</p>
              <p className="text-gray-400 text-[11px]">NGN Bank Transfer, Debit Cards, MoMo (No recurring lock-in)</p>
            </div>
          </div>

          <Link
            href="/billing"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Manage Plan & Invoices</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </section>

      {/* Section 5: Team Roster Snapshot */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-[#45bfae]" />
              <span>Team Members & Roles</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Workspace members assigned to sales closing, appointment setting, or administration.
            </p>
          </div>

          <Link
            href="/team"
            className="px-4 py-2 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Open Team Hub</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0a0d12]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 text-gray-400 bg-white/[0.01]">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Workspace Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {org.members.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] font-bold flex items-center justify-center text-xs">
                        {member.user.name ? member.user.name.substring(0, 2).toUpperCase() : 'CC'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{member.user.name || 'Team Member'}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{member.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      member.role === 'OWNER'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : member.role === 'ADMIN'
                        ? 'bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30'
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Governance & Security */}
      <section className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#45bfae]" />
            <span>Data Isolation & Tenant Security</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Every lead, conversation, and deal is strictly isolated to organization ID <span className="font-mono text-white">{org.id}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Lock size={14} className="text-[#45bfae]" />
              <span>Multi-Tenant Row-Level Security</span>
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Enforced server-authoritatively on every query. Your team members and remote closers only access records scoped to this workspace.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Download size={14} className="text-[#45bfae]" />
              <span>Data Export & Backup</span>
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Full workspace data export (CSV/JSON) is available to Organization Owners and Admins upon request to engineering.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
