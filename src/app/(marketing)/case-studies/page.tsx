import Link from 'next/link';
import { ArrowRight, TrendingUp, Clock, Users } from 'lucide-react';

export default function CaseStudiesPage() {
 return (
 <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
 <div className="max-w-6xl mx-auto w-full">
 
 <div className="text-center mb-16">
 <div className="eyebrow mb-4">PROVEN RESULTS</div>
 <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-6">
 Stop Guessing. Start Growing.
 </h1>
 <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
 See how high-growth organizations use the Closecraft Revenue Engine to eliminate pipeline leakage and multiply sales output.
 </p>
 </div>

 <div className="space-y-16">
 
 {/* Case Study 1 */}
 <div className="grid md:grid-cols-2 gap-8 items-center bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-outline-variant/30 shadow-xl">
 <div>
 <div className="text-3xl font-bold text-on-surface mb-2">Zeerocodes Digital Sales School</div>
 <div className="text-primary font-semibold mb-6">EdTech / Online Academy</div>
 <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
 Faced with thousands of inbound applications, DSS needed a way to qualify serious students without burning out their admissions team. By implementing the AI Roleplay Engine and automated SLA follow-ups, they drastically reduced response times.
 </p>
 
 <div className="grid grid-cols-2 gap-6 mb-8">
 <div>
 <div className="text-3xl font-black text-on-surface flex items-center gap-2">
 <TrendingUp className="text-primary" /> 312%
 </div>
 <div className="text-sm text-on-surface-variant">Increase in conversion</div>
 </div>
 <div>
 <div className="text-3xl font-black text-on-surface flex items-center gap-2">
 <Clock className="text-primary" /> {'<'} 1 min
 </div>
 <div className="text-sm text-on-surface-variant">Average response time</div>
 </div>
 </div>
 
 <Link href="/dss" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
 View the DSS implementation <ArrowRight size={16} />
 </Link>
 </div>
 <div className="h-full min-h-[300px] bg-surface-container-high rounded-2xl flex items-center justify-center p-8 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
 <div className="relative z-10 w-full max-w-sm bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-outline-variant/20">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
 <Users size={20} />
 </div>
 <div>
 <div className="font-bold text-on-surface">Cohort 14 Activation</div>
 <div className="text-xs text-on-surface-variant">Automated Sequence</div>
 </div>
 </div>
 <div className="space-y-3">
 <div className="h-2 bg-primary/20 rounded-full w-full"></div>
 <div className="h-2 bg-primary/20 rounded-full w-5/6"></div>
 <div className="h-2 bg-primary/20 rounded-full w-4/6"></div>
 </div>
 <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
 <span className="text-sm font-semibold text-on-surface">Qualified: 482</span>
 <span className="text-xs font-bold px-2 py-1 bg-[#25D366]/20 text-[#128C7E] rounded">WhatsApp Sent</span>
 </div>
 </div>
 </div>
 </div>

 </div>

 <div className="mt-20 text-center bg-primary-container p-12 rounded-3xl">
 <h2 className="text-3xl font-bold text-on-primary-container mb-4">Ready to be our next success story?</h2>
 <p className="text-on-primary-container/80 mb-8 max-w-xl mx-auto">
 Book an executive demo today to see exactly how much revenue is leaking from your current pipeline.
 </p>
 <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary hover:bg-on-primary hover:text-primary font-bold rounded-xl shadow-md transition-all gap-2">
 Get Started Now <ArrowRight />
 </Link>
 </div>

 </div>
 </div>
 );
}
