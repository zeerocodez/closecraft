"use client";

import React, { useState } from 'react';
import { addManualLead } from '@/app/(saas)/actions';

export function AddLeadModal() {
 const [isOpen, setIsOpen] = useState(false);
 const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setLoading(true);
 const formData = new FormData(e.currentTarget);
 try {
 await addManualLead({
 name: formData.get('name') as string,
 email: formData.get('email') as string,
 source: formData.get('source') as string,
 });
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
 className="h-9 px-4 bg-primary hover:bg-primary-container text-on-primary text-sm font-medium font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
 >
 <span className="material-symbols-outlined text-[18px]">add</span>
 <span>Add Lead</span>
 </button>

 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
 <div className="bg-surface-container-lowest border border-surface-container rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
 <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
 <h2 className="font-medium text-lg font-bold text-on-surface">Add Manual Lead</h2>
 <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface">
 <span className="material-symbols-outlined">close</span>
 </button>
 </div>
 <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-1">Full Name</label>
 <input required name="name" type="text" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:border-primary" placeholder="Jane Doe" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-1">Email Address</label>
 <input required name="email" type="email" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:border-primary" placeholder="jane@company.com" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-1">Source</label>
 <input required name="source" type="text" defaultValue="Manual Entry" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:border-primary" />
 </div>
 
 <div className="mt-4 flex items-center justify-end gap-3">
 <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface font-semibold">Cancel</button>
 <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-medium font-bold transition-colors disabled:opacity-50">
 {loading ? 'Adding...' : 'Create Lead'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </>
 );
}
