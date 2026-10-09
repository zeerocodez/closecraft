import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
 return (
 <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
 <div className="max-w-6xl mx-auto w-full">
 
 <div className="text-center mb-16">
 <div className="eyebrow mb-4">AFFORDABLE GROWTH</div>
 <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6">
 Simple, Transparent Pricing
 </h1>
 <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
 Scale your revenue engine without the enterprise bloat. Start optimizing your pipeline today.
 </p>
 </div>

 <div className="grid md:grid-cols-3 gap-8">
 
 {/* Tier 1 */}
 <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col">
 <h3 className="text-xl font-bold text-on-surface mb-2">Starter</h3>
 <p className="text-on-surface-variant text-sm mb-6">For small teams building their first automated pipeline.</p>
 <div className="mb-6">
 <span className="text-4xl font-bold text-on-surface">₦15,000</span>
 <span className="text-on-surface-variant">/mo</span>
 </div>
 <ul className="space-y-4 mb-8 flex-1">
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Up to 1,000 active leads/mo</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Basic Revenue Inbox</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">2 Team Members</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Standard Support</span></li>
 </ul>
 <Link href="/" className="w-full py-3 rounded-lg border border-outline text-on-surface text-center font-semibold hover:bg-surface-container transition-colors">
 Request Proposal
 </Link>
 </div>

 {/* Tier 2 - Recommended */}
 <div className="bg-primary-container p-8 rounded-3xl border-2 border-primary flex flex-col relative transform md:-translate-y-4 shadow-xl">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
 Most Popular
 </div>
 <h3 className="text-xl font-bold text-on-primary-container mb-2">Growth Engine</h3>
 <p className="text-on-primary-container/80 text-sm mb-6">For scaling companies needing advanced AI automation.</p>
 <div className="mb-6">
 <span className="text-4xl font-bold text-on-primary-container">₦35,000</span>
 <span className="text-on-primary-container/80">/mo</span>
 </div>
 <ul className="space-y-4 mb-8 flex-1">
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container font-medium">Everything in Starter, plus:</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">Up to 10,000 active leads/mo</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">AI Roleplay & Scoring</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">10 Team Members</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">Priority 24/7 Support</span></li>
 </ul>
 <Link href="/" className="w-full py-3 rounded-lg bg-primary text-on-primary text-center font-semibold hover:bg-primary/90 transition-colors shadow-sm">
 Request Proposal
 </Link>
 </div>

 {/* Tier 3 */}
 <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col">
 <h3 className="text-xl font-bold text-on-surface mb-2">Enterprise</h3>
 <p className="text-on-surface-variant text-sm mb-6">Custom architectures and unlimited scale.</p>
 <div className="mb-6">
 <span className="text-4xl font-bold text-on-surface">₦75,000</span>
 <span className="text-on-surface-variant">/mo</span>
 </div>
 <ul className="space-y-4 mb-8 flex-1">
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Unlimited leads/mo</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Custom CRM Integrations</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Unlimited Team Members</span></li>
 <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Dedicated Success Manager</span></li>
 </ul>
 <Link href="/" className="w-full py-3 rounded-lg border border-outline text-on-surface text-center font-semibold hover:bg-surface-container transition-colors">
 Request Proposal
 </Link>
 </div>

 </div>

 <div className="mt-12 text-center">
 <p className="text-sm text-on-surface-variant italic">
 * The prices listed above are illustrative demo prices. Actual deployment and infrastructure costs may vary. Please request a proposal for a confirmed offer.
 </p>
 </div>

 </div>
 </div>
 );
}
