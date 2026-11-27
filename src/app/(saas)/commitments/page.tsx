import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { CommitmentTable } from '@/components/commitments/CommitmentTable';
import { OrderFulfilmentSection } from '@/components/commitments/OrderFulfilmentSection';
import { AddCommitmentModalWrapper } from '@/components/commitments/AddCommitmentModalWrapper';
import { 
  CheckSquare, 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

export const metadata = {
  title: 'Promise Ledger & Fulfilment Hub | CloseCraft HQ',
  description: 'Track customer promises, post-sale deliverables, deadlines, and balance collections to prevent churn and SLA leakage.'
};

export default async function CommitmentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // 1. Fetch Commitments
  const commitments = await db.customerCommitment.findMany({
    where: { organizationId },
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, orderNumber: true, agreedAmount: true, currency: true } }
    },
    orderBy: [{ isOverdue: 'desc' }, { dueDate: 'asc' }]
  });

  // 2. Fetch Orders
  const orders = await db.customerOrder.findMany({
    where: { organizationId },
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      commitments: { select: { id: true, title: true, status: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Fetch Leads for linking
  const leads = await db.lead.findMany({
    where: { organizationId },
    select: { id: true, name: true },
    orderBy: { updatedAt: 'desc' },
    take: 50
  });

  // KPI calculations
  const totalCommitments = commitments.length;
  const overdueCount = commitments.filter(c => c.isOverdue || c.status === 'OVERDUE').length;
  const completedCount = commitments.filter(c => c.status === 'COMPLETED').length;
  const pendingCount = commitments.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-lime/15 text-accent-lime border border-accent-lime/30 flex items-center gap-1.5 shadow-xs">
              <CheckSquare size={12} />
              <span>DELIVER PILLAR</span>
            </span>
            <span className="text-xs text-on-surface-variant font-medium">CloseCraft Revenue Operating System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-on-surface">
            Never lose track of what you promised a customer.
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            CloseCraft extracts promised deadlines, discounts, and custom deliverables from customer conversations, holding your team accountable so promises never fall through the cracks.
          </p>
        </div>

        <AddCommitmentModalWrapper leads={leads} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Promises</span>
          <p className="text-2xl font-mono font-bold text-on-surface mt-2">{pendingCount}</p>
          <span className="text-[10px] text-on-surface-variant mt-1">Pending delivery</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Overdue SLA Leaks</span>
          <p className="text-2xl font-mono font-bold text-rose-400 mt-2">{overdueCount}</p>
          <span className="text-[10px] text-rose-300 mt-1">Breaches SLA timer</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Fulfilled &amp; Verified</span>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-2">{completedCount}</p>
          <span className="text-[10px] text-emerald-300 mt-1">With completion evidence</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Total Customer Orders</span>
          <p className="text-2xl font-mono font-bold text-on-surface mt-2">{orders.length}</p>
          <span className="text-[10px] text-cyan-300 mt-1">Confirmed contracts</span>
        </div>
      </div>

      {/* Commitments Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <CheckSquare size={18} className="text-primary" />
            <span>Customer Commitments &amp; Deliverables</span>
          </h2>
        </div>
        <CommitmentTable initialCommitments={commitments as any} />
      </div>

      {/* Orders & Fulfilment Hub */}
      <OrderFulfilmentSection orders={orders as any} leads={leads} />
    </div>
  );
}
