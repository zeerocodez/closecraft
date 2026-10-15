'use client';

import React, { useState, useTransition } from 'react';
import { 
  addTenantTeamMember, 
  removeTenantTeamMember, 
  toggleMemberAvailability, 
  updateTenantRoutingMode,
  updateMemberCommission 
} from '@/app/(saas)/actions';

interface Member {
  id: string;
  role: string;
  isAvailable: boolean;
  commissionRate?: number;
  commissionType?: string;
  googleCalendarConnected?: boolean;
  googleCalendarEmail?: string | null;
  reminderChannels?: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface MemberStat {
  wonCount: number;
  wonVolume: number;
  totalCommission: number;
  activeAppointments: number;
}

interface TeamPageClientProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    leadRoutingMode: string;
  };
  members: Member[];
  stats: {
    totalClosers: number;
    totalSetters: number;
    totalAssignedLeads: number;
    totalUnassignedLeads: number;
    memberLeadCounts: Record<string, number>;
    memberStats?: Record<string, MemberStat>;
  };
  currentUserRole: string;
}

export default function TeamPageClient({
  organization,
  members,
  stats,
  currentUserRole,
}: TeamPageClientProps) {
  const [routingMode, setRoutingMode] = useState<'OPEN_POOL' | 'ROUND_ROBIN' | 'OWNER_MANUAL'>(
    (organization.leadRoutingMode as any) || 'OPEN_POOL'
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editRate, setEditRate] = useState<number>(10);
  const [editType, setEditType] = useState<'PERCENTAGE' | 'FIXED_PER_DEAL' | 'FIXED_PER_APPOINTMENT'>('PERCENTAGE');
  
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // New member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'SETTER' | 'CLOSER' | 'ADMIN' | 'MEMBER'>('CLOSER');

  const isOwnerOrAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRoutingModeChange = (mode: 'OPEN_POOL' | 'ROUND_ROBIN' | 'OWNER_MANUAL') => {
    setRoutingMode(mode);
    startTransition(async () => {
      try {
        await updateTenantRoutingMode(mode);
        showToast(`✅ Lead distribution updated to ${mode.replace('_', ' ')}.`);
      } catch (err: any) {
        alert(err.message || 'Failed to update distribution mode');
      }
    });
  };

  const handleToggleAvailability = (memberId: string, currentStatus: boolean, memberName: string) => {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      try {
        await toggleMemberAvailability(memberId, nextStatus);
        showToast(`${memberName} marked as ${nextStatus ? 'Available for Leads' : 'Away'}.`);
      } catch (err: any) {
        alert(err.message || 'Failed to update availability');
      }
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    startTransition(async () => {
      try {
        await addTenantTeamMember({
          name: newName,
          email: newEmail,
          role: newRole,
        });
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        showToast(`✅ Added ${newName || newEmail} as ${newRole}.`);
      } catch (err: any) {
        alert(err.message || 'Failed to add team member');
      }
    });
  };

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    startTransition(async () => {
      try {
        await updateMemberCommission({
          memberId: editingMember.id,
          commissionRate: Number(editRate),
          commissionType: editType,
        });
        const name = editingMember.user.name || editingMember.user.email;
        showToast(`✅ Updated ${name}'s commission rate to ${editRate}${editType === 'PERCENTAGE' ? '%' : ' NGN'}.`);
        setEditingMember(null);
      } catch (err: any) {
        alert(err.message || 'Failed to update commission rate');
      }
    });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this organization?`)) return;
    startTransition(async () => {
      try {
        await removeTenantTeamMember(memberId);
        showToast(`Removed ${memberName} from workspace.`);
      } catch (err: any) {
        alert(err.message || 'Failed to remove member');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Team & Sales Force</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
              {organization.name}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage your Closers, Appointment Setters, Commission Rates, and Google Calendar transparency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Add Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Closers */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Closers</span>
            <span className="material-symbols-outlined text-[20px] text-primary">verified</span>
          </div>
          <div className="text-2xl font-bold text-on-surface font-headline">{stats.totalClosers}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">High-ticket deals & proposal negotiations</div>
        </div>

        {/* Total Setters */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Appointment Setters</span>
            <span className="material-symbols-outlined text-[20px] text-cyan-400">event_available</span>
          </div>
          <div className="text-2xl font-bold text-on-surface font-headline">{stats.totalSetters}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Discovery calls & booking qualified demos</div>
        </div>

        {/* Active Claimed Leads */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Team Workflow</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-400">trending_up</span>
          </div>
          <div className="text-2xl font-bold text-on-surface font-headline">{stats.totalAssignedLeads}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Leads claimed by Closers & Setters</div>
        </div>

        {/* Unassigned Pool */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open Pool (Unassigned)</span>
            <span className="material-symbols-outlined text-[20px] text-amber-400">all_inbox</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-headline">{stats.totalUnassignedLeads}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Ready to be claimed by available reps</div>
        </div>
      </div>

      {/* Lead Routing Configuration Strip */}
      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
              <span>Lead Distribution Policy</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Control how newly qualified leads are distributed across your team members
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-primary">
            Active Mode: {routingMode.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Open Pool */}
          <div 
            onClick={() => handleRoutingModeChange('OPEN_POOL')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              routingMode === 'OPEN_POOL'
                ? 'bg-primary/10 border-primary shadow-sm'
                : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">group_work</span>
                <span>Open Pool (Self-Claim)</span>
              </span>
              {routingMode === 'OPEN_POOL' && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Every qualified lead lands in your organization's open pool. Any available Setter or Closer can review the AI assessment and claim it immediately into their personal lead sheet.
            </p>
          </div>

          {/* 2. Round-Robin Auto Push */}
          <div 
            onClick={() => handleRoutingModeChange('ROUND_ROBIN')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              routingMode === 'ROUND_ROBIN'
                ? 'bg-primary/10 border-primary shadow-sm'
                : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">sync_alt</span>
                <span>Round-Robin Auto-Push</span>
              </span>
              {routingMode === 'ROUND_ROBIN' && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              The Revenue Engine automatically assigns incoming qualified leads to active, available team members sequentially, matching Closers for high-ticket deals and Setters for discovery.
            </p>
          </div>

          {/* 3. Owner Manual Assignment */}
          <div 
            onClick={() => handleRoutingModeChange('OWNER_MANUAL')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              routingMode === 'OWNER_MANUAL'
                ? 'bg-primary/10 border-primary shadow-sm'
                : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">how_to_reg</span>
                <span>Owner Manual Assignment</span>
              </span>
              {routingMode === 'OWNER_MANUAL' && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Leads remain unassigned until the business owner or sales director reviews the lead's buying intent and manually selects the designated closer from the dropdown.
            </p>
          </div>
        </div>
      </div>

      {/* Team Roster Table with Rates & Calendar Transparency */}
      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Active Team Roster & Performance Ledger</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Transparent commission rates, Google Calendar sync status, and performance tracking
            </p>
          </div>
          <div className="text-xs text-on-surface-variant font-medium">
            {members.length} Members Registered
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                <th className="p-4">Team Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Commission Rate</th>
                <th className="p-4">Google Calendar</th>
                <th className="p-4">Leads / Won Deals</th>
                <th className="p-4">Commission Earned</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {members.map((member) => {
                const displayName = member.user.name || member.user.email.split('@')[0];
                const leadCount = stats.memberLeadCounts[member.user.id] || 0;
                const mStats = stats.memberStats?.[member.user.id] || { wonCount: 0, wonVolume: 0, totalCommission: 0, activeAppointments: 0 };

                let roleBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (member.role === 'CLOSER') {
                  roleBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                } else if (member.role === 'SETTER') {
                  roleBadgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                } else if (member.role === 'ADMIN') {
                  roleBadgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                }

                const rateFormatted = member.commissionType === 'PERCENTAGE' 
                  ? `${member.commissionRate ?? 10}%` 
                  : `₦${Number(member.commissionRate || 0).toLocaleString()}/deal`;

                return (
                  <tr key={member.id} className="hover:bg-surface-container/30 transition-colors">
                    {/* Member Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {displayName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-sm">{displayName}</div>
                          <div className="text-[11px] font-mono text-on-surface-variant">{member.user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase ${roleBadgeColor}`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {member.role === 'CLOSER' ? 'verified' : member.role === 'SETTER' ? 'event_available' : 'badge'}
                        </span>
                        <span>{member.role}</span>
                      </span>
                    </td>

                    {/* Commission Rate */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {rateFormatted}
                        </span>
                        {isOwnerOrAdmin && (
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setEditRate(member.commissionRate ?? 10);
                              setEditType((member.commissionType as any) || 'PERCENTAGE');
                            }}
                            className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container transition-colors"
                            title="Edit Commission Rate"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Google Calendar Status */}
                    <td className="p-4">
                      {member.googleCalendarConnected ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Google Calendar Synced</span>
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono truncate max-w-[140px]">
                            {member.googleCalendarEmail || member.user.email}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          <span>Not Connected</span>
                        </span>
                      )}
                    </td>

                    {/* Leads / Won Deals */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{leadCount} in workflow</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">{mStats.wonCount} won ({mStats.activeAppointments} appts)</span>
                      </div>
                    </td>

                    {/* Commission Earned */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-on-surface">₦{mStats.totalCommission.toLocaleString()}</span>
                        <span className="text-[10px] text-on-surface-variant">from ₦{(mStats.wonVolume / 1000000).toFixed(1)}M volume</span>
                      </div>
                    </td>

                    {/* Availability Toggle */}
                    <td className="p-4">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleAvailability(member.id, member.isAvailable, displayName)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          member.isAvailable
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${member.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-outline'}`}></span>
                        <span>{member.isAvailable ? 'Available' : 'Away'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {isOwnerOrAdmin && (
                        <button
                          disabled={isPending}
                          onClick={() => handleRemoveMember(member.id, displayName)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Remove from Workspace"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Commission Rate Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">Configure Commission Rate</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Set payout terms for {editingMember.user.name || editingMember.user.email}
                </p>
              </div>
              <button 
                onClick={() => setEditingMember(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Commission Payout Structure
                </label>
                <select
                  value={editType}
                  onChange={(e: any) => setEditType(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                >
                  <option value="PERCENTAGE">Percentage of Won Deal Value (%)</option>
                  <option value="FIXED_PER_DEAL">Fixed Payout per Closed Deal (₦)</option>
                  <option value="FIXED_PER_APPOINTMENT">Fixed Payout per Qualified Appointment (₦)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  {editType === 'PERCENTAGE' ? 'Commission Rate (%)' : 'Payout Amount (₦ NGN)'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={editRate}
                  onChange={(e) => setEditRate(Number(e.target.value))}
                  placeholder={editType === 'PERCENTAGE' ? 'e.g. 10 or 15' : 'e.g. 50000'}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary font-mono"
                  required
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  {editType === 'PERCENTAGE' 
                    ? `Whenever this rep marks a deal as WON, ${editRate}% is automatically credited to their commission ledger.`
                    : `Rep will be credited ₦${Number(editRate).toLocaleString()} upon completion.`}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isPending ? 'Saving...' : 'Save Commission Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">Add Team Member</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Invite a Closer, Setter, or Workspace Administrator
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="closer@company.com"
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Assigned Workspace Role
                </label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                >
                  <option value="CLOSER">High-Ticket Sales Closer</option>
                  <option value="SETTER">Appointment Setter (Discovery)</option>
                  <option value="ADMIN">Organization Administrator</option>
                  <option value="MEMBER">Standard Team Member</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isPending ? 'Adding...' : 'Confirm & Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
