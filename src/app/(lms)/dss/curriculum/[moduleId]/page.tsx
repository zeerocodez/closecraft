import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export default async function ModulePlayerPage({ params }: { params: { moduleId: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Fetch the module, lessons, and check completion gates
  const module = await db.module.findUnique({ 
    where: { id: params.moduleId }, 
    include: { lessons: { orderBy: { orderIndex: 'asc' } } } 
  });

  if (!module) notFound();

  // For MVP demo, pick the first lesson as active
  const activeLesson = module.lessons[0] || null;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Video / Content Player Area */}
      <div className="flex-1 flex flex-col bg-inverse-surface text-inverse-on-surface">
        {/* Top bar */}
        <div className="h-14 border-b border-surface-container-high/20 px-6 flex items-center justify-between">
          <Link href="/dss/curriculum" className="flex items-center gap-2 text-inverse-on-surface/70 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-md font-bold">Back to Curriculum</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-label-sm uppercase tracking-wider opacity-60">Module {module.orderIndex} of 28</span>
            <div className="w-px h-4 bg-surface-container-high/30"></div>
            <button className="text-inverse-on-surface/70 hover:text-inverse-on-surface">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
          </div>
        </div>

        {/* Video Player Mock */}
        <div className="flex-1 w-full bg-black flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
            <div className="flex items-center gap-4 mb-2">
              <button className="text-white hover:text-primary transition-colors"><span className="material-symbols-outlined text-3xl">play_circle</span></button>
              <div className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer">
                <div className="w-1/3 h-full bg-primary rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                </div>
              </div>
              <span className="font-metric-numeral-sm text-sm text-white font-mono">04:20 / 12:45</span>
            </div>
          </div>
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-[64px] text-white/20">play_circle</span>
            <p className="font-label-md text-white/50">DSS Protected Video Stream</p>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="p-6 md:p-8 bg-inverse-surface border-t border-surface-container-high/20">
          <h1 className="font-headline-md text-2xl font-bold mb-2">
            {activeLesson ? `Lesson ${activeLesson.orderIndex}: ${activeLesson.title}` : module.title}
          </h1>
          <p className="font-body-md text-inverse-on-surface/70 max-w-3xl leading-relaxed">
            {module.description || 'No description available for this module.'}
          </p>
        </div>
      </div>

      {/* Sidebar: Lessons & Tasks */}
      <div className="w-full lg:w-80 bg-surface-container-lowest border-l border-surface-container flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b border-surface-container bg-surface-container-low">
          <h2 className="font-headline-sm font-bold text-on-surface">Module {module.orderIndex} Tasks</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-primary"></div>
            </div>
            <span className="font-label-sm font-bold text-on-surface-variant">50%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold mb-3 mt-2 px-2">Video Lessons</h3>
          
          {module.lessons.map((lesson) => (
            <div key={lesson.id} className={`flex items-start gap-3 p-3 rounded-lg ${lesson.id === activeLesson?.id ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-low border border-surface-container'}`}>
              <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${lesson.id === activeLesson?.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                {lesson.id === activeLesson?.id ? 'play_circle' : 'ondemand_video'}
              </span>
              <div>
                <p className={`font-label-md font-bold ${lesson.id === activeLesson?.id ? 'text-primary' : 'text-on-surface'}`}>
                  {lesson.orderIndex}. {lesson.title}
                </p>
                <span className={`font-body-sm ${lesson.id === activeLesson?.id ? 'text-primary/80' : 'text-on-surface-variant'}`}>
                  {lesson.id === activeLesson?.id ? 'Playing' : 'Not started'}
                </span>
              </div>
            </div>
          ))}

          <h3 className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold mb-3 mt-6 px-2">Assessments</h3>
          
          <div className="flex items-start gap-3 p-3 rounded-lg opacity-60">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mt-0.5">quiz</span>
            <div>
              <p className="font-label-md font-bold text-on-surface">Knowledge Check</p>
              <span className="font-body-sm text-on-surface-variant">Requires 80% to pass</span>
            </div>
          </div>

          <Link href="/dss/roleplay" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-surface-container transition-colors">
            <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">smart_toy</span>
            <div>
              <p className="font-label-md font-bold text-on-surface">AI Role-play: The CTO</p>
              <span className="font-body-sm text-on-surface-variant">Practical Application</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
