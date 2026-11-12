'use client';

import React, { useState, useTransition } from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  createStaffAccountAction,
  updateStaffStatusAction,
  createServiceDeliveryTaskAction,
  updateDeliveryTaskStatusAction,
  reviewDeliveryTaskAction,
  assignClientTeamAction,
  deleteDeliveryTaskAction,
} from '@/app/(saas)/operator/workforceActions';
import { getStaffRoleLabel, StaffRole } from '@/lib/permissions/matrix';

interface StaffItem {
  id: string;
  userId: string;
  role: string;
  department: string;
  phone?: string | null;
  timezone: string;
  weeklyCapacity: number;
  status: string;
  skills: string[];
  notes?: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role: string;
  } | null;
  assignedTasks?: Array<{
    id: string;
    status: string;
    priority: string;
    dueDate?: string | Date | null;
  }>;
  activeTasksCount?: number;
  completedTasksCount?: number;
}

interface DeliveryTaskItem {
  id: string;
  organizationId: string;
  clientServiceId?: string | null;
  assignedStaffId?: string | null;
  title: string;
  description?: string | null;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED';
  dueDate?: string | Date | null;
  deliverableUrl?: string | null;
  completionNotes?: string | null;
  submittedAt?: string | Date | null;
  completedAt?: string | Date | null;
  reviewedByUserId?: string | null;
  clientFeedback?: string | null;
  clientApproved: boolean;
  createdAt: string | Date;
  organization?: { id: string; name: string };
  clientService?: { id: string; name: string; category: string; tier?: string | null; progressPercent: number } | null;
  assignedStaff?: {
    id: string;
    role: string;
    user?: { id: string; name: string | null; email: string } | null;
  } | null;
}

interface ClientServiceSummary {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  tier?: string | null;
  status: string;
  progressPercent: number;
  assignedTeamMember?: string | null;
  assignedUserId?: string | null;
  accountManagerEmail?: string | null;
  startDate: string | Date;
  paidThroughDate?: string | Date | null;
  organization: { id: string; name: string };
  deliveryTasks?: any[];
}

interface RemoteWorkforceSectionProps {
  staffProfiles: StaffItem[];
  deliveryTasks: DeliveryTaskItem[];
  clientServices: ClientServiceSummary[];
  organizations: Array<{ id: string; name: string }>;
  performanceMetrics?: {
    totalWonDeals: number;
    totalClosedRevenue: number;
    totalAppointments: number;
    totalLeads: number;
    qualifiedLeads: number;
  };
}

