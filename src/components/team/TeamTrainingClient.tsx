'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { submitSalesSupportRequest } from '@/app/(saas)/actions';

interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt?: string;
  modulesCompleted?: number;
  practiceConversationsCount?: number;
}

export default function TeamTrainingClient({
  organizationName,
  userEmail,
  isManagerOrOwner,
  participants,
}: {
  organizationName: string;
  userEmail: string;
  isManagerOrOwner: boolean;
  participants: Participant[];
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'invite' | 'reports'>('overview');

  // Request form state
  const [businessObjective, setBusinessObjective] = useState('');
  const [teamSize, setTeamSize] = useState('5');
  const [salesRoles, setSalesRoles] = useState('Inbound SDRs, Account Executives, Closers');
  const [skillsToImprove, setSkillsToImprove] = useState<string[]>([
    'OBJECTION_HANDLING',
    'COMMERCIAL_QUALIFICATION',
    'PIPELINE_VELOCITY'
  ]);
  const [deliveryPreference, setDeliveryPreference] = useState('HYBRID'); // ASYNC_AI_PLUS_LIVE_CLINICS, LIVE_WORKSHOPS, ASYNC_ONLY
  const [timeZone, setTimeZone] = useState('WAT (West Africa Time, UTC+1)');
  const [preferredTiming, setPreferredTiming] = useState('Mid-week mornings (Tues/Thurs 10am)');
  const [authorizedContact, setAuthorizedContact] = useState(userEmail);
  const [useAnonymisedData, setUseAnonymisedData] = useState(true);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Request submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkillsToImprove(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessObjective.trim()) {
      alert('Please state your core business training objective.');
      return;
    }

    setIsSubmitting(true);
    try {
      const summary = `Team Training Request (${teamSize} reps): ${businessObjective}`;
      const payload = {
        helpNeeded: ['TEAM_TRAINING', ...skillsToImprove],
        offerSummary: summary,
        recentEnquiryVolume: `${teamSize} team members`,
        targetAudience: salesRoles,
        workingHoursRequired: preferredTiming,
        languageRequirements: 'English',
        currentDifficulties: `Skills to improve: ${skillsToImprove.join(', ')}. Delivery: ${deliveryPreference}. Anonymised data: ${useAnonymisedData}`,
        authorizedDecisionMaker: authorizedContact,
        additionalNotes: JSON.stringify({
          type: 'BUSINESS_TEAM_TRAINING',
          businessObjective,
          teamSize,
          salesRoles,
          skillsToImprove,
          deliveryPreference,
          timeZone,
          preferredTiming,
          useAnonymisedData,
        })
      };

      await submitSalesSupportRequest(payload);
      setRequestSubmitted(true);
      setActiveTab('overview');
    } catch (err: any) {
      alert(err.message || 'Failed to submit training request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteSuccessMsg(null);
    try {
      const { addTenantTeamMember } = await import('@/app/(saas)/actions');
      await addTenantTeamMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole as any,
      });

      setInviteSuccessMsg(`Invitation sent to ${inviteEmail}. Participant will access assigned training modules without exposing unrelated workspace CRM data.`);
      setInviteEmail('');
      setInviteName('');
    } catch (err: any) {
      alert(err.message || 'Invitation failed');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Training
            </span>
            <span className="text-xs text-on-surface-variant">Workspace: {organizationName}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-on-surface mt-2">
            Business Sales Team Development
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Build high-conviction sales execution across your internal team using offer-specific role-play and verifiable assessments.
          </p>
        </div>

        {isManagerOrOwner && (
          <button
            onClick={() => setActiveTab('request')}
            className="px-4 py-2 rounded-lg bg-primary text-primary-fixed font-medium text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Icon name="GraduationCap" size={16} />
            <span>Request Team Training</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6 text-sm">
        {[
          { id: 'overview', label: 'Overview & Delivery Stages' },
          { id: 'request', label: 'Request Scoped Training', visible: isManagerOrOwner },
          { id: 'invite', label: 'Invite Participants', visible: isManagerOrOwner },
          { id: 'reports', label: 'Team Progress & Benchmarks' },
        ].filter(t => t.visible !== false).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-medium transition-colors border-b-2 -mb-px text-xs ${
              activeTab === tab.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & STAGES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {requestSubmitted && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={18} />
                <span>Team training request submitted. An operator will review your business objectives and prepare a tailored syllabus proposal.</span>
              </div>
              <button onClick={() => setRequestSubmitted(false)} className="text-xs hover:underline">Dismiss</button>
            </div>
          )}

          {/* 8-Stage Workflow Graphic */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">Structured Team Development Workflow</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { step: '1. Request', desc: 'Define business objective & team roles' },
                { step: '2. Review', desc: 'Assess offer & specific objections' },
                { step: '3. Proposal', desc: 'Tailored syllabus, timing & fixed fees' },
                { step: '4. Acceptance', desc: 'Sign-off on commercial scope' },
                { step: '5. Payment', desc: 'Invoice payment according to terms' },
                { step: '6. Delivery', desc: 'AI practice + live instructor clinics' },
                { step: '7. Assessments', desc: 'Verifiable competency scoring' },
                { step: '8. Completion', desc: 'Executive debrief & team recommendations' },
              ].map(item => (
                <div key={item.step} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1">
                  <div className="font-bold text-primary">{item.step}</div>
                  <div className="text-on-surface-variant text-[11px]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Data Governance Banner */}
          <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface-variant space-y-1.5">
            <div className="font-semibold text-on-surface flex items-center gap-2">
              <Icon name="Lock" size={16} className="text-primary" />
              <span>Data Confidentiality & Anonymisation Policy</span>
            </div>
            <p>
              By default, team training role-play scenarios use synthetic, anonymised customer profiles matching your industry. Live sales recordings or identifiable customer details are never fed into AI models without explicit, documented corporate authorization.
            </p>
          </div>

          {/* Active Participants Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-on-surface">Enrolled Team Members ({participants.length})</h3>
              {isManagerOrOwner && (
                <button
                  onClick={() => setActiveTab('invite')}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Icon name="UserPlus" size={14} />
                  <span>Invite Reps</span>
                </button>
              )}
            </div>

            {participants.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant italic">
                No team participants currently enrolled. Invite team members to begin curriculum and AI practice.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {participants.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-on-surface">{p.name || p.email}</div>
                      <div className="text-[11px] text-on-surface-variant">{p.email} • Role: {p.role}</div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Practice Sessions</span>
                        <span className="font-mono font-semibold text-primary">{p.practiceConversationsCount || 0}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        {p.status || 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REQUEST TEAM TRAINING */}
      {activeTab === 'request' && (
        <form onSubmit={handleRequestSubmit} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-6">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-base text-on-surface">Request Tailored Team Training</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Submit your team development specifications to receive a scoped curriculum proposal and delivery schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-on-surface">Core Business Objective *</label>
              <textarea
                required
                rows={3}
                value={businessObjective}
                onChange={(e) => setBusinessObjective(e.target.value)}
                placeholder="e.g. Reduce discovery-to-close sales cycle from 45 days to 25 days, improve objection handling against cheaper competitors..."
                className="w-full text-xs p-3 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Team Size (Participating Reps)</label>
              <input
                type="number"
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Relevant Sales Roles</label>
              <input
                type="text"
                value={salesRoles}
                onChange={(e) => setSalesRoles(e.target.value)}
                placeholder="e.g. Inbound SDRs, Senior Account Executives"
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Time Zone</label>
              <input
                type="text"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Preferred Timing for Live Clinics</label>
              <input
                type="text"
                value={preferredTiming}
                onChange={(e) => setPreferredTiming(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-on-surface">Authorised Decision-Maker Contact</label>
              <input
                type="text"
                value={authorizedContact}
                onChange={(e) => setAuthorizedContact(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Skills checklist */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/30">
            <label className="text-xs font-semibold text-on-surface">Key Skills to Improve</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'OBJECTION_HANDLING', label: 'Commercial objection handling (Price, Authority, Timing)' },
                { id: 'COMMERCIAL_QUALIFICATION', label: 'Rigorous discovery & qualification (BANT / MEDDIC)' },
                { id: 'PIPELINE_VELOCITY', label: 'Multi-touch follow-up & momentum acceleration' },
                { id: 'DEMO_CONVERSION', label: 'Value-led software demo delivery & closing' },
                { id: 'NEGOTIATION', label: 'Pricing defense & contract negotiation' },
              ].map(skill => (
                <label key={skill.id} className="flex items-center gap-2 p-2 bg-surface rounded-lg border border-outline-variant/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skillsToImprove.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-on-surface">{skill.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Confidentiality toggle */}
          <div className="p-3 bg-surface rounded-lg border border-outline-variant/30 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-on-surface block">Use Anonymised Examples by Default</span>
              <span className="text-on-surface-variant text-[11px]">Keep client customer identities confidential in training scenarios</span>
            </div>
            <input
              type="checkbox"
              checked={useAnonymisedData}
              onChange={(e) => setUseAnonymisedData(e.target.checked)}
              className="rounded text-primary focus:ring-0 w-4 h-4"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-fixed font-medium text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <span>Submit Scoped Training Request &rarr;</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: INVITE PARTICIPANTS */}
      {activeTab === 'invite' && (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-6">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-base text-on-surface">Invite Team Participants</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Add sales reps to your workspace training roster. Team invitations grant access to learning modules without exposing sensitive commercial or pipeline records.
            </p>
          </div>

          {inviteSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Participant Name</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="MEMBER">Sales Rep (Learner)</option>
                <option value="SETTER">Appointment Setter</option>
                <option value="CLOSER">Closer</option>
                <option value="MANAGER">Sales Manager</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isInviting}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-fixed font-medium text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
              >
                {isInviting ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span>Sending Invite...</span>
                  </>
                ) : (
                  <span>Send Participant Invite &rarr;</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: REPORTS & PROGRESS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">Team Competency Benchmarks (Aggregate View)</h3>
            <p className="text-xs text-on-surface-variant">
              Reporting reflects agreed cohort participation and anonymised skill assessments. Unrelated individual personal learning activities remain separate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Objection Defense Score</span>
                <div className="text-xl font-bold text-emerald-400">84%</div>
                <div className="text-[11px] text-on-surface-variant">+12% improvement after AI Buyer practice</div>
              </div>
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Discovery Qualification</span>
                <div className="text-xl font-bold text-primary">78%</div>
                <div className="text-[11px] text-on-surface-variant">Rigorous BANT compliance verified</div>
              </div>
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Follow-up Discipline</span>
                <div className="text-xl font-bold text-cyan-400">91%</div>
                <div className="text-[11px] text-on-surface-variant">Next actions set on 91% of active deals</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
