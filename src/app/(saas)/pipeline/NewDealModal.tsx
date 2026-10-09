"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createDeal } from '@/app/(saas)/actions';

export function NewDealModal({ leads }: { leads: { id: string, name: string }[] }) {
 const [isOpen, setIsOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setLoading(true);
 const formData = new FormData(e.currentTarget);
 try {
 await createDeal(
 formData.get('leadId') as string,
 Number(formData.get('amount'))
 );
 setIsOpen(false);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 }

 return (
 <>
 <button 
 onClick={() => setIsOpen(true)}
 className="h-9 px-3 bg-primary hover:bg-primary-container text-on-primary text-sm font-medium font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
 >
 <span className="material-symbols-outlined text-[18px]">add</span>
 <span>New Deal</span>
 </button>

 {isOpen && mounted && createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-surface-container-lowest border border-surface-container rounded-2xl w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
 <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
 <h2 className="font-medium text-lg font-bold text-on-surface">Create Pipeline Deal</h2>
 <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface">
 <span className="material-symbols-outlined">close</span>
 </button>
 </div>
 <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-1">Select Lead</label>
 <select required name="leadId" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:border-primary">
 <option value="">-- Choose a lead --</option>
 {leads.map(lead => (
 <option key={lead.id} value={lead.id}>{lead.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-1">Deal Amount (₦)</label>
 <input required name="amount" type="number" min="0" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:border-primary" placeholder="5000000" />
 </div>
 
 <div className="mt-4 flex items-center justify-end gap-3">
 <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface font-semibold">Cancel</button>
 <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-medium font-bold transition-colors disabled:opacity-50">
 {loading ? 'Creating...' : 'Create Deal'}
 </button>
 </div>
 </form>
 </div>
 </div>,
 document.body
 )}
 </>
 );
}
