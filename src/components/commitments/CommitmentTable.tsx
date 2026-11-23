'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  User, 
  FileCheck,
  Calendar
} from 'lucide-react';

interface Commitment {
  id: string;
  title: string;
  description: string;
  commitmentType: string;
  dueDate: string | Date;
  completedAt?: string | Date | null;
  status: string;
  priority: string;
  isOverdue: boolean;
  completionEvidence?: string | null;
  lead?: { id: string; name: string } | null;
  assignedUser?: { id: string; name: string } | null;
  order?: { id: string; orderNumber: string } | null;
}

interface CommitmentTableProps {
  initialCommitments: Commitment[];
}

export function CommitmentTable({ initialCommitments }: CommitmentTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [evidencePromptId, setEvidencePromptId] = useState<string | null>(null);
  const [evidenceText, setEvidenceText] = useState('');

  const filtered = initialCommitments.filter((c) => {
    if (filter === 'OVERDUE') return c.isOverdue || c.status === 'OVERDUE';
    if (filter === 'PENDING') return c.status === 'PENDING' || c.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return c.status === 'COMPLETED';
    return true;
  });

  const overdueCount = initialCommitments.filter(c => c.isOverdue || c.status === 'OVERDUE').length;

  const handleComplete = async (commitmentId: string) => {
    setCompletingId(commitmentId);
    try {
      const res = await fetch(`/api/commitments/${commitmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COMPLETE',
          completionEvidence: evidenceText.trim() || 'Verified completed by representative.'
        })
      });

      if (res.ok) {
        setEvidencePromptId(null);
        setEvidenceText('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Overdue Warning Alert */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">
                {overdueCount} Overdue Customer Commitment{overdueCount > 1 ? 's' : ''} Require Immediate Attention
              </p>
              <p className="text-rose-200/80 text-[11px] mt-0.5">
                Overdue promises generate real-time Revenue Leaks to protect merchant reputation and contract renewals.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilter('OVERDUE')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors"
          >
            View Overdue ({overdueCount})
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: `All Commitments (${initialCommitments.length})` },
            { id: 'PENDING', label: 'Pending & In Progress' },
            { id: 'OVERDUE', label: `Overdue (${overdueCount})` },
            { id: 'COMPLETED', label: 'Completed & Verified' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commitments Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant text-xs space-y-1 rounded-2xl bg-surface-container-low border border-outline-variant/20">
          <CheckSquare size={24} className="mx-auto text-primary opacity-60 mb-2" />
          <p className="font-bold text-on-surface">No commitments found for this view</p>
          <p className="text-[11px]">Record new promises or extract them from customer chats using the buttons above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const isOverdue = item.isOverdue || item.status === 'OVERDUE';
            const dueDateFormatted = new Date(item.dueDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
                  isOverdue
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : isCompleted
                    ? 'bg-surface-container-low/60 border-outline-variant/20 opacity-80'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/50'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isOverdue
                        ? 'bg-rose-500/20 text-rose-300'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {item.commitmentType}
                    </span>

                    <span className="font-bold text-on-surface text-sm">{item.title}</span>

                    {item.priority === 'CRITICAL' && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[9px] font-bold">
                        CRITICAL SLA
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.description}</p>

                  <div className="pt-1 flex items-center gap-3 text-[10px] text-on-surface-variant font-mono">
                    <span suppressHydrationWarning className="flex items-center gap-1">
                      <Calendar size={11} className={isOverdue ? 'text-rose-400' : 'text-primary'} />
                      <span>Due: {dueDateFormatted}</span>
                    </span>

                    {item.lead && (
                      <span className="flex items-center gap-1 text-on-surface">
                        <User size={11} className="text-on-surface-variant" />
                        <span>{item.lead.name}</span>
                      </span>
                    )}

                    {item.order && (
                      <span className="text-primary font-bold">
                        Order #{item.order.orderNumber}
                      </span>
                    )}

                    {item.completionEvidence && (
                      <span className="text-emerald-400 truncate max-w-xs">
                        Evidence: {item.completionEvidence}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Column */}
                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {!isCompleted ? (
                    evidencePromptId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={evidenceText}
                          onChange={(e) => setEvidenceText(e.target.value)}
                          placeholder="Evidence (e.g. Sent via email #482)"
                          className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-[11px] text-on-surface focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleComplete(item.id)}
                          disabled={completingId === item.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                        >
                          {completingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvidencePromptId(null)}
                          className="p-1.5 text-on-surface-variant hover:text-on-surface"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEvidencePromptId(item.id); setEvidenceText(''); }}
                        className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <FileCheck size={13} className="text-emerald-400" />
                        <span>Complete Promise</span>
                      </button>
                    )
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>FULFILLED</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
