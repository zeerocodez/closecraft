import LeadCaptureForm from '@/components/marketing/LeadCaptureForm';
import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-on-surface">
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-inverse-surface/95 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12 shadow-sm border-b border-surface-container-high/20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[24px]">rocket_launch</span>
          </div>
          <span className="font-headline-sm text-headline-sm font-bold text-inverse-on-surface tracking-tight ml-1">CLOSECRAFT</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#platform" className="font-label-md text-label-md text-inverse-on-surface/80 hover:text-inverse-on-surface transition-colors">Platform</Link>
          <Link href="#training" className="font-label-md text-label-md text-inverse-on-surface/80 hover:text-inverse-on-surface transition-colors">Training</Link>
          <Link href="#business" className="font-label-md text-label-md text-inverse-on-surface/80 hover:text-inverse-on-surface transition-colors">For Businesses</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="font-label-md text-label-md text-inverse-on-surface hover:text-primary-fixed transition-colors font-medium hidden sm:block">
            Login
          </Link>
          <Link href="#apply" className="h-10 px-5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <span>Start Free</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-inverse-surface text-inverse-on-surface pt-24 pb-32 px-6 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-inverse-surface to-inverse-surface opacity-60"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/10 self-center lg:self-start border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-caps text-label-caps uppercase text-primary-fixed tracking-wider font-bold">The Revenue Operating System</span>
              </div>
              
              <h1 className="font-display-lg text-4xl lg:text-6xl font-bold tracking-tight leading-tight text-inverse-on-surface">
                Learn to Close. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed to-primary">Get Paid to Close.</span>
              </h1>
              
              <p className="font-body-lg text-body-lg text-inverse-on-surface/80 max-w-xl mx-auto lg:mx-0 leading-relaxed text-lg">
                The unified platform connecting elite, AI-augmented sales talent with high-growth businesses. Stop hunting for leads. Start closing deals.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center lg:justify-start">
                <Link href="#apply" className="h-14 px-8 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                  <span>Join as a Closer</span>
                  <span className="material-symbols-outlined">how_to_reg</span>
                </Link>
                <Link href="/business-demo" className="h-14 px-8 bg-surface-container-highest/10 hover:bg-surface-container-highest/20 text-inverse-on-surface font-headline-sm text-headline-sm font-semibold rounded-lg flex items-center justify-center gap-2 border border-surface-container-high/30 transition-all w-full sm:w-auto">
                  <span>Hire Closers</span>
                  <span className="material-symbols-outlined">domain</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start opacity-70">
                <div className="flex flex-col">
                  <span className="font-metric-numeral-lg text-2xl font-bold text-inverse-on-surface">₦4B+</span>
                  <span className="font-label-caps text-label-caps tracking-wider uppercase text-inverse-on-surface/60">Revenue Closed</span>
                </div>
                <div className="w-px h-10 bg-surface-container-high/20"></div>
                <div className="flex flex-col">
                  <span className="font-metric-numeral-lg text-2xl font-bold text-inverse-on-surface">1,200+</span>
                  <span className="font-label-caps text-label-caps tracking-wider uppercase text-inverse-on-surface/60">Certified Closers</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary rounded-2xl blur-lg opacity-30"></div>
              <div className="relative rounded-2xl bg-surface p-2 shadow-2xl border border-surface-container">
                <div className="rounded-xl overflow-hidden bg-surface-container-lowest">
                  {/* Mock Dashboard Preview */}
                  <div className="h-10 bg-inverse-surface flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-error/80"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary/80"></div>
                  </div>
                  <div className="p-6">
                    <div className="w-1/3 h-4 rounded bg-surface-container mb-6"></div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="h-24 rounded bg-surface-container-low border border-surface-container"></div>
                      <div className="h-24 rounded bg-surface-container-low border border-surface-container"></div>
                    </div>
                    <div className="h-8 rounded bg-primary/10 w-1/4 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-12 rounded bg-surface-container-low w-full"></div>
                      <div className="h-12 rounded bg-surface-container-low w-full"></div>
                      <div className="h-12 rounded bg-surface-container-low w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Pipeline Section */}
        <section className="py-24 px-6 lg:px-12 bg-surface">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface mb-4">The Complete Revenue Pipeline</h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto text-lg">
              We don't just teach theory. We provide the platform, the leads, the AI, and the environment required to close deals at scale.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Value Prop 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">school</span>
              </div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3">Skill & Practice</h3>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Master enterprise sales mechanics. Roleplay against our AI prospect simulator until your objection handling is flawless.
              </p>
            </div>
            
            {/* Value Prop 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="w-14 h-14 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-6 relative z-10">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3 relative z-10">Proof & Certification</h3>
              <p className="font-body-md text-on-surface-variant leading-relaxed relative z-10">
                Earn your CloseCraft Certification. Your conversion metrics become your immutable resume to the world's best companies.
              </p>
            </div>
            
            {/* Value Prop 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">work</span>
              </div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3">Opportunity & Revenue</h3>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Access a live queue of high-intent leads from our partner businesses. Qualify, pitch, close, and get paid your commission.
              </p>
            </div>
          </div>
        </section>

        {/* Application / CTA Section */}
        <section id="apply" className="py-24 px-6 lg:px-12 bg-surface-container-low border-t border-surface-container">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-headline-xl text-3xl md:text-5xl font-bold text-on-surface mb-6 leading-tight">
                Ready to accelerate your earning potential?
              </h2>
              <p className="font-body-lg text-on-surface-variant text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                Submit your application to join the CloseCraft network. Our platform is selective, but we welcome hungry beginners willing to learn the craft.
              </p>
              
              <ul className="space-y-4 font-body-md text-on-surface text-left max-w-md mx-auto lg:mx-0">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span>Access to AI objection handling simulators</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span>Direct pipeline to real business opportunities</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span>Zero upfront fees; we win when you close</span>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center lg:justify-end">
              <LeadCaptureForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-12 px-6 lg:px-12 border-t border-surface-container-high/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            <span className="font-headline-sm text-sm font-bold tracking-widest uppercase">Closecraft</span>
          </div>
          <div className="font-body-sm text-inverse-on-surface/50 text-sm">
            © {new Date().getFullYear()} Closecraft Revenue Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-4 font-body-sm text-inverse-on-surface/70 text-sm">
            <Link href="/privacy" className="hover:text-inverse-on-surface transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-inverse-on-surface transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
