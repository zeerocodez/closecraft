'use client';

import React, { useState, useTransition } from 'react';
import { 
  addTenantTeamMember, 
  removeTenantTeamMember, 
  toggleMemberAvailability, 
  updateTenantRoutingMode 
} from '@/app/(saas)/actions';

interface Member {
  id: string;
  role: string;
  isAvailable: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
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
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // New member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'SETTER' | 'CLOSER' | 'ADMIN' | 'MEMBER'>('CLOSER');

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
    <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Sales Operations & Team Roster</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high font-mono text-on-surface-variant">
              /{organization.slug}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
            Team, Setters & Closers
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Empower your appointment setters and high-ticket closers. Configure automated lead push, open claim pools, and monitor team lead velocity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-md active:scale-[0.99] shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Sales Closers</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface">{stats.totalClosers}</div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            High-ticket closing capacity
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Appointment Setters</span>
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface">{stats.totalSetters}</div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            Discovery & demo qualification
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Claimed Leads in Workflow</span>
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">work_history</span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface">{stats.totalAssignedLeads}</div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            Actively worked by team members
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Open Lead Pool</span>
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inbox</span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{stats.totalUnassignedLeads}</div>
          <div className="text-xs text-on-surface-variant mt-2 font-medium">
            Available for any setter or closer to claim
          </div>
        </div>
      </div>

      {/* Lead Routing Configuration Card */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">alt_route</span>
              <h2 className="text-base font-bold text-on-surface">Lead Distribution & Routing Engine</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Choose how qualified inbound leads are pushed to your sales team
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Active: {routingMode.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Open Team Pool */}
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
                <span>Open Team Pool (First-to-Claim)</span>
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

      {/* Team Roster Table */}
      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Active Team Roster</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Manage roles, availability status for incoming leads, and lead allocations
            </p>
          </div>
          <div className="text-xs text-on-surface-variant font-medium">
            {members.length} Total Team Members
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                <th className="p-4">Team Member</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Lead Status & Availability</th>
                <th className="p-4">Active Leads Claimed</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {members.map((member) => {
                const displayName = member.user.name || member.user.email.split('@')[0];
                const leadCount = stats.memberLeadCounts[member.user.id] || 0;

                let roleBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (member.role === 'CLOSER') {
                  roleBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                } else if (member.role === 'SETTER') {
                  roleBadgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                } else if (member.role === 'ADMIN') {
                  roleBadgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                }

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
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${roleBadgeColor}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {member.role === 'CLOSER' ? 'verified' : member.role === 'SETTER' ? 'event_available' : 'badge'}
                        </span>
                        <span>{member.role}</span>
                      </span>
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
                        <span className={`w-2 h-2 rounded-full ${member.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-outline'}`} />
                        <span>{member.isAvailable ? '🟢 Available for Leads' : '⚪ Away / In Calls'}</span>
                      </button>
                    </td>

                    {/* Active Leads */}
                    <td className="p-4">
                      <div className="font-bold text-on-surface text-sm">
                        {leadCount} <span className="font-normal text-xs text-on-surface-variant">leads</span>
                      </div>
                    </td>

                    {/* Action Controls */}
                    <td className="p-4 text-right">
                      {currentUserRole === 'ADMIN' && (
                        <button
                          disabled={isPending}
                          onClick={() => handleRemoveMember(member.id, displayName)}
                          title="Remove from Workspace"
                          className="p-1.5 text-on-surface-variant hover:text-rose-400 rounded-lg hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
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

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                <h3 className="font-bold text-base text-on-surface">Add Team Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
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
                  placeholder="e.g. Sarah Jenkins or Chidi Closer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@yourbusiness.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Assigned Team Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="CLOSER">Sales Closer (High-ticket calls, closing, negotiations)</option>
                  <option value="SETTER">Appointment Setter (Discovery, qualifying, calendar booking)</option>
                  <option value="ADMIN">Manager / Workspace Admin (Full pipeline & team control)</option>
                  <option value="MEMBER">Standard Team Member</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{isPending ? "Adding..." : "Add to Organization"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
