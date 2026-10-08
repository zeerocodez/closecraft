import Link from 'next/link';
import { ArrowRight, Bot, Target, Workflow, LineChart } from 'lucide-react';

export default function RevenueEnginePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">THE CORE ALGORITHM</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-6">
            The Revenue Growth Engine
          </h1>
          <p className="text-xl text-on-surface-variant">
            A deterministic system designed to process leads, trigger automations, and assign human actions based on hard business logic.
          </p>
        </div>

        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-xl">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg">
              <Target size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">1. Signal Detection</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                The engine ingests signals from every touchpoint: website visits, form submissions, email opens, and webhook events. It standardizes these signals to calculate intent, fit, and urgency in real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-xl">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">2. AI Qualification & Priority</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Before a human ever sees the lead, our AI analyzes the data against your ideal customer profile. It generates an explainable priority score—never an opaque black box—so reps know exactly why a lead is hot.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-xl">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg">
              <Workflow size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">3. Next Best Action Allocation</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Every viable lead is assigned a deterministic state: Respond, Escalate, or Wait. The engine routes the action to the correct actor: AI for routine follow-ups, or Human for negotiation and closing.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-xl">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg">
              <LineChart size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">4. SLA Enforcement & Analytics</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                If a human rep fails to act within the SLA window, the engine flags it as Revenue Leakage. Analytics span the entire journey, providing absolute transparency from marketing source to cash.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-bold rounded-xl shadow-lg transition-all text-lg gap-2">
            Deploy the Engine <ArrowRight />
          </Link>
        </div>

      </div>
    </div>
  );
}
