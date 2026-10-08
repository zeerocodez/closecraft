import Link from 'next/link';
import { ArrowRight, BookOpen, BrainCircuit, Rocket } from 'lucide-react';

export default function DSSApplyPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-20">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 md:py-20 flex flex-col items-center">
        <div className="mb-8 w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center">
          <BookOpen className="text-primary w-8 h-8" />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Digital Sales School Academy
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Master the art of modern digital sales. Train with our AI roleplay engine, earn your certification, and get placed in high-growth revenue roles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full mb-12">
          <div className="bg-surface-container-low p-8 rounded-2xl shadow-sm border border-outline-variant/30">
            <h2 className="text-2xl font-bold mb-6 text-on-surface">Curriculum Overview</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <BrainCircuit className="text-primary shrink-0" />
                <span><strong className="text-on-surface">AI-Powered Roleplay:</strong> Practice pitches and handle objections against our dynamic AI buyers.</span>
              </li>
              <li className="flex gap-3">
                <Rocket className="text-primary shrink-0" />
                <span><strong className="text-on-surface">Revenue Engine Training:</strong> Learn how to orchestrate automated follow-ups and pipeline management.</span>
              </li>
              <li className="flex gap-3">
                <BookOpen className="text-primary shrink-0" />
                <span><strong className="text-on-surface">Certification:</strong> Pass the final exam to earn your globally recognized digital sales credential.</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-on-surface">Student Application</h2>
            <form className="space-y-4" action="/dss">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                <input type="text" required className="w-full h-11 px-3 rounded bg-surface-container-highest text-on-surface border border-outline-variant focus:outline-primary" placeholder="Enter your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
                <input type="email" required className="w-full h-11 px-3 rounded bg-surface-container-highest text-on-surface border border-outline-variant focus:outline-primary" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Current Role / Experience</label>
                <select className="w-full h-11 px-3 rounded bg-surface-container-highest text-on-surface border border-outline-variant focus:outline-primary">
                  <option>No sales experience</option>
                  <option>1-2 years experience</option>
                  <option>3+ years experience</option>
                </select>
              </div>
              <button type="submit" className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-bold rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors">
                Apply & Start Learning <ArrowRight size={18} />
              </button>
            </form>
            <p className="text-xs text-on-surface-variant text-center mt-4">
              By applying, you agree to our Terms of Service. Next cohort starts next week.
            </p>
          </div>
        </div>

        <Link href="/dss" className="text-primary hover:underline font-medium">
          Already a student? Enter the LMS directly
        </Link>
      </div>
    </div>
  );
}
