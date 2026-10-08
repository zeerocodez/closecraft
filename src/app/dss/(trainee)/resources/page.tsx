import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { FileText, Download, PlaySquare, Link as LinkIcon, Search, FolderOpen } from 'lucide-react';

export default async function ResourcesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;
  
  if (!organizationId) {
    return <div className="text-white p-8">Error: No organization found for LMS.</div>;
  }

  const resources = await db.resource.findMany({
    where: { organizationId },
    include: { course: true },
    orderBy: { createdAt: 'desc' }
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText size={20} className="text-red-400" />;
      case 'VIDEO': return <PlaySquare size={20} className="text-purple-400" />;
      case 'LINK': return <LinkIcon size={20} className="text-blue-400" />;
      default: return <FileText size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-8 md:p-12 relative">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-4">
          <FolderOpen size={14} /> Library
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-4">
          Resource Library
        </h1>
        <p className="text-gray-400 text-lg">
          Download templates, scripts, and extra materials provided by your instructors.
        </p>
      </div>

      <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl overflow-hidden shadow-xl mb-8">
        <div className="p-4 border-b border-white/5 bg-[#0a0d12] flex items-center justify-between">
          <h2 className="font-bold text-white">All Resources</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search library..." 
              className="bg-[#161b22] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae]"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {resources.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No resources have been uploaded to the library yet.</p>
            </div>
          ) : (
            resources.map(resource => (
              <div key={resource.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {getIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{resource.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="uppercase tracking-widest font-bold">{resource.type}</span>
                      {resource.course && (
                        <>
                          <span>•</span>
                          <span>{resource.course.title}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#45bfae] bg-white/5 hover:bg-[#248277]/20 rounded-lg transition-colors border border-white/5 hover:border-[#248277]/30 opacity-0 group-hover:opacity-100 flex items-center gap-2">
                    <span className="text-xs font-bold hidden sm:block">Open</span>
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
