'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  GROWTH_SERVICES,
  GrowthServiceKey,
} from '@/lib/growth/services';
import ProjectBriefModal from '@/components/growth/ProjectBriefModal';
import { reviewDeliveryTaskAction } from '@/app/(saas)/operator/workforceActions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Target,
  Image as ImageIcon,
  Video,
  Layout,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Briefcase,
  Layers,
  Plus,
  Clock,
  UserCheck,
  FileText,
  DollarSign,
  AlertCircle,
  X,
  ShoppingCart,
  ShieldCheck,
  Mail,
  Zap,
} from 'lucide-react';

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
  startDate?: string | null;
  paidThroughDate?: string | null;
  createdAt: string;
}

interface ProjectRequestItem {
  id: string;
  reference: string;
  status: string;
  services: string[];
  whatsappThreadUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  brief?: {
    businessName: string;
    industry: string;
    primaryGoal: string;
    urgency: string;
  } | null;
  assignedPartner?: {
    id: string;
    fullName: string;
    bio?: string | null;
    rating: number;
    completedProjectsCount: number;
  } | null;
  latestProposal?: {
    id: string;
    proposalNumber: string;
    totalAmount: number | string;
    currency: string;
    status: string;
  } | null;
  latestInvoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number | string;
    currency: string;
    status: string;
    bachsCheckoutUrl?: string | null;
  } | null;
  milestones: Array<{
    id: string;
    title: string;
    status: string;
    sequenceOrder: number;
    clientApproved: boolean;
    proofUrl?: string | null;
  }>;
}

interface ServicesClientProps {
  packages: ServicePackageItem[];
  clientServices: ClientServiceItem[];
  projectRequests: ProjectRequestItem[];
  organizationName: string;
}

const SERVICE_KEYS: GrowthServiceKey[] = [
  'ADS_MANAGEMENT',
  'AI_FLYER_DESIGN',
  'AI_VIDEO_CREATION',
  'LANDING_PAGE_DESIGN',
  'VSL_DESIGN',
];

