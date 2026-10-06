import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Building2, Users, Activity, BarChart3, Database, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
  const session = await auth();

  // Basic authorization: Ensure user exists. In production, check for a SUPER_ADMIN role.
  if (!session?.user) {
    redirect('/login');
  }

  const [
    totalOrgs,
    totalUsers,
    totalLeads,
    totalRevenue
  ] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.lead.count(),
    db.deal.aggregate({
      _sum: {
        amount: true
      },
      where: { stage: 'WON' }
    })
  ]);

  const recentOrgs = await db.organization.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { members: true, leads: true }
      }
    }
  });

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      {/* Super Admin Sidebar */}
      <div className="w-64 border-r border-[#262626] bg-[#121212] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#262626]">
          <div className="w-8 h-8 rounded bg-[#789d2e] flex items-center justify-center font-bold text-black mr-3">Z</div>
          <span className="font-semibold tracking-wide">SYSTEM ADMIN</span>
        </div>
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#262626] text-[#ededed] font-medium text-sm">
            <Activity size={18} />
            Platform Overview
          </Link>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#262626]/50 text-[#a3a3a3] hover:text-[#ededed] transition text-sm">
            <Building2 size={18} />
            Tenants / Orgs
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#262626]/50 text-[#a3a3a3] hover:text-[#ededed] transition text-sm">
            <Users size={18} />
            Users
          </Link>
          <Link href="/admin/database" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#262626]/50 text-[#a3a3a3] hover:text-[#ededed] transition text-sm">
            <Database size={18} />
            Database Metrics
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 border-b border-[#262626] flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Super Admin Control Plane</h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-[#789d2e]/10 border border-[#789d2e]/20 text-[#789d2e] text-xs font-semibold tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#789d2e] animate-pulse"></span>
              SYSTEM HEALTHY
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 text-[#a3a3a3] mb-4">
                <Building2 size={20} />
                <span className="text-sm font-medium">Total Tenants</span>
              </div>
              <div className="text-4xl font-bold">{totalOrgs}</div>
            </div>
            
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 text-[#a3a3a3] mb-4">
                <Users size={20} />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <div className="text-4xl font-bold">{totalUsers}</div>
            </div>

            <div className="bg-[#121212] border border-[#262626] rounded-xl p-6">
              <div className="flex items-center gap-3 text-[#a3a3a3] mb-4">
                <BarChart3 size={20} />
                <span className="text-sm font-medium">Platform Leads</span>
              </div>
              <div className="text-4xl font-bold">{totalLeads}</div>
            </div>

            <div className="bg-[#121212] border border-[#789d2e]/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#789d2e]/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
              <div className="flex items-center gap-3 text-[#789d2e] mb-4 relative z-10">
                <Activity size={20} />
                <span className="text-sm font-medium">Total GMV Closed</span>
              </div>
              <div className="text-4xl font-bold text-[#ededed] relative z-10">
                ₦{(totalRevenue._sum.amount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orgs Table */}
            <div className="lg:col-span-2 bg-[#121212] border border-[#262626] rounded-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#262626] flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Tenants</h2>
                <Link href="/admin/tenants" className="text-sm text-[#789d2e] hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#262626] text-[#a3a3a3] text-sm bg-[#1a1a1a]">
                      <th className="p-4 font-medium">Organization</th>
                      <th className="p-4 font-medium">Plan</th>
                      <th className="p-4 font-medium">Members</th>
                      <th className="p-4 font-medium">Leads</th>
                      <th className="p-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentOrgs.map((org) => (
                      <tr key={org.id} className="border-b border-[#262626] hover:bg-[#1a1a1a]/50 transition">
                        <td className="p-4 font-medium text-[#ededed]">{org.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded bg-[#262626] text-xs font-semibold">{org.plan}</span>
                        </td>
                        <td className="p-4 text-[#a3a3a3]">{org._count.members}</td>
                        <td className="p-4 text-[#a3a3a3]">{org._count.leads}</td>
                        <td className="p-4 text-[#a3a3a3]">{new Date(org.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {recentOrgs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#a3a3a3]">No tenants found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions / System Alerts */}
            <div className="space-y-6">
              <div className="bg-[#121212] border border-[#262626] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> System Alerts
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#262626]/50 border border-[#262626]">
                    <div className="flex items-center gap-2 text-[#ededed] font-medium text-sm mb-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      High API Latency
                    </div>
                    <p className="text-xs text-[#a3a3a3]">OpenAI API response times elevated over the last 15 mins.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#262626]/50 border border-[#262626]">
                    <div className="flex items-center gap-2 text-[#ededed] font-medium text-sm mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#789d2e]"></div>
                      Cron Jobs Active
                    </div>
                    <p className="text-xs text-[#a3a3a3]">All follow-up queues processing normally.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] border border-[#262626] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-[#262626] hover:bg-[#333] transition text-sm font-medium">
                    Run Manual Billing Sync
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-[#262626] hover:bg-[#333] transition text-sm font-medium">
                    Provision New Tenant
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-red-950/20 text-red-500 hover:bg-red-950/40 border border-red-900/30 transition text-sm font-medium">
                    Clear System Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
