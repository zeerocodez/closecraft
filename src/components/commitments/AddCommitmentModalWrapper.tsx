'use client';

import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { AddCommitmentModal } from '@/components/commitments/AddCommitmentModal';
import { ExtractCommitmentsModal } from '@/components/commitments/ExtractCommitmentsModal';

interface AddCommitmentModalWrapperProps {
  leads: Array<{ id: string; name: string }>;
}

export function AddCommitmentModalWrapper({ leads }: AddCommitmentModalWrapperProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExtractOpen, setIsExtractOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
        <button
          type="button"
          onClick={() => setIsExtractOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary hover:text-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Sparkles size={14} className="text-primary" />
          <span>AI Extract from Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Record Commitment</span>
        </button>
      </div>

      <AddCommitmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        leads={leads}
      />

      <ExtractCommitmentsModal
        isOpen={isExtractOpen}
        onClose={() => setIsExtractOpen(false)}
        leads={leads}
      />
    </>
  );
}