export default function ServicesClient({
  packages,
  clientServices,
  projectRequests = [],
  organizationName,
}: ServicesClientProps) {
  const searchParams = useSearchParams();
  const purchased = searchParams?.get('purchased') === 'true';
  const canceled = searchParams?.get('canceled') === 'true';

  // Tabs: 'GROWTH' (Introductory 5 Services), 'ACTIVE' (My Projects & Services), 'SUBSCRIPTIONS' (Self-Service Packages)
  const defaultTab =
    purchased || projectRequests.length > 0 || clientServices.length > 0
      ? 'ACTIVE'
      : 'GROWTH';
  const [activeTab, setActiveTab] = useState<'GROWTH' | 'ACTIVE' | 'SUBSCRIPTIONS'>(defaultTab);

  // Multi-service basket selection state
  const [selectedBasket, setSelectedBasket] = useState<GrowthServiceKey[]>([]);

  // Project Brief modal state
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [briefInitialService, setBriefInitialService] = useState<GrowthServiceKey | null>(null);

  // Self-service purchase states
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (purchased) {
      setActiveTab('ACTIVE');
    }
  }, [purchased]);

  const toggleBasketService = (key: GrowthServiceKey) => {
    if (selectedBasket.includes(key)) {
      setSelectedBasket(selectedBasket.filter((k) => k !== key));
    } else {
      setSelectedBasket([...selectedBasket, key]);
    }
  };

  const handleOpenBrief = (serviceKey?: GrowthServiceKey) => {
    if (serviceKey) {
      setBriefInitialService(serviceKey);
      if (!selectedBasket.includes(serviceKey)) {
        setSelectedBasket([serviceKey]);
      }
    } else {
      setBriefInitialService(selectedBasket.length > 0 ? selectedBasket[0] : 'ADS_MANAGEMENT');
    }
    setIsBriefModalOpen(true);
  };

  const handleSelfServicePurchase = async (pkg: ServicePackageItem) => {
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

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Purchase error:', err);
      setErrorMessage(err.message || 'Unable to start checkout. Please try again.');
      setPurchasingSlug(null);
    }
  };

  const getServiceIcon = (key: GrowthServiceKey) => {
    switch (key) {
      case 'ADS_MANAGEMENT':
        return <Target className="w-5 h-5 text-primary" />;
      case 'AI_FLYER_DESIGN':
        return <ImageIcon className="w-5 h-5 text-amber-400" />;
      case 'AI_VIDEO_CREATION':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'LANDING_PAGE_DESIGN':
        return <Layout className="w-5 h-5 text-emerald-400" />;
      case 'VSL_DESIGN':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_DELIVERY':
      case 'ACTIVE':
        return <Badge variant="success" dot>In Delivery</Badge>;
      case 'PROPOSAL_SENT':
        return <Badge variant="warning" dot>Proposal Ready</Badge>;
      case 'INVOICED':
        return <Badge variant="warning" dot>Awaiting Payment</Badge>;
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'ASSIGNED':
      case 'CONSULTING':
        return <Badge variant="info">Partner Assigned</Badge>;
      case 'PENDING_ASSIGNMENT':
      case 'PENDING_SETUP':
        return <Badge variant="info" dot>Matching Specialist</Badge>;
      case 'COMPLETED':
        return <Badge variant="neutral">Completed</Badge>;
      default:
        return <Badge variant="neutral">{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  const activeItemsCount = projectRequests.length + clientServices.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Heading & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              CLOSECRAFT SERVICES
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {organizationName}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Commercial Growth & Marketing Services
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Acquire high-intent customers, automate sales funnels, and produce high-converting creative assets with our vetted specialist partners.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-2xl border border-outline-variant/40 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('GROWTH')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'GROWTH'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Sparkles size={15} />
            <span>Growth Services</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Briefcase size={15} />
            <span>My Active Projects & Services</span>
            {activeItemsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'ACTIVE'
                    ? 'bg-black/25 text-white'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {activeItemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SUBSCRIPTIONS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SUBSCRIPTIONS'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Layers size={15} />
            <span>Self-Service Add-ons</span>
          </button>
        </div>
      </div>

      {/* Payment Success Alert */}
      {purchased && !bannerDismissed && (
        <div className="p-4 md:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs md:text-sm flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-emerald-300 text-sm md:text-base">
                Payment Confirmed &amp; Service Activated!
              </p>
              <p className="text-emerald-200/80 text-xs mt-0.5 leading-relaxed">
                Your service package has been successfully activated. Our operations team and assigned specialist are currently preparing your project deliverables.
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

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            &times;
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 1: 5 INTRODUCTORY GROWTH SERVICES CATALOGUE              */}
      {/* ============================================================= */}
      {activeTab === 'GROWTH' && (
        <div className="space-y-8">
          {/* Section Subhead & Instructions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-container/60 border border-outline-variant/30">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Select Services for Your Growth Funnel
              </h2>
              <p className="text-xs text-on-surface-variant">
                Select one service or combine multiple services (e.g. Ads + Landing Page + AI Video) into a single consolidated project brief.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenBrief()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <span>GET STARTED</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* 5 Growth Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_KEYS.map((key) => {
              const service = GROWTH_SERVICES[key];
              const isSelected = selectedBasket.includes(key);

              return (
                <div
                  key={key}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all border ${
                    isSelected
                      ? 'bg-surface-container-high border-primary shadow-lg ring-1 ring-primary/40'
                      : 'bg-surface-container-low border-outline-variant/40 hover:border-primary/40 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon, Badge & Multi-select Checkbox */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/30">
                        {getServiceIcon(key)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant uppercase tracking-wider font-semibold">
                          {service.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleBasketService(key)}
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary border-primary text-on-primary'
                              : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-outline'
                          }`}
                          title={isSelected ? 'Remove from brief' : 'Add to multi-service brief'}
                          aria-label={isSelected ? 'Remove from brief' : 'Add to multi-service brief'}
                        >
                          {isSelected ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Concise Explanation */}
                    <div>
                      <h3 className="text-base font-bold text-on-surface">{service.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                        {service.outcomeDescription}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2 pt-3 border-t border-outline-variant/20">
                      <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                        What We Deliver:
                      </span>
                      <ul className="space-y-1.5">
                        {service.deliverables.slice(0, 4).map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-2 text-xs text-on-surface-variant"
                          >
                            <CheckCircle2
                              size={14}
                              className="text-primary shrink-0 mt-0.5"
                            />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Primary CTA: GET STARTED */}
                  <div className="pt-5 mt-5 border-t border-outline-variant/30 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOpenBrief(key)}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                    >
                      <span>GET STARTED</span>
                      <ArrowRight size={14} />
                    </button>
                    <p className="text-[10px] text-center text-on-surface-variant">
                      Custom quotation based on project requirements
                    </p>
                  </div>
                </div>
              );
            })}

            {/* 6th Card: Multi-Service Bundle */}
            <div className="rounded-3xl p-6 flex flex-col justify-between border bg-gradient-to-b from-surface-container to-surface-container-low border-primary/40 shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                    <Layers size={22} />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary uppercase tracking-wider font-bold">
                    Multi-Service Funnel
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    Combined Revenue Growth Funnel
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                    Combine targeted Facebook and Instagram advertising with high-converting landing pages, AI video creatives, and persuasive VSL scripts into a coordinated launch.
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-outline-variant/20">
                  <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Bundle Advantages:
                  </span>
                  <ul className="space-y-1.5 text-xs text-on-surface-variant">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                      <span>Single unified project brief and dedicated point of contact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                      <span>Cohesive creative messaging across all visual assets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                      <span>30-minute specialist matching with WhatsApp concierge</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-outline-variant/30 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenBrief()}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                >
                  <MessageCircle size={15} />
                  <span>START CUSTOM BRIEF (GET STARTED)</span>
                </button>
                <p className="text-[10px] text-center text-on-surface-variant">
                  Select your exact combination in our adaptive brief
                </p>
              </div>
            </div>
          </div>

          {/* Floating Multi-Service Selection Basket Bar */}
          {selectedBasket.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom duration-300">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container-highest border border-primary/50 shadow-2xl flex items-center justify-between gap-3 text-on-surface backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <ShoppingCart size={18} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-on-surface">
                      {selectedBasket.length} {selectedBasket.length === 1 ? 'Service' : 'Services'} Selected in Basket
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {selectedBasket
                        .map((k) => GROWTH_SERVICES[k]?.name || k)
                        .join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedBasket([])}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                    title="Clear selection"
                  >
                    <X size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenBrief()}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <span>Proceed to Brief</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: MY ACTIVE PROJECTS & CLIENT SERVICES                  */}
      {/* ============================================================= */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-8">
          {/* Active Growth Project Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Growth Projects</h2>
                <p className="text-xs text-on-surface-variant">
                  Track custom advertising campaigns, creative production, proposals, and deliverables.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBrief()}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold text-xs border border-outline-variant/40 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>New Project Request</span>
              </button>
            </div>

            {projectRequests.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/40 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
                  <Briefcase size={22} />
                </div>
                <h3 className="text-sm font-bold text-on-surface mb-1">
                  No custom growth projects submitted yet
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm mb-4">
                  Request advertising management, AI creative generation, or landing page design to accelerate your sales pipeline.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('GROWTH')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Explore Growth Services</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projectRequests.map((project) => {
                  const approvedMilestones = project.milestones.filter(
                    (m) => m.status === 'APPROVED' || m.clientApproved
                  ).length;
                  const totalMilestones = project.milestones.length;
                  const progressPct =
                    totalMilestones > 0
                      ? Math.round((approvedMilestones / totalMilestones) * 100)
                      : 0;

                  return (
                    <div
                      key={project.id}
                      className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm"
                    >
                      {/* Left Block: Info & Services */}
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            {project.reference}
                          </span>
                          {getStatusBadge(project.status)}
                          <span className="text-[11px] text-on-surface-variant">
                            Submitted {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-on-surface">
                            {project.brief?.businessName || 'Growth Project'}
                          </h3>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                            Goal: {project.brief?.primaryGoal || 'Commercial expansion'}
                          </p>
                        </div>

                        {/* Services Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {project.services.map((svc) => (
                            <span
                              key={svc}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant"
                            >
                              {svc.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>

                        {/* Milestones Progress Bar */}
                        {totalMilestones > 0 && (
                          <div className="space-y-1 pt-1 max-w-md">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-on-surface-variant">Milestone Progress</span>
                              <span className="text-primary font-bold">{progressPct}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Block: Partner & Direct Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-outline-variant/20">
                        {project.assignedPartner ? (
                          <div className="flex items-center gap-2.5 text-xs text-on-surface">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                              {project.assignedPartner.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">
                                {project.assignedPartner.fullName}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">
                                Vetted Specialist ★ {project.assignedPartner.rating}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <Clock size={14} className="text-amber-400" />
                            <span>Matching Specialist (30-min SLA)</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {project.whatsappThreadUrl && (
                            <a
                              href={project.whatsappThreadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                              title="WhatsApp Concierge"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}

                          <Link
                            href={`/growth/projects/${project.reference}`}
                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <span>Open Project Workspace</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Subscriptions / Client Services */}
          {clientServices.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-outline-variant/30">
              <h2 className="text-lg font-bold text-on-surface">Active Subscriptions &amp; Services</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {clientServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-3xl bg-surface-container-low border border-outline-variant/40 p-6 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {service.category.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(service.status)}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-on-surface">{service.name}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Progress</span>
                          <span className="text-primary font-bold">{service.progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${service.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Delivery Tasks */}
                      {service.deliveryTasks && service.deliveryTasks.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <span className="text-xs font-semibold text-on-surface">
                            Deliverables &amp; Proofs:
                          </span>
                          <div className="space-y-2">
                            {service.deliveryTasks.map((t) => (
                              <div
                                key={t.id}
                                className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-start justify-between gap-2 text-xs"
                              >
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <p className="font-bold text-on-surface">{t.title}</p>
                                  {t.deliverableUrl && (
                                    <a
                                      href={t.deliverableUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                                    >
                                      Proof: {t.deliverableUrl}
                                    </a>
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
                    </div>

                    <div className="pt-4 mt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                      <span>
                        Billing: ₦{service.pricePaid.toLocaleString()} / {service.billingFrequency.toLowerCase()}
                      </span>
                      {service.paidThroughDate && (
                        <span className="text-[11px]">
                          Through: {new Date(service.paidThroughDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: SELF-SERVICE SUBSCRIPTIONS (LEGACY PACKAGES)           */}
      {/* ============================================================= */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isPurchasing = purchasingSlug === pkg.slug;
              return (
                <div
                  key={pkg.id}
                  className="rounded-3xl bg-surface-container-low border border-outline-variant/40 p-6 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {pkg.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                        <Clock size={12} className="text-primary" />
                        {pkg.slaDays}-Day SLA
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
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

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-semibold text-on-surface">What is included:</span>
                      <ul className="space-y-1.5">
                        {pkg.activitiesIncluded.slice(0, 3).map((act, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-on-surface-variant"
                          >
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400 shrink-0 mt-0.5"
                            />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-outline-variant/30">
                    <button
                      onClick={() => handleSelfServicePurchase(pkg)}
                      disabled={isPurchasing}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isPurchasing ? (
                        <span>Initializing Bachs Checkout...</span>
                      ) : (
                        <>
                          <span>Activate Subscription</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => {
          setIsBriefModalOpen(false);
          setBriefInitialService(null);
        }}
        initialServiceKey={briefInitialService}
      />
    </div>
  );
}
