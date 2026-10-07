import { requireStudent, curriculumAccess } from '@/lib/access';
import Link from 'next/link';

export default async function CurriculumPage() {
  const student = await requireStudent();
  const dbModules = await curriculumAccess(student);

  // Group modules into a single "Part 1" for MVP demonstration
  // In a complete implementation, 'Part' would be its own database model.
  const parts = [
    {
      id: 'part-1',
      title: 'Part 1: The Commercial Mindset',
      description: 'Understanding the psychology of enterprise sales and the digital revenue journey.',
      modules: dbModules.length > 0 ? dbModules.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        lessonsCount: m._count.lessons,
      })) : [
        { id: 'm1', title: 'Module 1: No modules available', status: 'LOCKED', lessonsCount: 0 },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Curriculum</h1>
        <p className="font-body-lg text-on-surface-variant">
          Complete modules sequentially. You must pass all required assessments and AI Role-plays to unlock the next module.
        </p>
      </div>

      <div className="space-y-8">
        {parts.map((part) => (
          <div key={part.id} className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
            <div className="bg-surface-container-low px-6 py-5 border-b border-surface-container">
              <h2 className="font-headline-sm font-bold text-on-surface">{part.title}</h2>
              <p className="font-body-sm text-on-surface-variant mt-1">{part.description}</p>
            </div>
            
            <div className="divide-y divide-surface-container">
              {part.modules.map((module) => (
                <div key={module.id} className="p-4 flex items-center justify-between hover:bg-surface-container-lowest/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      {module.status === 'COMPLETED' && (
                        <div className="w-full h-full rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">check</span>
                        </div>
                      )}
                      {module.status === 'ACTIVE' && (
                        <div className="w-full h-full rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center border-2 border-tertiary border-dashed animate-[spin_10s_linear_infinite]">
                          <span className="material-symbols-outlined text-[20px] animate-[spin_10s_linear_infinite_reverse]">play_arrow</span>
                        </div>
                      )}
                      {module.status === 'LOCKED' && (
                        <div className="w-full h-full rounded-full bg-surface-container-high/50 text-on-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`font-label-lg font-bold ${module.status === 'LOCKED' ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 font-body-sm text-on-surface-variant text-xs">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">ondemand_video</span> {module.lessonsCount} Lessons</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">quiz</span> 1 Quiz</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">smart_toy</span> 1 Role-play</span>
                      </div>
                    </div>
                  </div>

                  {module.status === 'ACTIVE' ? (
                    <Link href={`/dss/curriculum/${module.id}`} className="px-6 py-2 bg-primary text-on-primary font-label-md font-bold rounded-lg shadow-md hover:bg-primary-container transition-colors">
                      Start
                    </Link>
                  ) : module.status === 'COMPLETED' ? (
                    <Link href={`/dss/curriculum/${module.id}`} className="px-6 py-2 bg-surface-container-high text-on-surface font-label-md font-bold rounded-lg hover:bg-surface-container-highest transition-colors">
                      Review
                    </Link>
                  ) : (
                    <button disabled className="px-6 py-2 bg-surface-container text-on-surface-variant font-label-md font-bold rounded-lg cursor-not-allowed opacity-50">
                      Locked
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
