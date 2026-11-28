'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Loader2, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface ExtractCommitmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: Array<{ id: string; name: string }>;
}

export function ExtractCommitmentsModal({ isOpen, onClose, leads = [] }: ExtractCommitmentsModalProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState(
    `Prospect: "We're ready to proceed with the Enterprise tier, but we need the signed proposal delivered by Thursday and our WhatsApp webhook configured within 5 business days. Also, Chidi promised a 10% discount on the onboarding setup."`
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExtract = async () => {
    setIsExtracting(true);
    setSuggestions([]);
    setSavedCount(null);

    try {
      const res = await fetch('/api/commitments/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveCommitments = async () => {
    if (suggestions.length === 0) return;
    setIsSaving(true);

    try {
      for (const item of suggestions) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (item.suggestedDueDays || 3));

        await fetch('/api/commitments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            commitmentType: item.commitmentType,
            dueDate: dueDate.toISOString(),
            priority: item.priority,
            leadId: selectedLeadId || undefined
          })
        });
      }

      setSavedCount(suggestions.length);
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h3 className="font-bold text-base text-on-surface">AI Commitment Extraction Engine</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          <p className="text-on-surface-variant">
            Paste sales conversations, WhatsApp messages, or meeting transcripts. CloseCraft identifies promised deadlines, discounts, deliverables, and follow-ups so nothing slips through the cracks.
          </p>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary"
            placeholder="Paste conversation transcript or sales notes..."
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="font-bold text-on-surface text-[11px]">Link to Lead:</label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none"
              >
                <option value="">General Workspace</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !inputText.trim()}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isExtracting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{isExtracting ? 'Extracting Promises...' : 'Extract Commitments'}</span>
            </button>
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <span className="font-bold text-on-surface text-xs flex items-center gap-1.5">
                <span>Identified Promises &amp; Deliverables ({suggestions.length})</span>
                <span className="text-[10px] text-emerald-400 font-mono">Requires human confirmation</span>
              </span>

              <div className="space-y-2">
                {suggestions.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface">{item.title}</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[9px] font-bold">
                        Due in {item.suggestedDueDays} days [{item.priority}]
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{item.description}</p>
                    <p className="text-[10px] text-primary/80 font-mono">Evidence: {item.reasoning}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCommitments}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{isSaving ? 'Recording to Ledger...' : `Confirm & Record All (${suggestions.length})`}</span>
                </button>
              </div>
            </div>
          )}

          {savedCount !== null && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <Check size={15} className="text-emerald-300" />
              <span>Successfully recorded {savedCount} customer promises!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
