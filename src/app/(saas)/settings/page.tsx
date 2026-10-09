import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
 const session = await auth();
 if (!session?.user) {
 redirect('/login');
 }

 const organizationId = session.organizationId;
 if (!organizationId) {
 redirect("/login");
 }

 // Fetch organization details
 const org = await db.organization.findUnique({
 where: { id: organizationId },
 include: {
 members: {
 include: { user: true }
 }
 }
 });

 if (!org) {
 return <div>Organization not found.</div>;
 }

 return (
 <div className="flex flex-col gap-6 lg:gap-8 w-full h-full max-w-5xl">
 <div className="max-w-4xl mx-auto space-y-8">
 <div className="flex flex-col gap-2">
 <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Organization Settings</h1>
 <p className="font-body-md text-on-surface-variant">Manage your revenue engine, billing, and team access.</p>
 </div>

 {/* General Settings */}
 <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-6">
 <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-4">Workspace Identity</h2>
 
 <div className="flex flex-col gap-4 max-w-lg">
 <div className="flex flex-col gap-1">
 <label className="font-medium text-on-surface-variant font-bold">Organization Name</label>
 <input 
 type="text" 
 defaultValue={org.name}
 className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
 />
 </div>
 
 <div className="flex flex-col gap-1">
 <label className="font-medium text-on-surface-variant font-bold">Workspace URL</label>
 <div className="flex items-center">
 <span className="h-10 px-3 bg-surface-container flex items-center text-on-surface-variant rounded-l-lg border border-surface-container border-r-0">closecraft.com/</span>
 <input 
 type="text" 
 defaultValue={org.slug}
 disabled
 className="h-10 px-3 w-full bg-surface-container-lowest text-on-surface-variant rounded-r-lg border border-surface-container opacity-70 cursor-not-allowed"
 />
 </div>
 </div>

 <div className="mt-2">
 <button className="px-4 py-2 bg-primary text-on-primary font-medium font-bold rounded-lg hover:bg-primary-container shadow-sm transition-colors">
 Save Changes
 </button>
 </div>
 </div>
 </section>

 {/* AI Engine Configuration */}
 <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
 <div className="p-6 border-b border-surface-container bg-surface-container-low/30">
 <h2 className="font-medium text-lg font-bold text-on-surface">AI Engine Configuration</h2>
 </div>
 <div className="p-6">
 <SettingsForm initialPolicy={org.qualificationPolicy || ""} />
 </div>
 </section>

 {/* Billing & Subscription */}
 <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-6">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">Billing & Plan</h2>
 <p className="text-sm text-on-surface-variant mb-4">You are currently on the highly optimized enterprise infrastructure.</p>
 </div>
 <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed font-semibold font-bold tracking-wider rounded-full flex items-center gap-1">
 <span className="material-symbols-outlined text-[16px]">stars</span>
 {org.plan} PLAN
 </span>
 </div>
 
 <div className="p-4 bg-surface-container-low rounded-lg border border-surface-container flex items-center justify-between mt-2">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-primary text-[28px]">credit_card</span>
 <div className="flex flex-col">
 <span className="font-medium font-bold text-on-surface">Payment Method</span>
 <span className="text-sm text-on-surface-variant">Visa ending in 4242</span>
 </div>
 </div>
 <button className="px-3 py-1.5 bg-inverse-surface text-inverse-on-surface font-medium font-bold rounded-lg shadow-sm hover:opacity-90">
 Manage Billing
 </button>
 </div>
 </section>

 {/* Team Members */}
 <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Team Access</h2>
 <button className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-on-surface font-medium font-bold rounded-lg hover:bg-surface-container-high transition-colors border border-surface-container-highest">
 <span className="material-symbols-outlined text-[18px]">person_add</span>
 <span>Invite Member</span>
 </button>
 </div>

 <div className="overflow-hidden border border-surface-container rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider">
 <th className="py-2.5 px-4">User</th>
 <th className="py-2.5 px-4">Role</th>
 <th className="py-2.5 px-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-surface-container">
 {org.members.map((member) => (
 <tr key={member.id} className="hover:bg-surface-container-low/50 transition-colors">
 <td className="py-3 px-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center font-medium">
 {member.user.name?.substring(0,2).toUpperCase() || 'U'}
 </div>
 <div className="flex flex-col">
 <span className="font-medium text-sm font-bold text-on-surface">{member.user.name}</span>
 <span className="text-sm text-[11px] text-on-surface-variant">{member.user.email}</span>
 </div>
 </div>
 </td>
 <td className="py-3 px-4">
 <span className="px-2 py-0.5 bg-surface-container text-on-surface font-semibold text-[10px] font-bold rounded">
 {member.role}
 </span>
 </td>
 <td className="py-3 px-4 text-right">
 <button className="text-error hover:text-error-container font-medium font-bold text-sm transition-colors">
 Remove
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>
 </div>
 </div>
 );
}
