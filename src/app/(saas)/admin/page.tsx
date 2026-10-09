import React from 'react';
import { db } from '@/lib/db';
import { createOrganization, updateOrganization } from './actions';

export default async function AdminPage() {
 const orgs = await db.organization.findMany({
 orderBy: { createdAt: 'desc' }
 });

 return (
 <div className="flex flex-col gap-6 lg:gap-8 w-full h-full max-w-5xl">
 <div>
 <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Admin Dashboard</h1>
 <p className="text-sm text-on-surface-variant mt-1">Manage tenant organizations and platform configurations.</p>
 </div>
 
 <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant mb-8">
 <h2 className="text-xl font-semibold mb-4">Add New Organization</h2>
 <form action={createOrganization} className="flex gap-4 items-end">
 <div className="flex-1">
 <label className="block text-sm mb-1 text-on-surface-variant">Name</label>
 <input name="name" required className="w-full bg-surface-container p-2 rounded border border-outline-variant text-on-surface" />
 </div>
 <div className="flex-1">
 <label className="block text-sm mb-1 text-on-surface-variant">Slug</label>
 <input name="slug" required className="w-full bg-surface-container p-2 rounded border border-outline-variant text-on-surface" />
 </div>
 <div className="flex-1">
 <label className="block text-sm mb-1 text-on-surface-variant">Plan</label>
 <select name="plan" className="w-full bg-surface-container p-2 rounded border border-outline-variant text-on-surface">
 <option value="STARTER">Starter</option>
 <option value="GROWTH">Growth</option>
 <option value="SCALE">Scale</option>
 </select>
 </div>
 <button type="submit" className="bg-primary text-on-primary px-6 py-2 rounded font-semibold hover:bg-primary/80">Add</button>
 </form>
 </div>

 <div className="space-y-4">
 <h2 className="text-xl font-semibold">Existing Organizations</h2>
 {orgs.map(org => (
 <div key={org.id} className="bg-surface-container p-4 rounded-lg border border-outline-variant flex items-center justify-between">
 <form action={updateOrganization} className="flex flex-1 gap-4 items-center">
 <input type="hidden" name="id" value={org.id} />
 
 <div className="flex-1">
 <input name="name" defaultValue={org.name} className="w-full bg-surface-container-lowest p-2 rounded border border-outline-variant text-on-surface" />
 </div>
 
 <div className="flex-1">
 <span className="text-sm text-on-surface-variant">{org.slug}</span>
 </div>
 
 <div className="flex-1">
 <select name="plan" defaultValue={org.plan} className="w-full bg-surface-container-lowest p-2 rounded border border-outline-variant text-on-surface">
 <option value="STARTER">Starter</option>
 <option value="GROWTH">Growth</option>
 <option value="SCALE">Scale</option>
 </select>
 </div>
 
 <button type="submit" className="bg-secondary text-on-secondary px-4 py-2 rounded text-sm hover:bg-secondary/80">Update</button>
 </form>
 </div>
 ))}
 </div>
 </div>
 );
}
