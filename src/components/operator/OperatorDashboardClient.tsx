'use client';

import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Briefcase,
  Sliders,
  Inbox,
  CheckCircle,
  Activity,
  Users,
  DollarSign,
  ExternalLink,
  Eye,
  Edit2,
  ArrowRightCircle,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  assessSupportRequestAction,
  draftEngagementProposalAction,
  saveProfessionalAction,
  updateClientSpecificReadinessAction,
  updateMaterialsStatusAction,
  triggerActivationAction,
  recordPayoutConfirmationAction,
  updateServiceRequestStageAction,
  updateCampaignMetricsAction,
  convertServiceRequestToPilotAction,
} from '@/app/(saas)/operator/actions';
import QualificationReviewQueue from '@/components/operator/QualificationReviewQueue';
import RemoteWorkforceSection from '@/components/operator/RemoteWorkforceSection';

export default function OperatorDashboardClient({
  requests,
  engagements,
  professionals,
  payables,
  organizations,
  qualifications = [],
  serviceRequests = [],
  staffProfiles = [],
  deliveryTasks = [],
  clientServices = [],
  growthProjects = [],
  performanceMetrics = {
    totalWonDeals: 0,
    totalClosedRevenue: 0,
    totalAppointments: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
  },
}: {
  requests: any[];
  engagements: any[];
  professionals: any[];
  payables: any[];
  organizations: any[];
  qualifications?: any[];
  serviceRequests?: any[];
  staffProfiles?: any[];
  deliveryTasks?: any[];
  clientServices?: any[];
  growthProjects?: any[];
  performanceMetrics?: any;
}) {
  const [activeTab, setActiveTab] = useState<'growthProjects' | 'workforce' | 'serviceRequests' | 'qualifications' | 'requests' | 'engagements' | 'professionals' | 'finance'>('growthProjects');

  // Service Requests state
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<any | null>(null);
  const [viewingAnswersRequest, setViewingAnswersRequest] = useState<any | null>(null);
  const [srFilterType, setSrFilterType] = useState<string>('ALL');
  const [srFilterStage, setSrFilterStage] = useState<string>('ALL');
  const [srStageInput, setSrStageInput] = useState<string>('NEW');
  const [srNextActionInput, setSrNextActionInput] = useState<string>('');
  const [srNextActionDueInput, setSrNextActionDueInput] = useState<string>('');
  const [srInternalNotesInput, setSrInternalNotesInput] = useState<string>('');
  const [isUpdatingSrStage, setIsUpdatingSrStage] = useState<boolean>(false);
  const [convertingSrId, setConvertingSrId] = useState<string | null>(null);

  // Ad metrics modal state
  const [metricsTargetEng, setMetricsTargetEng] = useState<any | null>(null);
  const [adSpendInput, setAdSpendInput] = useState<string>('');
  const [rawEnquiriesInput, setRawEnquiriesInput] = useState<string>('');
  const [qualifiedEnquiriesInput, setQualifiedEnquiriesInput] = useState<string>('');
  const [reportingPeriodInput, setReportingPeriodInput] = useState<string>('Current Month');
  const [currencyInput, setCurrencyInput] = useState<string>('₦');
  const [sourceInput, setSourceInput] = useState<string>('Meta Ads');
  const [isSavingMetrics, setIsSavingMetrics] = useState<boolean>(false);

  // Assessment modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [outcome, setOutcome] = useState<'READY_FOR_PROPOSAL' | 'MORE_INFO_NEEDED' | 'PREPARATION_REQUIRED' | 'NOT_SUITABLE'>('READY_FOR_PROPOSAL');
  const [offerLegitimacy, setOfferLegitimacy] = useState(true);
  const [clientDeliveryAbility, setClientDeliveryAbility] = useState(true);
  const [suitableOpportunitiesExist, setSuitableOpportunitiesExist] = useState(true);
  const [salesMaterialsAvailable, setSalesMaterialsAvailable] = useState(true);
  const [pricingAndRefundClear, setPricingAndRefundClear] = useState(true);
  const [decisionMakerAvailable, setDecisionMakerAvailable] = useState(true);
  const [workingExpectationsRealistic, setWorkingExpectationsRealistic] = useState(true);
  const [compensationViable, setCompensationViable] = useState(true);
  const [factualNotes, setFactualNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [checklistText, setChecklistText] = useState('Pricing sheet approved, Objection guide drafted');
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);

  // Proposal modal
  const [isDraftingProposal, setIsDraftingProposal] = useState(false);
  const [proposalOrgId, setProposalOrgId] = useState(organizations[0]?.id || '');
  const [proposalTitle, setProposalTitle] = useState('Closecraft Follow-up Pilot (30 Days)');
  const [proposalOffer, setProposalOffer] = useState('');
  const [proposalIncluded, setProposalIncluded] = useState('Inquiry triage, WhatsApp follow-up, Qualification calls, Appointment booking');
  const [proposalExcluded, setProposalExcluded] = useState('Cold outbound scraping, Unapproved discounts, Delivery fulfillment');
  const [proposalCapacity, setProposalCapacity] = useState('40');
  const [proposalPrice, setProposalPrice] = useState('150000');
  const [proposalProComp, setProposalProComp] = useState('80000');
  const [proposalOperatorHours, setProposalOperatorHours] = useState('10');
  const [proposalOverrideReason, setProposalOverrideReason] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Add pro modal
  const [isAddingPro, setIsAddingPro] = useState(false);
  const [proName, setProName] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proExperience, setProExperience] = useState('');
  const [proLanguages, setProLanguages] = useState('English, Pidgin');
  const [proPoolApproved, setProPoolApproved] = useState(true);

  // Payout confirmation
  const [payoutTargetId, setPayoutTargetId] = useState<string | null>(null);
  const [payoutRef, setPayoutRef] = useState('');

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmittingAssessment(true);

    try {
      const items = checklistText.split(',').map(t => ({ title: t.trim(), owner: 'CLIENT' as const })).filter(t => t.title.length > 0);
      await assessSupportRequestAction({
        requestId: selectedRequest.id,
        outcome,
        offerLegitimacy,
        clientDeliveryAbility,
        suitableOpportunitiesExist,
        salesMaterialsAvailable,
        pricingAndRefundClear,
        decisionMakerAvailable,
        workingExpectationsRealistic,
        compensationViable,
        factualNotes,
        internalNotes,
        checklistItems: items,
      });

      alert('Readiness assessment saved successfully.');
      setSelectedRequest(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to save assessment');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProposal(true);

    try {
      const inc = proposalIncluded.split(',').map(s => s.trim()).filter(Boolean);
      const exc = proposalExcluded.split(',').map(s => s.trim()).filter(Boolean);

      await draftEngagementProposalAction({
        organizationId: proposalOrgId,
        title: proposalTitle,
        offerRepresented: proposalOffer,
        activitiesIncluded: inc,
        activitiesExcluded: exc,
        capacityUnit: 'HOURS',
        agreedCapacity: parseFloat(proposalCapacity) || 40.0,
        workingDays: 'Monday - Friday',
        responseWindows: 'Within 1 hour during 9am - 5pm WAT',
        communicationChannels: 'WhatsApp, Email, Phone',
        reviewSchedule: 'Weekly Friday review call & daily log',
        requiredClientInputs: 'Approved pricing guide, objection handbook',
        clientServicePrice: parseFloat(proposalPrice) || 150000,
        professionalCompensation: parseFloat(proposalProComp) || 80000,
        expectedOperatorEffortHours: parseFloat(proposalOperatorHours) || 10,
        operatorHourlyCostRate: 3000,
        directDeliveryCosts: 5000,
        negativeMarginOverrideReason: proposalOverrideReason,
      });

      alert('Pilot engagement proposal drafted successfully.');
      setIsDraftingProposal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to draft proposal');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleSaveProSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfessionalAction({
        fullName: proName,
        email: proEmail,
        phone: proPhone,
        experienceSummary: proExperience,
        languages: proLanguages.split(',').map(l => l.trim()).filter(Boolean),
        weeklyAvailabilityHours: 40,
        isPoolApproved: proPoolApproved,
      });

      alert('Professional profile saved.');
      setIsAddingPro(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to save professional');
    }
  };

  const handleActivation = async (engagementId: string) => {
    try {
      await triggerActivationAction(engagementId);
      alert('Engagement activated successfully! Professional granted external access.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Activation failed');
    }
  };

  const handleConfirmPayout = async () => {
    if (!payoutTargetId || !payoutRef.trim()) {
      alert('Please provide a transfer reference.');
      return;
    }
    try {
      await recordPayoutConfirmationAction(payoutTargetId, payoutRef);
      alert('Professional payout marked as confirmed.');
      setPayoutTargetId(null);
      setPayoutRef('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm payout');
    }
  };

  const handleOpenSrStageModal = (req: any) => {
    setSelectedServiceRequest(req);
    setSrStageInput(req.stage || 'NEW');
    setSrNextActionInput(req.nextAction || '');
    setSrNextActionDueInput(req.nextActionDueAt ? new Date(req.nextActionDueAt).toISOString().split('T')[0] : '');
    setSrInternalNotesInput(req.internalNotes || '');
  };

  const handleUpdateSrStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceRequest) return;
    setIsUpdatingSrStage(true);
    try {
      await updateServiceRequestStageAction({
        id: selectedServiceRequest.id,
        stage: srStageInput,
        nextAction: srNextActionInput,
        nextActionDueAt: srNextActionDueInput ? new Date(srNextActionDueInput).toISOString() : undefined,
        internalNotes: srInternalNotesInput,
      });
      alert('Service request stage updated successfully.');
      setSelectedServiceRequest(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    } finally {
      setIsUpdatingSrStage(false);
    }
  };

  const handleConvertSrToPilot = async (req: any) => {
    if (!confirm(`Are you sure you want to convert "${req.companyName || req.contactName}" (${req.reference}) into an onboarding Pilot Engagement?`)) {
      return;
    }
    setConvertingSrId(req.id);
    try {
      const res = await convertServiceRequestToPilotAction({
        serviceRequestId: req.id,
        targetOrganizationId: req.organizationId || undefined,
      });
      alert(`Pilot Engagement successfully created! Engagement ID: ${res.engagementId}`);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to convert to pilot');
    } finally {
      setConvertingSrId(null);
    }
  };

  const handleOpenMetricsModal = (eng: any) => {
    setMetricsTargetEng(eng);
    let metrics: any = {};
    try {
      metrics = eng.campaignMetrics ? JSON.parse(eng.campaignMetrics) : {};
    } catch {
      metrics = {};
    }
    setAdSpendInput(metrics.adSpend != null ? String(metrics.adSpend) : '');
    setRawEnquiriesInput(metrics.rawEnquiries != null ? String(metrics.rawEnquiries) : (metrics.enquiries != null ? String(metrics.enquiries) : ''));
    setQualifiedEnquiriesInput(metrics.qualifiedEnquiries != null ? String(metrics.qualifiedEnquiries) : '');
    setReportingPeriodInput(metrics.reportingPeriod || 'Current Month');
    setCurrencyInput(metrics.currency || '₦');
    setSourceInput(metrics.source || 'Meta Ads');
  };

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricsTargetEng) return;
    setIsSavingMetrics(true);

    try {
      const adSpend = adSpendInput.trim() ? parseFloat(adSpendInput) : null;
      const rawEnquiries = rawEnquiriesInput.trim() ? parseInt(rawEnquiriesInput, 10) : null;
      const qualifiedEnquiries = qualifiedEnquiriesInput.trim() ? parseInt(qualifiedEnquiriesInput, 10) : null;
      const costPerEnquiry = adSpend && rawEnquiries && rawEnquiries > 0 ? parseFloat((adSpend / rawEnquiries).toFixed(2)) : null;
      const costPerQualifiedEnquiry = adSpend && qualifiedEnquiries && qualifiedEnquiries > 0 ? parseFloat((adSpend / qualifiedEnquiries).toFixed(2)) : null;

      await updateCampaignMetricsAction({
        engagementId: metricsTargetEng.id,
        adSpend,
        rawEnquiries,
        qualifiedEnquiries,
        costPerEnquiry,
        costPerQualifiedEnquiry,
        reportingPeriod: reportingPeriodInput.trim() || 'Current Month',
        currency: currencyInput.trim() || '₦',
        source: sourceInput.trim() || 'Meta Ads',
      });

      alert('Ad campaign metrics updated successfully.');
      setMetricsTargetEng(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update ad metrics');
    } finally {
      setIsSavingMetrics(false);
    }
  };

  const filteredServiceRequests = serviceRequests.filter((sr) => {
    if (srFilterType !== 'ALL' && sr.serviceType !== srFilterType) return false;
    if (srFilterStage !== 'ALL' && sr.stage !== srFilterStage) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Platform Operator Console</h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
              Service Delivery Operations
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Assess readiness, coordinate delivery, enforce talent pool standards, and track contribution economics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDraftingProposal(true)}
            className="flex items-center gap-2 bg-[#248277] text-white font-medium px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Draft Pilot Proposal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('growthProjects')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'growthProjects'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Growth Concierge</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {growthProjects.length}
          </span>
          {growthProjects.some((gp: any) => gp.status === 'PENDING_ASSIGNMENT' && !gp.assignedPartnerId) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Pending partner assignments" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('workforce')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'workforce'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Remote Operations & Tasks</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {deliveryTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('qualifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'qualifications'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Qualification Queue</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {qualifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('serviceRequests')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'serviceRequests'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Service Requests Queue</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {serviceRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Readiness Queue</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('engagements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'engagements'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Pilot Engagements</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {engagements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('professionals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'professionals'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Professional Directory</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {professionals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'finance'
              ? 'bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 text-[#45bfae]'
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial Ledger & Payouts</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10">
            {payables.length}
          </span>
        </button>
      </div>

      {/* Tab: Growth Concierge Projects */}
      {activeTab === 'growthProjects' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0f1214] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Total Requests</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{growthProjects.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1214] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Pending Assignment</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {growthProjects.filter((gp: any) => gp.status === 'PENDING_ASSIGNMENT').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1214] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">In Delivery</span>
              <p className="text-2xl font-bold font-mono text-[#45bfae] mt-1">
                {growthProjects.filter((gp: any) => gp.status === 'IN_DELIVERY').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1214] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Completed</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {growthProjects.filter((gp: any) => gp.status === 'COMPLETED').length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0f1214] overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white">Client Growth Concierge Requests</h3>
              <a
                href="/api/growth/sla"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[#45bfae] hover:underline flex items-center gap-1"
              >
                <span>30-Min SLA Audit Endpoint</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {growthProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No growth service project requests submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5 overflow-x-auto">
                {growthProjects.map((proj: any) => {
                  const minutesAgo = Math.floor((Date.now() - new Date(proj.createdAt).getTime()) / 60000);
                  const isPending = proj.status === 'PENDING_ASSIGNMENT';
                  const isSlaBreached = isPending && minutesAgo > 30;

                  return (
                    <div key={proj.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#0f1214] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#45bfae]">{proj.reference}</span>
                          <span className="text-white font-semibold">{proj.brief?.businessName || proj.organization?.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#13171a] text-[10px] font-mono font-bold text-slate-400">
                            {proj.status}
                          </span>
                          {isSlaBreached && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/40 animate-pulse">
                              SLA BREACHED ({minutesAgo}m)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-slate-400 text-[11px]">
                          <span>Services: {proj.services.map((s: string) => s.replace(/_/g, ' ')).join(', ')}</span>
                          <span>·</span>
                          <span>Urgency: {proj.brief?.urgency || 'STANDARD'}</span>
                          <span>·</span>
                          <span>Submitted {new Date(proj.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {proj.assignedPartner && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Partner: <strong className="text-white">{proj.assignedPartner.fullName}</strong>
                          </span>
                        )}

                        {proj.whatsappThreadUrl && (
                          <a
                            href={proj.whatsappThreadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 font-bold text-xs flex items-center gap-1 border border-[#25D366]/40 transition-colors"
                          >
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <a
                          href={`/growth/projects/${proj.reference}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#13171a] hover:bg-white/5 text-white font-medium text-xs transition-colors"
                        >
                          View Project Hub
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Remote Operations & Workforce */}
      {activeTab === 'workforce' && (
        <RemoteWorkforceSection
          staffProfiles={staffProfiles}
          deliveryTasks={deliveryTasks}
          clientServices={clientServices}
          organizations={organizations}
          performanceMetrics={performanceMetrics}
        />
      )}

      {/* Tab 0: Qualification Review Queue */}
      {activeTab === 'qualifications' && (
        <QualificationReviewQueue qualifications={qualifications} />
      )}

      {/* Tab: Service Requests Queue */}
      {activeTab === 'serviceRequests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0f1214] border border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Service Type
                </label>
                <select
                  value={srFilterType}
                  onChange={(e) => setSrFilterType(e.target.value)}
                  className="bg-white/5 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white"
                >
                  <option value="ALL">All Services</option>
                  <option value="LEAD_GENERATION">Meta Lead Generation</option>
                  <option value="SOFTWARE_FOLLOWUP">Software Follow-up</option>
                  <option value="TEAM_TRAINING">Digital Sales School (Training)</option>
                  <option value="MANAGED_SALES">Managed Sales Services</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Stage
                </label>
                <select
                  value={srFilterStage}
                  onChange={(e) => setSrFilterStage(e.target.value)}
                  className="bg-white/5 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white"
                >
                  <option value="ALL">All Stages</option>
                  <option value="NEW">New</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="AWAITING_INFO">Awaiting Info</option>
                  <option value="DISCOVERY_SCHEDULED">Discovery Scheduled</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="NOT_SUITABLE">Not Suitable</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredServiceRequests.length}</strong> of {serviceRequests.length} requests
            </div>
          </div>

          {/* List of Service Requests */}
          {filteredServiceRequests.length === 0 ? (
            <div className="text-center py-12 bg-[#0f1214] rounded-xl border border-white/10">
              <Inbox className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-sm font-medium text-white">No service requests matching the selected filters</p>
              <p className="text-xs text-slate-400 mt-1">Change filters or capture new enquiries on marketing pages.</p>
            </div>
          ) : (
            filteredServiceRequests.map((req) => {
              const isAccepted = req.stage === 'ACCEPTED';
              const isNotSuitable = req.stage === 'NOT_SUITABLE' || req.stage === 'WITHDRAWN';

              const serviceLabel =
                req.serviceType === 'LEAD_GENERATION'
                  ? 'Meta Lead Gen'
                  : req.serviceType === 'SOFTWARE_FOLLOWUP'
                  ? 'Software Follow-up'
                  : req.serviceType === 'TEAM_TRAINING'
                  ? 'DSS Training'
                  : 'Managed Sales';

              const stageBadgeClass =
                req.stage === 'NEW'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : req.stage === 'UNDER_REVIEW'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : req.stage === 'DISCOVERY_SCHEDULED'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : req.stage === 'PROPOSAL_SENT'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : req.stage === 'ACCEPTED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/10 text-slate-400 border-white/10';

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#0f1214] border border-white/10 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#45bfae] px-2 py-0.5 rounded bg-[#248277]/10">
                          {req.reference}
                        </span>
                        <h3 className="font-heading font-semibold text-base text-white">
                          {req.companyName ? `${req.companyName} (${req.contactName})` : req.contactName}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-secondary/15 text-secondary-fixed border border-secondary/20">
                          {serviceLabel}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${stageBadgeClass}`}>
                          {req.stage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>Email: <strong className="text-white">{req.contactEmail}</strong></span>
                        {req.contactPhone && (
                          <span>Phone: <strong className="text-white">{req.contactPhone}</strong></span>
                        )}
                        <span>Workspace: <strong className="text-white">{req.organization?.name || 'Unlinked'}</strong></span>
                        <span>Received: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setViewingAnswersRequest(req)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Brief</span>
                      </button>

                      <button
                        onClick={() => handleOpenSrStageModal(req)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#45bfae] text-xs font-medium border border-[#248277]/30 transition-all flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update Stage</span>
                      </button>

                      {!isAccepted && !isNotSuitable && (
                        <button
                          onClick={() => handleConvertSrToPilot(req)}
                          disabled={convertingSrId === req.id}
                          className="px-3.5 py-1.5 rounded-xl bg-[#248277] text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5" />
                          <span>{convertingSrId === req.id ? 'Converting...' : 'Convert to Pilot'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Next Action & Notes Bar */}
                  {(req.nextAction || req.internalNotes) && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
                      {req.nextAction && (
                        <div>
                          <span className="text-slate-400 font-medium">Next Action: </span>
                          <span className="text-white font-semibold">{req.nextAction}</span>
                          {req.nextActionDueAt && (
                            <span className="ml-2 text-amber-300 font-medium">
                              (Due: {new Date(req.nextActionDueAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      )}
                      {req.internalNotes && (
                        <div>
                          <span className="text-slate-400 font-medium">Operator Note: </span>
                          <span className="text-white italic">{req.internalNotes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 1: Readiness Queue */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-[#0f1214] rounded-xl border border-white/10">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-white">No pending sales support requests</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#0f1214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-base text-white">
                      {req.organization?.name || 'Client Workspace'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#248277]/20 text-[#45bfae]">
                      {req.status}
                    </span>
                    {req.assessment && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium">
                        Outcome: {req.assessment.outcome}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white">Offer: {req.offerSummary}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>Volume: <strong>{req.recentEnquiryVolume}</strong></span>
                    <span>Decision Maker: <strong>{req.authorizedDecisionMaker || 'Unspecified'}</strong></span>
                    <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setFactualNotes(req.assessment?.factualNotes || '');
                      setInternalNotes(req.assessment?.internalNotes || '');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#248277] text-white text-xs font-medium hover:opacity-90 shadow-sm"
                  >
                    Assess Readiness
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Pilot Engagements */}
      {activeTab === 'engagements' && (
        <div className="space-y-4">
          {engagements.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No pilot engagements drafted yet.</p>
          ) : (
            engagements.map((eng) => (
              <div
                key={eng.id}
                className="p-5 rounded-2xl bg-[#0f1214] border border-white/10 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#248277]/20 text-[#45bfae] uppercase">
                        {eng.status}
                      </span>
                      <h3 className="font-heading font-semibold text-base text-white">{eng.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Client: <strong>{eng.organization?.name}</strong> • Assigned Professional: <strong>{eng.professional?.fullName || 'Unassigned'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMetricsModal(eng)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#45bfae] text-xs font-medium rounded-xl border border-[#248277]/30 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Edit Ad Metrics</span>
                    </button>
                    {eng.status !== 'ACTIVE' && eng.status !== 'ENDED' && (
                      <button
                        onClick={() => handleActivation(eng.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Verify & Activate
                      </button>
                    )}
                  </div>
                </div>

                {/* Economics summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-white/5 text-xs">
                  <div>
                    <span className="text-slate-400">Client Price:</span>
                    <p className="font-bold text-white mt-0.5">₦{eng.clientServicePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Pro Comp:</span>
                    <p className="font-bold text-white mt-0.5">₦{eng.professionalCompensation.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Expected Contribution:</span>
                    <p className={`font-bold mt-0.5 ${eng.expectedContribution < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ₦{eng.expectedContribution.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Capacity Used:</span>
                    <p className="font-bold text-white mt-0.5">{eng.usedCapacity} / {eng.agreedCapacity} hrs</p>
                  </div>
                </div>

                {/* Campaign Ad Metrics summary */}
                {(() => {
                  let metrics: any = null;
                  try {
                    metrics = eng.campaignMetrics ? JSON.parse(eng.campaignMetrics) : null;
                  } catch {
                    metrics = null;
                  }

                  const hasMetrics = metrics && (metrics.adSpend != null || metrics.rawEnquiries != null || metrics.enquiries != null);

                  return (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-[#45bfae]" />
                          <span className="font-semibold text-white">
                            Advertising Performance ({metrics?.source || 'Meta Ads'})
                          </span>
                          <span className="text-[11px] px-2 py-0.2 rounded-full bg-white/10 text-slate-400">
                            {metrics?.reportingPeriod || 'Current Period'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenMetricsModal(eng)}
                          className="text-[11px] text-[#45bfae] hover:underline font-medium"
                        >
                          {hasMetrics ? 'Update Metrics' : 'Log Ad Performance'}
                        </button>
                      </div>

                      {hasMetrics ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-slate-400">Ad Spend:</span>
                            <p className="font-semibold text-white">
                              {metrics.currency || '₦'}{metrics.adSpend != null ? Number(metrics.adSpend).toLocaleString() : '0'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Enquiries:</span>
                            <p className="font-semibold text-white">
                              {metrics.rawEnquiries != null ? metrics.rawEnquiries : (metrics.enquiries != null ? metrics.enquiries : '0')}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Qualified:</span>
                            <p className="font-semibold text-white">
                              {metrics.qualifiedEnquiries != null ? metrics.qualifiedEnquiries : '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Cost / Enquiry:</span>
                            <p className="font-semibold text-white">
                              {metrics.costPerEnquiry != null ? `${metrics.currency || '₦'}${Number(metrics.costPerEnquiry).toLocaleString()}` : '—'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          No ad campaign metrics logged yet for this client engagement.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Prerequisites status */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span className={eng.isTermsAccepted ? 'text-emerald-400' : 'text-amber-400'}>
                    ✓ Terms: {eng.isTermsAccepted ? 'Accepted' : 'Pending'}
                  </span>
                  <span className={eng.isProfessionalApproved ? 'text-emerald-400' : 'text-amber-400'}>
                    ✓ Professional: {eng.isProfessionalApproved ? 'Approved' : 'Pending'}
                  </span>
                  <span className={eng.isClientReadinessApproved ? 'text-emerald-400' : 'text-amber-400'}>
                    ✓ Offer Readiness: {eng.isClientReadinessApproved ? 'Approved' : 'Pending'}
                  </span>
                  <span className={eng.isPaymentVerified ? 'text-emerald-400' : 'text-amber-400'}>
                    ✓ Payment: {eng.isPaymentVerified ? 'Verified' : 'Unpaid'}
                  </span>
                  <span className={eng.isMaterialsProvided ? 'text-emerald-400' : 'text-amber-400'}>
                    ✓ Materials: {eng.isMaterialsProvided ? 'Provided' : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Professional Directory */}
      {activeTab === 'professionals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-white">Vetted Talent Pool</h3>
            <button
              onClick={() => setIsAddingPro(true)}
              className="px-3 py-1.5 bg-[#248277] text-white text-xs font-medium rounded-xl hover:opacity-90"
            >
              Add Professional
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-[#0f1214] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-white">{p.fullName}</span>
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${p.isPoolApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {p.isPoolApproved ? 'Talent Pool Approved' : 'Assessment Pending'}
                  </span>
                </div>
                <p className="text-slate-400">{p.experienceSummary || 'Experienced sales representative'}</p>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Email: {p.email}</span>
                  <span>Languages: {p.languages.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Financial Ledger */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-base text-white">Professional Payables (Earned vs Paid Out)</h3>
          <p className="text-xs text-slate-400">
            Section 28: Professional payables are maintained strictly separate from client collections. Payouts are manually confirmed by operators.
          </p>

          <div className="space-y-2">
            {payables.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No payables recorded.</p>
            ) : (
              payables.map((pay) => (
                <div key={pay.id} className="p-4 rounded-xl bg-[#0f1214] border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{pay.professional?.fullName || 'Professional'}</span>
                    <span className="text-slate-400 ml-2">({pay.type.replace(/_/g, ' ')})</span>
                    <p className="text-white font-bold mt-0.5">₦{pay.amount.toLocaleString()} {pay.currency}</p>
                    {pay.payoutReference && (
                      <p className="text-[11px] text-emerald-400 mt-0.5">Ref: {pay.payoutReference}</p>
                    )}
                  </div>

                  <div>
                    {pay.status === 'PAID_OUT' ? (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold">
                        Paid Out
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setPayoutTargetId(pay.id);
                          setPayoutRef('');
                        }}
                        className="px-3 py-1.5 bg-[#248277] text-white text-xs font-medium rounded-xl hover:opacity-90"
                      >
                        Confirm Payout
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-semibold text-lg text-white">Client Readiness Assessment</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssessmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Assessment Outcome *</label>
                <select
                  value={outcome}
                  onChange={(e: any) => setOutcome(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-sm border border-white/10 text-white"
                >
                  <option value="READY_FOR_PROPOSAL">Ready for proposal</option>
                  <option value="PREPARATION_REQUIRED">Preparation required</option>
                  <option value="MORE_INFO_NEEDED">More information needed</option>
                  <option value="NOT_SUITABLE">Not suitable</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="font-semibold text-white block">Operator Readiness Criteria (Section 15):</span>
                {[
                  { val: offerLegitimacy, set: setOfferLegitimacy, label: 'Offer is clear and legitimate' },
                  { val: clientDeliveryAbility, set: setClientDeliveryAbility, label: 'Client can deliver the offer' },
                  { val: suitableOpportunitiesExist, set: setSuitableOpportunitiesExist, label: 'Suitable opportunities exist' },
                  { val: salesMaterialsAvailable, set: setSalesMaterialsAvailable, label: 'Sales materials / brief available' },
                  { val: pricingAndRefundClear, set: setPricingAndRefundClear, label: 'Pricing and refund terms are clear' },
                  { val: decisionMakerAvailable, set: setDecisionMakerAvailable, label: 'Authorised decision-maker is available' },
                  { val: workingExpectationsRealistic, set: setWorkingExpectationsRealistic, label: 'Working expectations are realistic' },
                  { val: compensationViable, set: setCompensationViable, label: 'Compensation is viable' },
                ].map((crit, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crit.val}
                      onChange={(e) => crit.set(e.target.checked)}
                      className="rounded text-[#45bfae]"
                    />
                    <span className="text-white">{crit.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Client-Facing Factual Notes</label>
                <textarea
                  rows={2}
                  value={factualNotes}
                  onChange={(e) => setFactualNotes(e.target.value)}
                  placeholder="Notes visible to client on their Sales Support tab..."
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  Private Operator Internal Notes (NEVER exposed to client)
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Strictly internal risk assessment, delivery margins..."
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Preparation Checklist Items (comma separated)</label>
                <input
                  type="text"
                  value={checklistText}
                  onChange={(e) => setChecklistText(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssessment}
                  className="px-4 py-2 bg-[#248277] text-white font-medium text-xs rounded-xl hover:opacity-90 shadow-sm"
                >
                  {isSubmittingAssessment ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposal Drafting Modal */}
      {isDraftingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-semibold text-lg text-white">Draft 30-Day Pilot Proposal</h3>
              <button onClick={() => setIsDraftingProposal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Client Organization *</label>
                <select
                  value={proposalOrgId}
                  onChange={(e) => setProposalOrgId(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Offer Being Represented *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bespoke Shopify Development & Retainers"
                  value={proposalOffer}
                  onChange={(e) => setProposalOffer(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Client Service Price (NGN) *</label>
                  <input
                    type="number"
                    required
                    value={proposalPrice}
                    onChange={(e) => setProposalPrice(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Professional Comp (NGN) *</label>
                  <input
                    type="number"
                    required
                    value={proposalProComp}
                    onChange={(e) => setProposalProComp(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Working-Hour Allowance (hrs)</label>
                  <input
                    type="number"
                    value={proposalCapacity}
                    onChange={(e) => setProposalCapacity(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Expected Operator Effort (hrs)</label>
                  <input
                    type="number"
                    value={proposalOperatorHours}
                    onChange={(e) => setProposalOperatorHours(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Negative Margin Override Reason (if applicable)</label>
                <input
                  type="text"
                  placeholder="Required only if costs exceed client price..."
                  value={proposalOverrideReason}
                  onChange={(e) => setProposalOverrideReason(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDraftingProposal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="px-4 py-2 bg-[#248277] text-white font-medium text-xs rounded-xl hover:opacity-90 shadow-sm"
                >
                  {isSubmittingProposal ? 'Drafting...' : 'Save & Issue Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pro Modal */}
      {isAddingPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-base text-white">Add Professional Candidate</h3>
            <form onSubmit={handleSaveProSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={proName}
                  onChange={(e) => setProName(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={proEmail}
                  onChange={(e) => setProEmail(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={proPhone}
                  onChange={(e) => setProPhone(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Experience Summary</label>
                <input
                  type="text"
                  value={proExperience}
                  onChange={(e) => setProExperience(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={proPoolApproved}
                  onChange={(e) => setProPoolApproved(e.target.checked)}
                  className="rounded text-[#45bfae]"
                />
                <span className="text-white">Approved for Closecraft Talent Pool</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingPro(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#248277] text-white font-medium text-xs rounded-xl"
                >
                  Save Professional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Confirmation Modal */}
      {payoutTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 text-xs">
            <h3 className="font-heading font-semibold text-base text-white">Confirm Professional Payout</h3>
            <p className="text-slate-400">Enter bank transfer reference or transaction hash to confirm payment.</p>
            <input
              type="text"
              required
              placeholder="e.g. TRF-20261028-001"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
              className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setPayoutTargetId(null)} className="px-3 py-1.5 text-slate-400">Cancel</button>
              <button onClick={handleConfirmPayout} className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl">Confirm Payout</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Request Stage & Action Modal */}
      {selectedServiceRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-xs text-[#45bfae] font-bold">{selectedServiceRequest.reference}</span>
                <h3 className="font-heading font-semibold text-base text-white">Update Service Request Stage</h3>
              </div>
              <button
                onClick={() => setSelectedServiceRequest(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSrStage} className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Pipeline Stage *</label>
                <select
                  value={srStageInput}
                  onChange={(e) => setSrStageInput(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                >
                  <option value="NEW">NEW - Newly received enquiry</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW - Operator examining brief</option>
                  <option value="AWAITING_INFO">AWAITING_INFO - Waiting for client answers</option>
                  <option value="DISCOVERY_SCHEDULED">DISCOVERY_SCHEDULED - Discovery call booked</option>
                  <option value="PROPOSAL_SENT">PROPOSAL_SENT - Scope and quote delivered</option>
                  <option value="ACCEPTED">ACCEPTED - Approved by client</option>
                  <option value="NOT_SUITABLE">NOT_SUITABLE - Out of ICP or unviable</option>
                  <option value="WITHDRAWN">WITHDRAWN - Withdrawn by requester</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Next Best Action</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule discovery call, Review ad access"
                  value={srNextActionInput}
                  onChange={(e) => setSrNextActionInput(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Next Action Due Date</label>
                <input
                  type="date"
                  value={srNextActionDueInput}
                  onChange={(e) => setSrNextActionDueInput(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  Operator Internal Notes (Audit Log)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter context, qualification details, conversation summary..."
                  value={srInternalNotesInput}
                  onChange={(e) => setSrInternalNotesInput(e.target.value)}
                  className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedServiceRequest(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSrStage}
                  className="px-4 py-2 bg-[#248277] text-white font-medium text-xs rounded-xl hover:opacity-90 shadow-sm disabled:opacity-50"
                >
                  {isUpdatingSrStage ? 'Updating...' : 'Save Stage & Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brief / Assessment Answers Drawer Modal */}
      {viewingAnswersRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#45bfae] font-bold">{viewingAnswersRequest.reference}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-secondary/15 text-secondary-fixed">
                    {viewingAnswersRequest.serviceType}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-white mt-0.5">
                  Client Brief: {viewingAnswersRequest.companyName || viewingAnswersRequest.contactName}
                </h3>
              </div>
              <button
                onClick={() => setViewingAnswersRequest(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Requester Contact Overview */}
            <div className="p-3.5 rounded-xl bg-white/5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Name</span>
                <span className="text-white font-semibold">{viewingAnswersRequest.contactName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="text-white font-semibold">{viewingAnswersRequest.contactEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone / WhatsApp</span>
                <span className="text-white font-semibold">{viewingAnswersRequest.contactPhone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Company / Organization</span>
                <span className="text-white font-semibold">{viewingAnswersRequest.companyName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Source Attribution</span>
                <span className="text-white font-semibold">{viewingAnswersRequest.sourceAttribution || 'Website Assessment'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submission Time</span>
                <span className="text-white font-semibold">{new Date(viewingAnswersRequest.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Assessment Answers Breakdown */}
            <div>
              <h4 className="font-semibold text-sm text-white mb-2">Questionnaire & Brief Answers</h4>
              {(() => {
                let parsed: Record<string, any> = {};
                try {
                  parsed = viewingAnswersRequest.answers ? JSON.parse(viewingAnswersRequest.answers) : {};
                } catch {
                  parsed = { rawAnswers: viewingAnswersRequest.answers };
                }

                const entries = Object.entries(parsed).filter(([k]) => k !== 'fullName' && k !== 'email' && k !== 'phone' && k !== 'companyName');

                if (entries.length === 0) {
                  return <p className="text-slate-400 italic">No extra questions answered.</p>;
                }

                return (
                  <div className="space-y-2">
                    {entries.map(([key, value]) => {
                      const displayKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace(/_/g, ' ');

                      return (
                        <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <span className="font-medium text-slate-400 text-[11px] block">{displayKey}</span>
                          <p className="text-white font-semibold whitespace-pre-wrap">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Stage History */}
            {viewingAnswersRequest.stageHistory && (
              <div>
                <h4 className="font-semibold text-sm text-white mb-1">Stage Progression History</h4>
                {(() => {
                  let history: any[] = [];
                  try {
                    history = JSON.parse(viewingAnswersRequest.stageHistory);
                  } catch {
                    history = [];
                  }

                  if (!Array.isArray(history) || history.length === 0) {
                    return <p className="text-slate-400 italic">Initial creation stage.</p>;
                  }

                  return (
                    <div className="space-y-1.5 pt-1">
                      {history.map((h, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span>
                            Transitioned to <strong className="text-white">{h.stage}</strong> (from {h.previousStage || 'initial'})
                          </span>
                          <span>{new Date(h.changedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setViewingAnswersRequest(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Campaign Metrics Modal */}
      {metricsTargetEng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1214] border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#45bfae]" />
                  <h3 className="font-heading font-semibold text-base text-white">Update Ad Campaign Metrics</h3>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Client: <strong>{metricsTargetEng.organization?.name}</strong> • Engagement: {metricsTargetEng.title}
                </p>
              </div>
              <button
                onClick={() => setMetricsTargetEng(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetrics} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Reporting Period *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026, Current Month"
                    value={reportingPeriodInput}
                    onChange={(e) => setReportingPeriodInput(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="₦, $, £"
                    value={currencyInput}
                    onChange={(e) => setCurrencyInput(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Total Ad Spend ({currencyInput})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150000"
                    value={adSpendInput}
                    onChange={(e) => setAdSpendInput(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Advertising Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Meta Ads, Instagram Lead Form"
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Raw Enquiries Generated</label>
                  <input
                    type="number"
                    placeholder="e.g. 48"
                    value={rawEnquiriesInput}
                    onChange={(e) => setRawEnquiriesInput(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Qualified Enquiries</label>
                  <input
                    type="number"
                    placeholder="e.g. 21"
                    value={qualifiedEnquiriesInput}
                    onChange={(e) => setQualifiedEnquiriesInput(e.target.value)}
                    className="w-full bg-white/5 px-3 py-2 rounded-xl text-xs border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Live Cost Per Calculations */}
              {adSpendInput && (rawEnquiriesInput || qualifiedEnquiriesInput) && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Estimated Cost / Enquiry:</span>
                    <p className="font-bold text-white mt-0.5">
                      {rawEnquiriesInput && parseFloat(rawEnquiriesInput) > 0
                        ? `${currencyInput}${(parseFloat(adSpendInput) / parseFloat(rawEnquiriesInput)).toFixed(2)}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Cost / Qualified Enquiry:</span>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      {qualifiedEnquiriesInput && parseFloat(qualifiedEnquiriesInput) > 0
                        ? `${currencyInput}${(parseFloat(adSpendInput) / parseFloat(qualifiedEnquiriesInput)).toFixed(2)}`
                        : '—'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMetricsTargetEng(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMetrics}
                  className="px-4 py-2 bg-[#248277] text-white font-medium text-xs rounded-xl hover:opacity-90 shadow-sm disabled:opacity-50"
                >
                  {isSavingMetrics ? 'Saving...' : 'Save Ad Metrics'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
