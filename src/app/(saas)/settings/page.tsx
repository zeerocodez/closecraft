import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;

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
    <div className="flex h-screen bg-surface font-body-md text-on-surface antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-inverse-surface z-50 flex flex-col justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="h-16 px-4 flex items-center justify-between bg-inverse-surface">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">rocket_launch</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-inverse-on-surface tracking-tight">Closecraft</span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-primary-fixed tracking-wider font-semibold">Revenue OS</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-1">
            <div className="bg-on-surface/20 rounded-lg p-1.5 flex items-center justify-between text-inverse-on-surface cursor-pointer">
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="material-symbols-outlined text-primary-fixed text-[16px]">corporate_fare</span>
                <span className="font-label-md text-label-md truncate font-medium text-inverse-on-surface">{org.name}</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-[16px]">unfold_more</span>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-2 space-y-3 mt-4">
            <div className="space-y-1">
              <div className="px-1 py-1 font-label-caps text-label-caps uppercase text-outline-variant tracking-wider font-bold">Revenue</div>
              <div className="space-y-0.5">
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/dashboard">
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Dashboard</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/leads">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  <span>Leads</span>
                </a>
                <a className="flex items-center justify-between px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/inbox">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">inbox</span>
                    <span>Inbox</span>
                  </div>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/pipeline">
                  <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                  <span>Pipeline</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/appointments">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>Appointments</span>
                </a>
              </div>
            </div>

            <div className="space-y-1 mt-6">
              <div className="px-1 py-1 font-label-caps text-label-caps uppercase text-outline-variant tracking-wider font-bold">Configuration</div>
              <div className="space-y-0.5">
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-primary text-on-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.2)]" href="/settings">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  <span>Settings & Setup</span>
                </a>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col relative w-full bg-surface">
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-label-md text-label-md text-secondary font-medium">Configuration Workspace</span>
              <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">Settings & Setup</span>
            </div>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-6 pb-8 overflow-y-auto">
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
                  <label className="font-label-md text-on-surface-variant font-bold">Organization Name</label>
                  <input 
                    type="text" 
                    defaultValue={org.name}
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-on-surface-variant font-bold">Workspace URL</label>
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
                  <button className="px-4 py-2 bg-primary text-on-primary font-label-md font-bold rounded-lg hover:bg-primary-container shadow-sm transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </section>

            {/* Billing & Subscription */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">Billing & Plan</h2>
                  <p className="font-body-sm text-on-surface-variant mb-4">You are currently on the highly optimized enterprise infrastructure.</p>
                </div>
                <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed font-label-caps font-bold tracking-wider rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  {org.plan} PLAN
                </span>
              </div>
              
              <div className="p-4 bg-surface-container-low rounded-lg border border-surface-container flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[28px]">credit_card</span>
                  <div className="flex flex-col">
                    <span className="font-label-md font-bold text-on-surface">Payment Method</span>
                    <span className="font-body-sm text-on-surface-variant">Visa ending in 4242</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-inverse-surface text-inverse-on-surface font-label-md font-bold rounded-lg shadow-sm hover:opacity-90">
                  Manage Billing
                </button>
              </div>
            </section>

            {/* Team Members */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Team Access</h2>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-on-surface font-label-md font-bold rounded-lg hover:bg-surface-container-high transition-colors border border-surface-container-highest">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Invite Member</span>
                </button>
              </div>

              <div className="overflow-hidden border border-surface-container rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
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
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center font-label-md">
                              {member.user.name?.substring(0,2).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-sm font-bold text-on-surface">{member.user.name}</span>
                              <span className="font-body-sm text-[11px] text-on-surface-variant">{member.user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-caps text-[10px] font-bold rounded">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-error hover:text-error-container font-label-md font-bold text-sm transition-colors">
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
        </main>
      </div>
    </div>
  );
}
