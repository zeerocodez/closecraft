"use client";

import React, { useState } from 'react';
import { updateQualificationPolicy } from '@/app/(saas)/actions';

export function SettingsForm({ initialPolicy }: { initialPolicy: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    try {
      await updateQualificationPolicy(formData.get('policy') as string);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-label-md font-bold text-on-surface-variant mb-2">Ideal Customer Profile (ICP) & Qualification Policy</label>
        <p className="text-body-sm text-on-surface-variant mb-3">
          Define exactly what makes a lead "Qualified" for your organization. The AI Revenue Engine will strictly follow these instructions when scoring new inbound leads and assigning the Next Best Action.
        </p>
        <textarea 
          required 
          name="policy" 
          defaultValue={initialPolicy} 
          rows={10}
          className="w-full p-4 bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:border-primary font-body-sm leading-relaxed"
          placeholder="e.g. A qualified lead must be a B2B SaaS company with >$1M ARR. If they mention urgency, assign them to a HUMAN immediately. If they have no budget, DISQUALIFY."
        />
      </div>
      
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md font-bold transition-colors shadow-sm disabled:opacity-50">
          {loading ? 'Saving...' : 'Save AI Policy'}
        </button>
        {success && <span className="text-primary font-label-md animate-in fade-in zoom-in">Policy updated successfully!</span>}
      </div>
    </form>
  );
}
