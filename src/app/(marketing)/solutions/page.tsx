import Link from 'next/link';
import { ArrowRight, Building2, GraduationCap, Briefcase, ShoppingBag } from 'lucide-react';

export default function SolutionsPage() {
 return (
 <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
 <div className="max-w-6xl mx-auto w-full">
 
 <div className="text-center mb-16">
 <div className="eyebrow mb-4">BUILT FOR YOUR INDUSTRY</div>
 <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-6">
 Solve Specific Revenue Leaks
 </h1>
 <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
 Whether you are closing enterprise software deals or enrolling students, our engine adapts to your exact sales velocity and ticket size.
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-12">
 
 <div className="group">
 <div className="h-48 bg-surface-container-high rounded-t-3xl flex items-center justify-center transition-colors group-hover:bg-primary-container">
 <Building2 size={48} className="text-on-surface-variant group-hover:text-primary transition-colors" />
 </div>
 <div className="bg-surface-container-low p-8 rounded-b-3xl border border-t-0 border-outline-variant/30">
 <h3 className="text-2xl font-bold text-on-surface mb-3">B2B SaaS & Tech</h3>
 <p className="text-on-surface-variant mb-6">
 Shorten sales cycles by instantly qualifying inbound leads. Automatically schedule demos with high-intent prospects while routing support requests away from sales reps.
 </p>
 <Link href="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
 Explore Tech Solutions <ArrowRight size={16} />
 </Link>
 </div>
 </div>

 <div className="group">
 <div className="h-48 bg-surface-container-high rounded-t-3xl flex items-center justify-center transition-colors group-hover:bg-primary-container">
 <GraduationCap size={48} className="text-on-surface-variant group-hover:text-primary transition-colors" />
 </div>
 <div className="bg-surface-container-low p-8 rounded-b-3xl border border-t-0 border-outline-variant/30">
 <h3 className="text-2xl font-bold text-on-surface mb-3">Education & Academies</h3>
 <p className="text-on-surface-variant mb-6">
 Turn more applicants into enrolled students. Track progression, automate follow-ups for abandoned applications, and integrate directly with your LMS.
 </p>
 <Link href="/dss" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
 See our DSS implementation <ArrowRight size={16} />
 </Link>
 </div>
 </div>

 <div className="group">
 <div className="h-48 bg-surface-container-high rounded-t-3xl flex items-center justify-center transition-colors group-hover:bg-primary-container">
 <Briefcase size={48} className="text-on-surface-variant group-hover:text-primary transition-colors" />
 </div>
 <div className="bg-surface-container-low p-8 rounded-b-3xl border border-t-0 border-outline-variant/30">
 <h3 className="text-2xl font-bold text-on-surface mb-3">Professional Services</h3>
 <p className="text-on-surface-variant mb-6">
 For consultants, agencies, and law firms. Ensure every high-ticket inquiry gets a white-glove response within minutes, automatically tracking client communication history.
 </p>
 <Link href="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
 Explore Services Solutions <ArrowRight size={16} />
 </Link>
 </div>
 </div>

 <div className="group">
 <div className="h-48 bg-surface-container-high rounded-t-3xl flex items-center justify-center transition-colors group-hover:bg-primary-container">
 <ShoppingBag size={48} className="text-on-surface-variant group-hover:text-primary transition-colors" />
 </div>
 <div className="bg-surface-container-low p-8 rounded-b-3xl border border-t-0 border-outline-variant/30">
 <h3 className="text-2xl font-bold text-on-surface mb-3">High-Ticket E-Commerce</h3>
 <p className="text-on-surface-variant mb-6">
 Recover abandoned carts for luxury or B2B physical goods via automated WhatsApp and SMS follow-ups. Escalate to human sales reps for negotiation.
 </p>
 <Link href="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
 Explore Retail Solutions <ArrowRight size={16} />
 </Link>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}
