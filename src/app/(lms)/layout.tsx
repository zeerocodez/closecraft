import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LMSLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-container flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-surface-container-high/20">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mr-3 shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[20px]">school</span>
          </div>
          <span className="font-headline-sm font-bold text-on-surface tracking-tight uppercase">DSS LMS</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          <Link href="/dss" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-label-md font-semibold transition-colors">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Student Home
          </Link>
          <Link href="/dss/curriculum" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            Curriculum
          </Link>
          <Link href="/dss/portfolio" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors">
            <span className="material-symbols-outlined text-[20px]">folder_special</span>
            Portfolio
          </Link>
          <Link href="/dss/readiness" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors">
            <span className="material-symbols-outlined text-[20px]">radar</span>
            Readiness Index
          </Link>
          <Link href="/dss/roleplay" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            AI Role-play
          </Link>
        </nav>

        <div className="p-4 border-t border-surface-container">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-bold uppercase overflow-hidden">
              {session.user.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="font-label-md font-bold text-on-surface text-sm truncate">{session.user.name}</span>
              <span className="font-body-sm text-xs text-on-surface-variant truncate">DSS Student</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (simplified) */}
        <header className="h-16 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">school</span>
            <span className="font-headline-sm font-bold text-on-surface uppercase">DSS</span>
          </div>
          <button className="p-2 text-on-surface-variant">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