export default function RemoteWorkforceSection({
  staffProfiles = [],
  deliveryTasks = [],
  clientServices = [],
  organizations = [],
  performanceMetrics = {
    totalWonDeals: 0,
    totalClosedRevenue: 0,
    totalAppointments: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
  },
}: RemoteWorkforceSectionProps) {
  const [subTab, setSubTab] = useState<'tasks' | 'staff' | 'clients' | 'performance'>('tasks');
  const [isPending, startTransition] = useTransition();

  // Task Filter State
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('ALL');
  const [taskFilterCategory, setTaskFilterCategory] = useState<string>('ALL');
  const [taskSearch, setTaskSearch] = useState<string>('');

  // Modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<DeliveryTaskItem | null>(null);
  const [assigningService, setAssigningService] = useState<ClientServiceSummary | null>(null);

  // New Task Form State
  const [newTaskOrgId, setNewTaskOrgId] = useState('');
  const [newTaskServiceId, setNewTaskServiceId] = useState('');
  const [newTaskStaffId, setNewTaskStaffId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('LEAD_GENERATION');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // New Staff Form State
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('ACCOUNT_MANAGER');
  const [newStaffDept, setNewStaffDept] = useState('OPERATIONS');
  const [newStaffCapacity, setNewStaffCapacity] = useState(40);
  const [newStaffSkills, setNewStaffSkills] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Review Form State
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Assign Team Form State
  const [assignStaffId, setAssignStaffId] = useState('');
  const [assignTeamName, setAssignTeamName] = useState('');
  const [assignEmail, setAssignEmail] = useState('');

  // Filtered Tasks
  const filteredTasks = deliveryTasks.filter((task) => {
    if (taskFilterStatus !== 'ALL' && task.status !== taskFilterStatus) return false;
    if (taskFilterCategory !== 'ALL' && task.category !== taskFilterCategory) return false;
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchOrg = task.organization?.name.toLowerCase().includes(q);
      const matchStaff = task.assignedStaff?.user?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchStaff) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalTasks = deliveryTasks.length;
  const completedTasks = deliveryTasks.filter((t) => t.status === 'COMPLETED').length;
  const inReviewTasks = deliveryTasks.filter((t) => t.status === 'IN_REVIEW').length;
  const openTasks = deliveryTasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length;
  const overdueTasks = deliveryTasks.filter((t) => {
    if (t.status === 'COMPLETED') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const fleetSlaRate = totalTasks > 0 ? Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) : 100;
  const activeStaffCount = staffProfiles.filter((s) => s.status === 'ACTIVE').length;

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskOrgId || !newTaskTitle.trim()) return;

    startTransition(async () => {
      try {
        await createServiceDeliveryTaskAction({
          organizationId: newTaskOrgId,
          clientServiceId: newTaskServiceId || undefined,
          assignedStaffId: newTaskStaffId || undefined,
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || undefined,
          category: newTaskCategory,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        });
        setShowNewTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskDueDate('');
      } catch (err: any) {
        alert(err.message || 'Failed to create task');
      }
    });
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !newStaffName.trim()) return;

    startTransition(async () => {
      try {
        await createStaffAccountAction({
          email: newStaffEmail.trim(),
          name: newStaffName.trim(),
          role: newStaffRole,
          department: newStaffDept,
          weeklyCapacity: Number(newStaffCapacity),
          skills: newStaffSkills ? newStaffSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          phone: newStaffPhone.trim() || undefined,
        });
        setShowNewStaffModal(false);
        setNewStaffEmail('');
        setNewStaffName('');
        setNewStaffSkills('');
        setNewStaffPhone('');
      } catch (err: any) {
        alert(err.message || 'Failed to create staff account');
      }
    });
  };

  const handleReviewDecision = async (decision: 'APPROVE' | 'REQUEST_CHANGES') => {
    if (!reviewingTask) return;
    startTransition(async () => {
      try {
        await reviewDeliveryTaskAction({
          taskId: reviewingTask.id,
          decision,
          feedback: reviewFeedback,
        });
        setReviewingTask(null);
        setReviewFeedback('');
      } catch (err: any) {
        alert(err.message || 'Failed to review deliverable');
      }
    });
  };

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningService || !assignTeamName.trim()) return;

    startTransition(async () => {
      try {
        await assignClientTeamAction({
          clientServiceId: assigningService.id,
          assignedStaffId: assignStaffId || undefined,
          assignedTeamMember: assignTeamName.trim(),
          accountManagerEmail: assignEmail.trim() || 'sales@closecrafthq.com',
        });
        setAssigningService(null);
        setAssignTeamName('');
        setAssignEmail('');
      } catch (err: any) {
        alert(err.message || 'Failed to assign team');
      }
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/20 text-zinc-400">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><Icon name="CheckCircle" size={12} /> Completed</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1"><Icon name="Eye" size={12} /> In Review</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><Icon name="Play" size={12} /> In Progress</span>;
      case 'BLOCKED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1"><Icon name="AlertCircle" size={12} /> Blocked</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-container-high text-on-surface-variant flex items-center gap-1"><Icon name="Clock" size={12} /> Todo</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Active Remote Staff</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{activeStaffCount}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">Distributed Team</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="Users" size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Active Deliverables</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{openTasks}</p>
            <p className="text-[11px] text-primary mt-0.5 font-medium">{inReviewTasks} In Review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Icon name="Layers" size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Completed Milestones</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{completedTasks}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">Verified Delivery</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Icon name="CheckCircle" size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Delivery SLA Rate</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{fleetSlaRate}%</p>
            <p className={`text-[11px] font-medium mt-0.5 ${overdueTasks > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {overdueTasks > 0 ? `${overdueTasks} Overdue Tasks` : '100% On Time'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Icon name="Clock" size={20} />
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'tasks' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Icon name="CheckSquare" size={14} />
            <span>Task Allocation & Delivery</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container-highest">
              {deliveryTasks.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('staff')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'staff' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Icon name="Users" size={14} />
            <span>Staff Roster & Roles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container-highest">
              {staffProfiles.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('clients')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'clients' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Icon name="Briefcase" size={14} />
            <span>Client Assignment & Services</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container-highest">
              {clientServices.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('performance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'performance' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Icon name="TrendingUp" size={14} />
            <span>Workforce Performance</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {subTab === 'tasks' && (
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <Icon name="Plus" size={14} />
              <span>Allocate Delivery Task</span>
            </button>
          )}

          {subTab === 'staff' && (
            <button
              onClick={() => setShowNewStaffModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <Icon name="UserPlus" size={14} />
              <span>Add Remote Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: TASK ALLOCATION & DELIVERY QUEUE */}
      {/* ========================================================================= */}
      {subTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Icon name="Search" size={16} className="text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by task title, client, or assignee..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={taskFilterStatus}
                onChange={(e) => setTaskFilterStatus(e.target.value)}
                className="bg-surface-container px-3 py-1.5 rounded-xl text-xs text-on-surface font-medium border border-outline-variant/30 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>

              <select
                value={taskFilterCategory}
                onChange={(e) => setTaskFilterCategory(e.target.value)}
                className="bg-surface-container px-3 py-1.5 rounded-xl text-xs text-on-surface font-medium border border-outline-variant/30 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="LEAD_GENERATION">Lead Generation</option>
                <option value="LEAD_MANAGEMENT">Lead Management</option>
                <option value="APPOINTMENT_SETTING">Appointment Setting</option>
                <option value="SALES_CLOSING">Sales Closing</option>
                <option value="SALES_ENABLEMENT">Sales Enablement</option>
              </select>
            </div>
          </div>

          {/* Tasks Table / Cards */}
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-surface-container-low border border-outline-variant/30">
              <Icon name="CheckSquare" size={32} className="mx-auto text-on-surface-variant/40 mb-3" />
              <p className="text-sm font-bold text-on-surface">No delivery tasks found</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Allocate your first task to remote specialists to kick off service delivery.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const isOverdue = task.status !== 'COMPLETED' && task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {task.category.replace(/_/g, ' ')}
                        </span>
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Overdue
                          </span>
                        )}
                        {task.clientApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Client Approved
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-on-surface">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-on-surface-variant pt-1">
                        <span className="flex items-center gap-1 font-medium text-on-surface">
                          <Icon name="Building" size={13} className="text-primary" />
                          {task.organization?.name || 'Client Workspace'}
                        </span>

                        <span className="flex items-center gap-1">
                          <Icon name="User" size={13} />
                          {task.assignedStaff?.user?.name ? (
                            <span>{task.assignedStaff.user.name} ({getStaffRoleLabel(task.assignedStaff.role)})</span>
                          ) : (
                            <span className="text-amber-400">Unassigned</span>
                          )}
                        </span>

                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={13} />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}

                        {task.deliverableUrl && (
                          <a
                            href={task.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary font-bold hover:underline"
                          >
                            <Icon name="ExternalLink" size={13} />
                            View Deliverable
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Task Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === 'IN_REVIEW' && (
                        <button
                          onClick={() => setReviewingTask(task)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 shadow-sm"
                        >
                          <Icon name="Eye" size={14} />
                          <span>Review Proof</span>
                        </button>
                      )}

                      {task.status === 'TODO' && (
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              await updateDeliveryTaskStatusAction({ taskId: task.id, status: 'IN_PROGRESS' });
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-bold flex items-center gap-1 hover:opacity-90"
                        >
                          <Icon name="Play" size={14} />
                          <span>Start</span>
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setReviewingTask(task)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold flex items-center gap-1 hover:opacity-90"
                        >
                          <Icon name="UploadCloud" size={14} />
                          <span>Submit Work</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Delete this delivery task?')) {
                            startTransition(async () => {
                              await deleteDeliveryTaskAction(task.id);
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-rose-400 hover:bg-surface-container"
                        title="Delete Task"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: REMOTE STAFF ROSTER & ROLES */}
      {/* ========================================================================= */}
      {subTab === 'staff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffProfiles.map((staff) => {
              const activeTasks = staff.assignedTasks?.filter(
                (t) => t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW'
              ).length || 0;

              return (
                <div
                  key={staff.id}
                  className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between shadow-sm space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                          {staff.user?.name ? staff.user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">{staff.user?.name || 'Staff Member'}</h4>
                          <p className="text-xs text-on-surface-variant">{staff.user?.email}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        staff.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {staff.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant font-medium">Role:</span>
                        <span className="font-bold text-primary">{getStaffRoleLabel(staff.role)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant font-medium">Department:</span>
                        <span className="text-on-surface font-semibold">{staff.department}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant font-medium">Capacity:</span>
                        <span className="text-on-surface">{staff.weeklyCapacity}h / week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant font-medium">Active Tasks:</span>
                        <span className="font-bold text-sky-400">{activeTasks} tasks</span>
                      </div>
                    </div>

                    {staff.skills && staff.skills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-on-surface-variant">Core Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {staff.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-surface-container-high text-[10px] text-on-surface">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-on-surface-variant">TZ: {staff.timezone}</span>
                    <button
                      onClick={() => {
                        const newStatus = staff.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE';
                        startTransition(async () => {
                          await updateStaffStatusAction({ staffId: staff.id, status: newStatus });
                        });
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Set to {staff.status === 'ACTIVE' ? 'On Leave' : 'Active'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: CLIENT ASSIGNMENT & SERVICE DELIVERY TRACKING */}
      {/* ========================================================================= */}
      {subTab === 'clients' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientServices.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {service.category.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {service.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-on-surface">{service.name}</h4>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Icon name="Building" size={13} className="text-primary" />
                      Client: <span className="font-semibold text-on-surface">{service.organization.name}</span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Service Delivery Completion</span>
                      <span className="text-primary font-bold">{service.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${service.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Account Manager */}
                  <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[11px] text-on-surface-variant font-medium">Assigned Delivery Team</p>
                      <p className="font-bold text-on-surface">{service.assignedTeamMember || 'CloseCraft Operations Lead'}</p>
                      <p className="text-[11px] text-on-surface-variant">{service.accountManagerEmail || 'sales@closecrafthq.com'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setAssigningService(service);
                        setAssignTeamName(service.assignedTeamMember || '');
                        setAssignEmail(service.accountManagerEmail || 'sales@closecrafthq.com');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest border border-outline-variant/30"
                    >
                      Assign Team
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Started {new Date(service.startDate).toLocaleDateString()}</span>
                  <span className="text-emerald-400 font-semibold">Delivery On-Track</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: WORKFORCE PERFORMANCE DASHBOARD */}
      {/* ========================================================================= */}
      {subTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Appointment Setters Card */}
            <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Appointment Setters</span>
                <Icon name="PhoneCall" size={18} className="text-primary" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total Inbound Leads:</span>
                  <span className="font-bold text-on-surface">{performanceMetrics.totalLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Qualified Leads:</span>
                  <span className="font-bold text-emerald-400">{performanceMetrics.qualifiedLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Appointments Booked:</span>
                  <span className="font-bold text-sky-400">{performanceMetrics.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                  <span className="text-on-surface-variant font-medium">Qualification Rate:</span>
                  <span className="font-bold text-primary">
                    {performanceMetrics.totalLeads > 0
                      ? Math.round((performanceMetrics.qualifiedLeads / performanceMetrics.totalLeads) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Sales Closers Card */}
            <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Sales Closers</span>
                <Icon name="DollarSign" size={18} className="text-emerald-400" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Discovery Calls / Deals:</span>
                  <span className="font-bold text-on-surface">{performanceMetrics.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Won Closed Deals:</span>
                  <span className="font-bold text-emerald-400">{performanceMetrics.totalWonDeals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total Closed Revenue:</span>
                  <span className="font-bold text-emerald-400">
                    ₦{performanceMetrics.totalClosedRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                  <span className="text-on-surface-variant font-medium">Closing Win Rate:</span>
                  <span className="font-bold text-emerald-400">
                    {performanceMetrics.totalAppointments > 0
                      ? Math.round((performanceMetrics.totalWonDeals / performanceMetrics.totalAppointments) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Marketing Specialists Card */}
            <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Marketing Specialists</span>
                <Icon name="Target" size={18} className="text-sky-400" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Active Ad Campaigns:</span>
                  <span className="font-bold text-on-surface">
                    {clientServices.filter((s) => s.category === 'LEAD_GENERATION').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Leads Delivered:</span>
                  <span className="font-bold text-sky-400">{performanceMetrics.totalLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Marketing Tasks Done:</span>
                  <span className="font-bold text-emerald-400">
                    {deliveryTasks.filter((t) => t.category === 'LEAD_GENERATION' && t.status === 'COMPLETED').length}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                  <span className="text-on-surface-variant font-medium">Deliverable Accuracy:</span>
                  <span className="font-bold text-sky-400">98.4%</span>
                </div>
              </div>
            </div>

            {/* 4. Account Managers Card */}
            <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Account Managers</span>
                <Icon name="Briefcase" size={18} className="text-amber-400" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Client Accounts:</span>
                  <span className="font-bold text-on-surface">{clientServices.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Deliverables Completed:</span>
                  <span className="font-bold text-emerald-400">{completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Pending Review:</span>
                  <span className="font-bold text-purple-400">{inReviewTasks}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                  <span className="text-on-surface-variant font-medium">Delivery SLA Adherence:</span>
                  <span className="font-bold text-amber-400">{fleetSlaRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Policy Note */}
          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-start gap-3 text-xs text-on-surface-variant">
            <Icon name="ShieldCheck" size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-on-surface">Privacy-Preserving Workforce Operations</p>
              <p className="mt-0.5 leading-relaxed">
                CloseCraft coordinates remote teams using outcome-based deliverables, clear milestones, and verified client approvals. We do not use invasive keystroke logging or background surveillance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALLOCATE DELIVERY TASK */}
      {/* ========================================================================= */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">Allocate Service Delivery Task</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Target Client Organization *</label>
                <select
                  required
                  value={newTaskOrgId}
                  onChange={(e) => {
                    setNewTaskOrgId(e.target.value);
                    const matchingService = clientServices.find((s) => s.organizationId === e.target.value);
                    if (matchingService) setNewTaskServiceId(matchingService.id);
                  }}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                >
                  <option value="">Select client workspace...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Ads Campaign Launch & Audience Setup"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Category *</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  >
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="LEAD_MANAGEMENT">Lead Management</option>
                    <option value="APPOINTMENT_SETTING">Appointment Setting</option>
                    <option value="SALES_CLOSING">Sales Closing</option>
                    <option value="SALES_ENABLEMENT">Sales Enablement</option>
                    <option value="GENERAL">General Setup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Assign Staff Member</label>
                  <select
                    value={newTaskStaffId}
                    onChange={(e) => setNewTaskStaffId(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  >
                    <option value="">Leave Unassigned</option>
                    {staffProfiles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.name || s.user?.email} ({getStaffRoleLabel(s.role)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Description / Deliverable Criteria</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions and deliverables required for approval..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? 'Allocating...' : 'Allocate Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD REMOTE STAFF */}
      {/* ========================================================================= */}
      {showNewStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">Add Remote Staff Member</h3>
              <button
                onClick={() => setShowNewStaffModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Adekunle"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="samuel@closecrafthq.com"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Role Permission *</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  >
                    <option value="ACCOUNT_MANAGER">Account Manager</option>
                    <option value="MARKETING_SPECIALIST">Marketing Specialist</option>
                    <option value="ADS_SPECIALIST">Paid Ads Specialist</option>
                    <option value="SETTER">Appointment Setter</option>
                    <option value="CLOSER">Sales Closer</option>
                    <option value="LEAD_MANAGER">Lead Manager</option>
                    <option value="OPERATIONS_MANAGER">Operations Manager</option>
                    <option value="SALES_TRAINER">Sales Trainer</option>
                    <option value="SUPPORT_REP">Support Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Department</label>
                  <select
                    value={newStaffDept}
                    onChange={(e) => setNewStaffDept(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  >
                    <option value="OPERATIONS">Operations</option>
                    <option value="SALES">Sales</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="SUPPORT">Support</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Weekly Capacity (Hours)</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={newStaffCapacity}
                    onChange={(e) => setNewStaffCapacity(Number(e.target.value))}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Meta Ads, Lead Qualification, Objection Handling, CRM Setup"
                  value={newStaffSkills}
                  onChange={(e) => setNewStaffSkills(e.target.value)}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REVIEW DELIVERABLE */}
      {/* ========================================================================= */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">Review Deliverable Submission</h3>
              <button
                onClick={() => setReviewingTask(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 space-y-1">
                <p className="font-bold text-on-surface">{reviewingTask.title}</p>
                <p className="text-on-surface-variant">Client: {reviewingTask.organization?.name}</p>
                {reviewingTask.deliverableUrl && (
                  <p className="pt-1">
                    <a
                      href={reviewingTask.deliverableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Icon name="ExternalLink" size={13} />
                      {reviewingTask.deliverableUrl}
                    </a>
                  </p>
                )}
                {reviewingTask.completionNotes && (
                  <p className="text-on-surface-variant mt-1 text-[11px] leading-relaxed">
                    Notes: {reviewingTask.completionNotes}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Feedback / Quality Assessment</label>
                <textarea
                  rows={3}
                  placeholder="Optional notes or change requests..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewDecision('REQUEST_CHANGES')}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewDecision('APPROVE')}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md hover:bg-emerald-600"
                >
                  {isPending ? 'Approving...' : 'Approve & Mark Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN TEAM TO CLIENT SERVICE */}
      {/* ========================================================================= */}
      {assigningService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">Assign Delivery Team</h3>
              <button
                onClick={() => setAssigningService(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignTeam} className="space-y-3 text-xs">
              <div>
                <p className="text-on-surface-variant mb-1 font-medium">Service Package</p>
                <p className="font-bold text-on-surface">{assigningService.name}</p>
                <p className="text-[11px] text-on-surface-variant">Client: {assigningService.organization.name}</p>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Select Account Manager</label>
                <select
                  value={assignStaffId}
                  onChange={(e) => {
                    setAssignStaffId(e.target.value);
                    const selected = staffProfiles.find((s) => s.id === e.target.value);
                    if (selected?.user?.name) {
                      setAssignTeamName(`${selected.user.name} - ${getStaffRoleLabel(selected.role)}`);
                      setAssignEmail(selected.user.email);
                    }
                  }}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                >
                  <option value="">Choose from Staff Directory...</option>
                  {staffProfiles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user?.name || s.user?.email} ({getStaffRoleLabel(s.role)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Assigned Team Member Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emmanuel - Dedicated Account Manager"
                  value={assignTeamName}
                  onChange={(e) => setAssignTeamName(e.target.value)}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="sales@closecrafthq.com"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningService(null)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
