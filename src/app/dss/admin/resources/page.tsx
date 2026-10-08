import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FolderOpen, Plus, FileText, PlaySquare, Link as LinkIcon, Settings, Search } from 'lucide-react';

export default async function DSSAdminResourcesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const orgId = (session as any).organizationId;

  const organizationId = orgId || (await db.organization.findFirst())?.id;
  
  if (!organizationId) {
    return <div className="text-white p-8">Error: No organization found to manage LMS.</div>;
  }

  const resources = await db.resource.findMany({
    where: { organizationId },
    include: { course: true },
    orderBy: { createdAt: 'desc' }
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText size={16} className="text-red-400" />;
      case 'VIDEO': return <PlaySquare size={16} className="text-purple-400" />;
      case 'LINK': return <LinkIcon size={16} className="text-blue-400" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">
      <header className="bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6 shrink-0 z-40 sticky top-0">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#248277]/20 border border-[#248277]/30 text-[#45bfae] flex items-center justify-center font-bold font-serif shadow-lg">
              Z
            </div>
            <span className="font-serif font-bold text-white ml-2 text-lg">DSS Faculty Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-bold">
              <Link href="/dss/admin" className="text-gray-400 hover:text-white transition-colors py-5">Curriculum</Link>
              <Link href="/dss/admin/students" className="text-gray-400 hover:text-white transition-colors py-5">Students</Link>
              <Link href="/dss/admin/resources" className="text-[#45bfae] border-b-2 border-[#45bfae] py-5">Resources</Link>
              <Link href="/dss/admin/roleplays" className="text-gray-400 hover:text-white transition-colors py-5">AI Scenarios</Link>
            </nav>
            <div className="w-8 h-8 rounded-full bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-bold text-sm uppercase">
              {session.user.name?.substring(0, 2) || 'AD'}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-3">
                <FolderOpen size={14} /> Resource Management
              </div>
              <h1 className="font-serif font-bold text-3xl text-white">Resource Library</h1>
              <p className="text-gray-400 text-sm mt-1">Upload and manage PDFs, links, and templates for students.</p>
            </div>
            <button className="px-5 py-2.5 bg-[#45bfae] text-[#0f1214] font-bold rounded-xl hover:bg-[#5cd4c3] transition-colors shadow-lg flex items-center gap-2">
              <Plus size={18} /> Upload Resource
            </button>
          </div>

          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/5 bg-[#0a0d12] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4 text-sm font-bold">
                <button className="text-white border-b-2 border-[#45bfae] pb-2">All Files</button>
                <button className="text-gray-500 hover:text-white transition-colors pb-2">Unassigned</button>
              </div>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  className="w-full bg-[#161b22] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae]"
                />
              </div>
            </div>

            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0a0d12] border-b border-white/5">
                <tr>
                  <th className="py-4 px-6 font-bold text-white w-2/5">File Name</th>
                  <th className="py-4 px-6 font-bold text-white">Course Assignment</th>
                  <th className="py-4 px-6 font-bold text-white">Type</th>
                  <th className="py-4 px-6 font-bold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500 bg-[#0a0d12]/50">
                      <FolderOpen size={32} className="mx-auto mb-4 opacity-50" />
                      No resources found. Upload a file to get started.
                    </td>
                  </tr>
                ) : (
                  resources.map(resource => (
                    <tr key={resource.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white truncate flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-white/10 flex items-center justify-center">
                            {getIcon(resource.type)}
                          </div>
                          {resource.title}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {resource.course ? (
                          <span className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/5">{resource.course.title}</span>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 bg-[#0a0d12] border border-white/5 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors inline-flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
