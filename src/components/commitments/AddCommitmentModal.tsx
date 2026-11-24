'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckSquare, Loader2, Calendar, AlertCircle } from 'lucide-react';

interface AddCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: Array<{ id: string; name: string }>;
}

export function AddCommitmentModal({ isOpen, onClose, leads = [] }: AddCommitmentModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitmentType, setCommitmentType] = useState('DELIVERABLE');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState('HIGH');
  const [leadId, setLeadId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setErrorMsg('Title and due date are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          commitmentType,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          leadId: leadId || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record commitment');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-primary" />
            <h3 className="font-bold text-base text-on-surface">Record Customer Commitment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-on-surface">Commitment Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deliver pro-forma contract, Deploy ERP integration, Apply 10% discount"
              className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Commitment Type</label>
              <select
                value={commitmentType}
                onChange={(e) => setCommitmentType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="DELIVERABLE">Deliverable / Setup</option>
                <option value="PROPOSAL">Proposal / Quote</option>
                <option value="DISCOUNT_AGREEMENT">Discount Concession</option>
                <option value="CALLBACK">Follow-up Briefing</option>
                <option value="DELIVERY_DATE">Delivery Deadline</option>
                <option value="RESOLUTION">Issue Resolution</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-on-surface">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical SLA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-on-surface">Associated Customer/Lead</label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">General Workspace Commitment</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">Commitment Details &amp; Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Outline specific agreed scope, promised timeline, or customer expectations."
              className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <CheckSquare size={13} />}
              <span>{isSubmitting ? 'Recording...' : 'Record Commitment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
