'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  addTenantTeamMember, 
  removeTenantTeamMember, 
  toggleMemberAvailability, 
  updateTenantRoutingMode,
  updateMemberCommission 
} from '@/app/(saas)/actions';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Sparkles, 
  X, 
  Info, 
  ArrowRight, 
  Check, 
  ExternalLink,
  Target,
  Briefcase,
  Percent,
  Clock,
  Layers,
  Search,
  Filter
} from 'lucide-react';

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
  subscription?: {
    plan: string;
    maxInternalSeats: number;
    internalSeatsUsed: number;
    pricePerMonth: number;
    currency: string;
  };
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
  subscription,
  stats,
  currentUserRole,
}: TeamPageClientProps) {
  const [routingMode, setRoutingMode] = useState<'OPEN_POOL' | 'ROUND_ROBIN' | 'OWNER_MANUAL'>(
    (organization.leadRoutingMode as any) || 'OPEN_POOL'
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleMatrixModal, setShowRoleMatrixModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editRate, setEditRate] = useState<number>(10);
  const [editType, setEditType] = useState<'PERCENTAGE' | 'FIXED_PER_DEAL' | 'FIXED_PER_APPOINTMENT'>('PERCENTAGE');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // New member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'SETTER' | 'CLOSER' | 'ADMIN' | 'MANAGER' | 'MEMBER'>('CLOSER');

  const canManageTeam = ['OWNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(currentUserRole);

  const internalMembers = members.filter(m => m.role !== 'EXTERNAL_PROFESSIONAL');
  const maxSeats = subscription?.maxInternalSeats ?? 3;
  const seatsUsed = internalMembers.length;
  const isSeatLimitReached = seatsUsed >= maxSeats;
  const seatPercentage = Math.min(100, Math.round((seatsUsed / maxSeats) * 100));

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRoutingModeChange = (mode: 'OPEN_POOL' | 'ROUND_ROBIN' | 'OWNER_MANUAL') => {
    setRoutingMode(mode);
    startTransition(async () => {
      try {
        await updateTenantRoutingMode(mode);
        showToast(`Lead distribution updated to ${mode.replace(/_/g, ' ')}.`);
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
      alert('Please enter a valid work email address');
      return;
    }

    if (isSeatLimitReached) {
      alert(`Seat limit reached (${seatsUsed}/${maxSeats} seats used). Please upgrade to the Pro plan in Billing to add more team members.`);
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
        showToast(`Added ${newName || newEmail} as ${newRole}.`);
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
        showToast(`Updated ${name}'s commission rate to ${editRate}${editType === 'PERCENTAGE' ? '%' : ' NGN'}.`);
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

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      (m.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#121c1a] border border-[#248277]/50 text-white shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-[#45bfae] shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-full border border-[#248277]/20 mb-2">
            <Users size={13} />
            <span>Sales Force Governance</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Team & Sales Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-[11px] font-bold tracking-wider uppercase">
              {organization.name}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Manage your Closers, Appointment Setters, lead distribution routing, and commission rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRoleMatrixModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-[#45bfae]" />
            <span>Role & Permissions Matrix</span>
          </button>

          {canManageTeam && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs shadow-lg shadow-[#248277]/20 transition-all flex items-center gap-2"
            >
              <UserPlus size={15} />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-KPI Operational Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Closers */}
        <div className="p-5 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Closers</span>
            <ShieldCheck size={18} className="text-[#45bfae]" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.totalClosers}</div>
          <div className="text-[11px] text-gray-400 mt-1">High-ticket deals & proposal negotiations</div>
        </div>

        {/* Total Setters */}
        <div className="p-5 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Appointment Setters</span>
            <Calendar size={18} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.totalSetters}</div>
          <div className="text-[11px] text-gray-400 mt-1">Discovery calls & booking qualified demos</div>
        </div>

        {/* Assigned Leads */}
        <div className="p-5 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Leads in Workflow</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">{stats.totalAssignedLeads}</div>
          <div className="text-[11px] text-gray-400 mt-1">Claimed & actively engaged by reps</div>
        </div>

        {/* Unassigned Pool */}
        <div className="p-5 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open Pool (Unassigned)</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">{stats.totalUnassignedLeads}</div>
          <div className="text-[11px] text-gray-400 mt-1">Ready to be claimed or auto-routed</div>
        </div>
      </div>

      {/* Workspace Seat Utilization & Plan Capacity Bar */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-[#45bfae]" />
              <span>Workspace Seat Capacity</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {subscription?.plan || 'Starter'} Workspace Tier: <strong className="text-white font-semibold">{seatsUsed} of {maxSeats} seats assigned</strong> ({Math.max(0, maxSeats - seatsUsed)} remaining)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSeatLimitReached && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                Seat Limit Reached
              </span>
            )}
            <Link
              href="/billing"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Manage Seats in Billing</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#0a0d12] rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isSeatLimitReached ? 'bg-amber-400' : 'bg-gradient-to-r from-[#248277] to-[#45bfae]'
              }`}
              style={{ width: `${Math.max(5, seatPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-gray-500">
            <span>* Remote sales professionals on managed pilots do not count against internal seat quotas.</span>
            <span>{seatPercentage}% capacity used</span>
          </div>
        </div>
      </div>

      {/* Lead Routing Configuration Strip */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl space-y-4">
        <div>
          <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Sliders size={16} className="text-[#45bfae]" />
            <span>Inbound Lead Routing Engine</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Determines how new qualified leads from website forms, WhatsApp, and marketing campaigns are allocated to your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Option 1: Open Pool */}
          <button
            type="button"
            onClick={() => handleRoutingModeChange('OPEN_POOL')}
            disabled={!canManageTeam}
            className={`p-4 rounded-xl border text-left transition-all ${
              routingMode === 'OPEN_POOL'
                ? 'bg-[#121c1a] border-[#248277] shadow-lg'
                : 'bg-[#0a0d12] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-white">Open Pool (First-to-Claim)</span>
              {routingMode === 'OPEN_POOL' && <Check size={14} className="text-[#45bfae]" />}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Leads land in the shared inbox. Any available rep can claim and begin immediate outreach.
            </p>
          </button>

          {/* Option 2: Round Robin */}
          <button
            type="button"
            onClick={() => handleRoutingModeChange('ROUND_ROBIN')}
            disabled={!canManageTeam}
            className={`p-4 rounded-xl border text-left transition-all ${
              routingMode === 'ROUND_ROBIN'
                ? 'bg-[#121c1a] border-[#248277] shadow-lg'
                : 'bg-[#0a0d12] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-white">Automated Round-Robin</span>
              {routingMode === 'ROUND_ROBIN' && <Check size={14} className="text-[#45bfae]" />}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Sequentially distributes leads across active and available closers to maintain balanced workloads.
            </p>
          </button>

          {/* Option 3: Owner / Manager Manual */}
          <button
            type="button"
            onClick={() => handleRoutingModeChange('OWNER_MANUAL')}
            disabled={!canManageTeam}
            className={`p-4 rounded-xl border text-left transition-all ${
              routingMode === 'OWNER_MANUAL'
                ? 'bg-[#121c1a] border-[#248277] shadow-lg'
                : 'bg-[#0a0d12] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-white">Manual Manager Assignment</span>
              {routingMode === 'OWNER_MANUAL' && <Check size={14} className="text-[#45bfae]" />}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              All incoming leads require explicit triaging and manual assignment by an Organization Owner or Admin.
            </p>
          </button>
        </div>
      </div>

      {/* Team Members Roster */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-[#45bfae]" />
              <span>Workspace Members Roster ({members.length})</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Active closers, appointment setters, and workspace administrators.
            </p>
          </div>

          {/* Search and Role Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-xl bg-[#0a0d12] text-white border border-white/10 text-xs focus:outline-none focus:border-[#45bfae] transition-colors w-40 sm:w-48"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#0a0d12] text-gray-300 border border-white/10 text-xs focus:outline-none focus:border-[#45bfae]"
            >
              <option value="ALL">All Roles</option>
              <option value="CLOSER">Closers</option>
              <option value="SETTER">Setters</option>
              <option value="ADMIN">Admins</option>
              <option value="OWNER">Owners</option>
            </select>
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0a0d12]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 text-gray-400 bg-white/[0.01]">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Availability</th>
                <th className="py-3 px-4 font-semibold text-center">Assigned Leads</th>
                <th className="py-3 px-4 font-semibold text-center">Deals Won</th>
                <th className="py-3 px-4 font-semibold text-center">Commission</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredMembers.map((member) => {
                const leadCount = stats.memberLeadCounts[member.user.id] || 0;
                const mStat = stats.memberStats?.[member.user.id] || {
                  wonCount: 0,
                  wonVolume: 0,
                  totalCommission: 0,
                  activeAppointments: 0,
                };

                return (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Profile */}
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

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        member.role === 'OWNER'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : member.role === 'ADMIN'
                          ? 'bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30'
                          : member.role === 'CLOSER'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : member.role === 'SETTER'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {member.role}
                      </span>
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(member.id, member.isAvailable, member.user.name || member.user.email)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          member.isAvailable
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
                        <span>{member.isAvailable ? 'Available' : 'Away'}</span>
                      </button>
                    </td>

                    {/* Assigned Leads */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {leadCount}
                    </td>

                    {/* Deals Won */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-white">{mStat.wonCount}</span>
                      {mStat.wonVolume > 0 && (
                        <span className="block text-[10px] text-gray-400 font-mono">
                          ₦{mStat.wonVolume.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Commission */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-bold text-[#45bfae] font-mono">
                        {member.commissionRate ? `${member.commissionRate}%` : 'Standard'}
                      </span>
                      {mStat.totalCommission > 0 && (
                        <span className="block text-[10px] text-emerald-400 font-mono">
                          ₦{mStat.totalCommission.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManageTeam && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember(member);
                              setEditRate(member.commissionRate || 10);
                              setEditType((member.commissionType as any) || 'PERCENTAGE');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-[11px] border border-white/5 transition-colors"
                          >
                            Commission
                          </button>
                        )}

                        {canManageTeam && member.role !== 'OWNER' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id, member.user.name || member.user.email)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium text-[11px] border border-rose-500/20 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add Team Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1214] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#248277]/20 text-[#45bfae] flex items-center justify-center border border-[#248277]/40">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Invite Team Member</h3>
                  <p className="text-[11px] text-gray-400">Add a closer, setter, or manager to your workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {isSeatLimitReached && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Seat Limit Reached:</span> You are using all {maxSeats} seats under your current plan. Please upgrade to Pro in Billing to invite additional members.
                </div>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-200">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde Balogun"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#0a0d12] text-white border border-white/10 focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-200">Work Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tunde@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#0a0d12] text-white border border-white/10 focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-200">Workspace Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#0a0d12] text-white border border-white/10 focus:outline-none focus:border-[#45bfae]"
                >
                  <option value="CLOSER">Closer (Conducts demos, negotiates, closes deals)</option>
                  <option value="SETTER">Appointment Setter (Triages inbox, schedules calls)</option>
                  <option value="MANAGER">Sales Manager (Team oversight & lead routing)</option>
                  <option value="ADMIN">Administrator (Full workspace & billing access)</option>
                  <option value="MEMBER">General Member</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isSeatLimitReached}
                  className="px-5 py-2 rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold shadow-md disabled:opacity-50"
                >
                  {isPending ? 'Inviting...' : 'Confirm Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Commission */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1214] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Commission Settings</h3>
                  <p className="text-[11px] text-gray-400">{editingMember.user.name || editingMember.user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-200">Commission Structure</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#0a0d12] text-white border border-white/10 focus:outline-none focus:border-[#45bfae]"
                >
                  <option value="PERCENTAGE">Percentage of Closed Deal Volume (%)</option>
                  <option value="FIXED_PER_DEAL">Fixed Amount Per Closed Deal (NGN)</option>
                  <option value="FIXED_PER_APPOINTMENT">Fixed Amount Per Scheduled Demo (NGN)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-200">
                  {editType === 'PERCENTAGE' ? 'Commission Percentage Rate (%)' : 'Fixed Payout (NGN)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={editType === 'PERCENTAGE' ? '100' : '10000000'}
                  step={editType === 'PERCENTAGE' ? '0.5' : '1000'}
                  required
                  value={editRate}
                  onChange={(e) => setEditRate(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#0a0d12] text-white border border-white/10 focus:outline-none focus:border-[#45bfae] font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold shadow-md disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Commission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Role & Permissions Matrix */}
      {showRoleMatrixModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0f1214] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#248277]/20 text-[#45bfae] flex items-center justify-center border border-[#248277]/40">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Role & Permissions Matrix</h3>
                  <p className="text-[11px] text-gray-400">Enterprise governance and access control across CloseCraft</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleMatrixModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              {/* OWNER & ADMIN */}
              <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Owner & Administrator</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">FULL ACCESS</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Full control over billing subscriptions, Bachs checkout, team member invites, lead routing policy, AI qualification rules, and data exports.
                </p>
              </div>

              {/* CLOSER */}
              <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Closer</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">SALES CLOSING</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Access to Sales Command Centre, Unified Inbox, Deal Pipeline, scheduled video appointments, proposal creation, and personal commission tracking.
                </p>
              </div>

              {/* SETTER */}
              <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Appointment Setter</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">PROSPECT TRIAGE</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Access to incoming lead streams, WhatsApp outreach, conversation triage, calendar scheduling for closers, and setter appointment bonuses.
                </p>
              </div>

              {/* MANAGER */}
              <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Sales Operations Manager</span>
                  <span className="px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] text-[10px] font-bold">OPERATIONS</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Team performance oversight, round-robin routing controls, call review queues, rep commission adjustments, and revenue leakage detection.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRoleMatrixModal(false)}
                className="px-5 py-2 rounded-xl bg-[#45bfae] text-[#0f1214] font-bold text-xs"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
