'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import WorkspaceHeader from './WorkspaceHeader';

export default function AppShell({ children, user }: { children: React.ReactNode, user: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-canvas font-sans text-on-surface antialiased overflow-hidden relative">
      <Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      
      <div className="flex-1 flex flex-col relative w-full h-full bg-transparent overflow-hidden z-10 md:ml-[72px] lg:ml-[248px] transition-all duration-200 ease-out">
        <WorkspaceHeader user={user} onMenuClick={() => setIsSidebarOpen(true)} isMobile={isMobile} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
