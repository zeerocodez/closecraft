import Link from 'next/link';
import { ArrowRight, Layers, Zap, ShieldCheck, Database, MessagesSquare } from 'lucide-react';

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto w-full">
        
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">THE OPERATING SYSTEM FOR SALES</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-6">
            One Platform. One Source of Truth.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Stop jumping between spreadsheets, email clients, and CRMs. Closecraft unifies your entire revenue pipeline into a single, intelligent workspace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
              <MessagesSquare />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Unified Lead Inbox</h3>
            <p className="text-on-surface-variant text-sm">
              All your incoming leads from web forms, WhatsApp, and social media routed into a single queue. Never miss a message again.
            </p>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
              <Layers />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Visual Pipeline</h3>
            <p className="text-on-surface-variant text-sm">
              Track deals seamlessly from New Lead to Closed Won. Drag and drop deals across stages with automated event triggers at every step.
            </p>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
              <Zap />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">AI Next Best Action</h3>
            <p className="text-on-surface-variant text-sm">
              Our AI analyzes lead behavior and tells your reps exactly who to call, when to email, and what to say.
            </p>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
              <ShieldCheck />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Tenant Isolation</h3>
            <p className="text-on-surface-variant text-sm">
              Enterprise-grade security. Every workspace is logically isolated, ensuring your proprietary customer data is never cross-contaminated.
            </p>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 lg:col-span-2">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
              <Database />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Revenue Attribution</h3>
            <p className="text-on-surface-variant text-sm">
              Trace every closed deal back to its original marketing source. Stop guessing which campaigns drive actual cash and start investing with certainty.
            </p>
            <Link href="/pricing" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              View Pricing <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
