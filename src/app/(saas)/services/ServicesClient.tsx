'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { reviewDeliveryTaskAction } from '@/app/(saas)/operator/workforceActions';

interface ServicePackageItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  suitableCustomerSummary: string;
  defaultBasePrice: number;
  currency: string;
  billingFrequency: string;
  slaDays: number;
  highlightFeature: string;
  coverageHours: string;
  responseExpectations: string;
  activitiesIncluded: string[];
  activitiesExcluded: string[];
}

interface ClientServiceItem {
  id: string;
  category: string;
  name: string;
  description: string;
  tier?: string;
  status: 'PENDING_SETUP' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  pricePaid: number;
  currency: string;
  billingFrequency: string;
  progressPercent: number;
  deliverables: Array<{ id: string; title: string; completed: boolean }>;
  deliveryTasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string | null;
    deliverableUrl?: string | null;
    completionNotes?: string | null;
    clientApproved?: boolean;
  }>;
  assignedTeamMember?: string;
  accountManagerEmail?: string;
  startDate?: string;
  paidThroughDate?: string;
  createdAt: string;
}

interface ServicesClientProps {
  packages: ServicePackageItem[];
  clientServices: ClientServiceItem[];
  organizationName: string;
}

export default function ServicesClient({
  packages,
  clientServices,
  organizationName,
}: ServicesClientProps) {
  const searchParams = useSearchParams();
  const purchased = searchParams?.get('purchased') === 'true';
  const canceled = searchParams?.get('canceled') === 'true';

  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_SERVICES'>(
    purchased || clientServices.length > 0 ? 'MY_SERVICES' : 'MARKETPLACE'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (purchased) {
      setActiveTab('MY_SERVICES');
    }
  }, [purchased]);

  const categories = [
    { id: 'ALL', label: 'All Services', icon: 'Grid' },
    { id: 'DIGITAL_SALES_SCHOOL', label: 'Digital Sales School (DSS)', icon: 'GraduationCap' },
    { id: 'LEAD_GENERATION', label: 'Lead Generation', icon: 'TrendingUp' },
    { id: 'LEAD_MANAGEMENT', label: 'Lead Management', icon: 'Users' },
    { id: 'APPOINTMENT_SETTING', label: 'Appointment Setting', icon: 'Calendar' },
    { id: 'SALES_CLOSING', label: 'Sales Closing', icon: 'CheckCircle' },
    { id: 'SALES_ENABLEMENT', label: 'Sales Enablement', icon: 'Award' },
  ];

  const filteredPackages = selectedCategory === 'ALL'
    ? packages
    : packages.filter(p => {
        if (selectedCategory === 'DIGITAL_SALES_SCHOOL') {
          return p.slug.startsWith('dss-') || p.category === 'DIGITAL_SALES_SCHOOL' || p.category === 'SALES_ENABLEMENT';
        }
        return p.category === selectedCategory;
      });

  const handlePurchase = async (pkg: ServicePackageItem) => {
    setPurchasingSlug(pkg.slug);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/services/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageSlug: pkg.slug }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      // Redirect directly to Bachs hosted checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Purchase error:', err);
      setErrorMessage(err.message || 'Unable to start checkout. Please try again.');
      setPurchasingSlug(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Service
          </span>
        );
      case 'PENDING_SETUP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Setup in Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              GROWTH MARKETPLACE
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {organizationName}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Revenue Services & Marketplace
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Acquire qualified leads, automate response times, book qualified appointments, and close more sales with modular CloseCraft services.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1 bg-surface-container rounded-2xl border border-outline-variant/40 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('MY_SERVICES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MY_SERVICES'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name="Briefcase" size={16} />
            <span>My Active Services</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'MY_SERVICES' ? 'bg-black/25 text-white' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {clientServices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MARKETPLACE'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name="PlusCircle" size={16} />
            <span>Add Services</span>
          </button>
        </div>
      </div>

      {purchased && !bannerDismissed && (
        <div className="p-4 md:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs md:text-sm flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Icon name="CheckCircle" size={20} />
            </div>
            <div>
              <p className="font-bold text-emerald-300 text-sm md:text-base">
                Payment Confirmed & Service Package Activated!
              </p>
              <p className="text-emerald-200/80 text-xs mt-0.5 leading-relaxed">
                Your service package is now active. Your deliverables checklist and assigned team specialist are listed below. Our operations team has received your onboarding profile and is currently preparing your setup.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setBannerDismissed(true)} 
            className="text-emerald-400 hover:text-emerald-200 text-base font-bold px-2 py-1"
            aria-label="Dismiss banner"
          >
            &times;
          </button>
        </div>
      )}

      {canceled && !bannerDismissed && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="AlertCircle" size={18} className="shrink-0 text-amber-400" />
            <span>Checkout was cancelled. Feel free to browse and activate any service package whenever you are ready.</span>
          </div>
          <button onClick={() => setBannerDismissed(true)} className="text-amber-400 hover:text-amber-200 px-2">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="AlertCircle" size={18} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            &times;
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: MY ACTIVE SERVICES                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'MY_SERVICES' && (
        <div className="space-y-6">
          {clientServices.length === 0 ? (
            <div className="p-8 md:p-12 rounded-3xl bg-surface-container-low border border-outline-variant/40 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
                <Icon name="Briefcase" size={32} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-on-surface mb-2">No active services yet</h2>
              <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                Add modular customer acquisition, appointment setting, or sales closing support to supercharge your workspace revenue engine.
              </p>
              <button
                onClick={() => setActiveTab('MARKETPLACE')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
              >
                <Icon name="PlusCircle" size={16} />
                <span>Explore Service Catalogue &rarr;</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clientServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-3xl bg-surface-container-low border border-outline-variant/40 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Top Row: Category + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {service.category.replace(/_/g, ' ')}
                      </span>
                      {getStatusBadge(service.status)}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{service.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">Delivery Progress</span>
                        <span className="text-primary font-bold">{service.progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${service.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Deliverables Checklist */}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-on-surface">Deliverables & Milestones:</span>
                        <div className="space-y-1.5">
                          {service.deliverables.map((item, idx) => (
                            <div key={item.id || idx} className="flex items-start gap-2 text-xs">
                              <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                                item.completed ? 'text-emerald-400' : 'text-on-surface-variant/50'
                              }`}>
                                {item.completed ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                              <span className={item.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'}>
                                {item.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Delivery Tasks & Artifact Approvals */}
                    {service.deliveryTasks && service.deliveryTasks.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                        <span className="text-xs font-semibold text-on-surface">Service Delivery Tasks & Proofs:</span>
                        <div className="space-y-2">
                          {service.deliveryTasks.map((t: any) => (
                            <div key={t.id} className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-start justify-between gap-2 text-xs">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-on-surface">{t.title}</span>
                                  {t.status === 'COMPLETED' ? (
                                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                      Done
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400">
                                      {t.status.replace(/_/g, ' ')}
                                    </span>
                                  )}
                                </div>
                                {t.deliverableUrl && (
                                  <div>
                                    <a
                                      href={t.deliverableUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                                    >
                                      <Icon name="ExternalLink" size={12} />
                                      <span>Proof: {t.deliverableUrl}</span>
                                    </a>
                                  </div>
                                )}
                              </div>

                              {t.status === 'COMPLETED' && !t.clientApproved && (
                                <button
                                  onClick={async () => {
                                    await reviewDeliveryTaskAction({
                                      taskId: t.id,
                                      decision: 'APPROVE',
                                      isClientApproval: true,
                                    });
                                    window.location.reload();
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 shadow-xs shrink-0"
                                >
                                  Approve
                                </button>
                              )}

                              {t.clientApproved && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                  Approved ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Specialist & Contact */}
                    <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Icon name="UserCheck" size={16} className="text-primary" />
                        <div>
                          <p className="font-semibold text-on-surface">{service.assignedTeamMember || 'CloseCraft Lead Specialist'}</p>
                          <p className="text-[11px] text-on-surface-variant">Dedicated Service Lead</p>
                        </div>
                      </div>
                      <a
                        href={`mailto:${service.accountManagerEmail || 'sales@closecrafthq.com'}?subject=${encodeURIComponent(`[Service Inquiry] ${service.name} (${organizationName})`)}`}
                        className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:text-primary transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <Icon name="Mail" size={14} />
                        <span>Email Team</span>
                      </a>
                    </div>

                    {/* DSS Quick Portal Action if applicable */}
                    {(service.name.includes('DSS') || service.category.includes('ENABLEMENT') || service.category.includes('TRAINING')) && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <Link
                          href="/dss"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/25 transition-colors"
                        >
                          <Icon name="GraduationCap" size={14} />
                          <span>Launch DSS Academy Portal &rarr;</span>
                        </Link>
                        <Link
                          href="/practice"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors"
                        >
                          <Icon name="PlayCircle" size={14} />
                          <span>AI Roleplay Studio</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Footer Row: Pricing & Actions */}
                  <div className="pt-4 mt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                    <div>
                      <span>Billing: </span>
                      <strong className="text-on-surface">
                        ₦{service.pricePaid.toLocaleString()} / {service.billingFrequency.toLowerCase()}
                      </strong>
                    </div>
                    {service.paidThroughDate && (
                      <span className="text-[11px]">
                        Active through: {new Date(service.paidThroughDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-on-surface text-sm">Need a custom enterprise sales package?</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                We combine advertising, appointment setting, and dedicated commission closers for qualified businesses.
              </p>
            </div>
            <Link
              href="/sales-support/request"
              className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Request Custom Proposal</span>
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: MARKETPLACE CATALOGUE                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Icon name={cat.icon} size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const isPurchasing = purchasingSlug === pkg.slug;
              return (
                <div
                  key={pkg.id}
                  className="rounded-3xl bg-surface-container-low border border-outline-variant/40 p-6 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Category & SLA */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {pkg.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                        <Icon name="Clock" size={12} className="text-primary" />
                        {pkg.slaDays}-Day Onboarding SLA
                      </span>
                    </div>

                    {/* Title & Price */}
                    <div>
                      <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                        {pkg.title}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-extrabold text-on-surface">
                          ₦{pkg.defaultBasePrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          / {pkg.billingFrequency.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    {/* Highlight Feature Badge */}
                    <div className="p-2.5 rounded-xl bg-surface-container text-xs text-on-surface font-medium flex items-center gap-2 border border-outline-variant/20">
                      <Icon name="Zap" size={16} className="text-amber-400 shrink-0" />
                      <span>{pkg.highlightFeature}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Suitable Customer */}
                    <div className="p-3 rounded-2xl bg-surface-container-lowest/60 text-xs space-y-1">
                      <span className="font-semibold text-on-surface text-[11px]">Best suited for:</span>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed">
                        {pkg.suitableCustomerSummary}
                      </p>
                    </div>

                    {/* Deliverables Included */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-semibold text-on-surface">What is included:</span>
                      <ul className="space-y-1.5">
                        {pkg.activitiesIncluded.slice(0, 4).map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-on-surface-variant">
                            <Icon name="Check" size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Purchase CTA */}
                  <div className="pt-6 mt-6 border-t border-outline-variant/30">
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={isPurchasing}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                        isPurchasing
                          ? 'bg-primary-container text-primary-fixed opacity-70 pointer-events-none'
                          : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.99]'
                      }`}
                    >
                      {isPurchasing ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          <span>Preparing Secure Checkout...</span>
                        </>
                      ) : (
                        <>
                          <span>Select & Activate Service</span>
                          <Icon name="ArrowRight" size={16} />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-on-surface-variant mt-2">
                      Instant setup • Verified Bachs payment • No contract lock-in
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

