import os

base_dir = r"C:\Users\USER\Desktop\closecraft\src\app\(marketing)"

pages_content = {
    "platform": """import Link from 'next/link';
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
""",
    "solutions": """import Link from 'next/link';
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
""",
    "revenue-engine": """import Link from 'next/link';
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
""",
    "integrations": """import Link from 'next/link';
import { ArrowRight, Code2, Link as LinkIcon, Webhook, Blocks } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto w-full">
        
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">ECOSYSTEM CONNECTIVITY</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-6">
            Works Where You Work
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Closecraft isn't another silo. It natively integrates with your existing marketing stack, CRM, and billing providers to act as the central nervous system for revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-[#25D366] text-white rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
              W
            </div>
            <h3 className="font-bold text-on-surface mb-2">WhatsApp Business</h3>
            <p className="text-sm text-on-surface-variant">Trigger automated messages and capture replies directly in the Inbox.</p>
          </div>

          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-[#FF4F00] text-white rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
              Z
            </div>
            <h3 className="font-bold text-on-surface mb-2">Zapier</h3>
            <p className="text-sm text-on-surface-variant">Connect to 5,000+ apps. Trigger engine workflows from any external event.</p>
          </div>

          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-[#00A1E0] text-white rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
              SF
            </div>
            <h3 className="font-bold text-on-surface mb-2">Salesforce</h3>
            <p className="text-sm text-on-surface-variant">Bi-directional sync of leads, opportunities, and custom object statuses.</p>
          </div>

          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-[#0ABF53] text-white rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
              P
            </div>
            <h3 className="font-bold text-on-surface mb-2">Paystack</h3>
            <p className="text-sm text-on-surface-variant">Verify subscription state and process billing webhooks idempotently.</p>
          </div>

        </div>

        <div className="bg-inverse-surface text-inverse-on-surface p-10 rounded-3xl grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Custom API Access</h2>
            <p className="text-inverse-on-surface/80 mb-6">
              Need something custom? Our GraphQL and REST APIs give your engineering team full read/write access to the Revenue Engine's core entities.
            </p>
            <button className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors">
              Read Developer Docs
            </button>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-xl font-mono text-sm text-[#D4D4D4] overflow-x-auto border border-[#333]">
<pre><code>{`fetch('https://api.closecraft.com/v1/leads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'prospect@acme.com',
    intent: 'HIGH',
    source: 'custom_widget'
  })
});`}</code></pre>
          </div>
        </div>

      </div>
    </div>
  );
}
""",
    "case-studies": """import Link from 'next/link';
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
"""
}

# Write each generated file directly to the relevant directory
for slug, content in pages_content.items():
    page_dir = os.path.join(base_dir, slug)
    os.makedirs(page_dir, exist_ok=True)
    with open(os.path.join(page_dir, "page.tsx"), "w", encoding="utf-8") as f:
        f.write(content)

print("Successfully generated all production-ready marketing pages with tailored content.")
