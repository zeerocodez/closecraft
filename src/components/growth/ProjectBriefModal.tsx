'use client';

import React, { useState } from 'react';
import {
  GROWTH_SERVICES,
  GrowthServiceKey,
  GrowthServiceDefinition,
} from '@/lib/growth/services';
import {
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Layers,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  FileText,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Layout,
  Target,
} from 'lucide-react';

interface ProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceKey?: GrowthServiceKey | null;
}

export default function ProjectBriefModal({
  isOpen,
  onClose,
  initialServiceKey,
}: ProjectBriefModalProps) {
  // Step state: 1: Services, 2: Business, 3: Objectives, 4: Service Details, 5: Contact, 6: Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected services state
  const [selectedServices, setSelectedServices] = useState<GrowthServiceKey[]>(
    initialServiceKey ? [initialServiceKey] : ['ADS_MANAGEMENT']
  );

  // Business profile state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessOverview, setBusinessOverview] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLink, setSocialLink] = useState('');

  // Project objectives state
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [currentBottleneck, setCurrentBottleneck] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [promotedProducts, setPromotedProducts] = useState('');
  const [successDefinition, setSuccessDefinition] = useState('');

  // Service-specific parameters map: { [serviceKey]: { [questionId]: value } }
  const [serviceParameters, setServiceParameters] = useState<Record<string, Record<string, any>>>(
    {}
  );

  // Timeline & Urgency state
  const [urgency, setUrgency] = useState<'STANDARD' | 'HIGH' | 'CRITICAL'>('STANDARD');
  const [targetLaunchDate, setTargetLaunchDate] = useState('');

  // Contact details state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'WhatsApp' | 'Email' | 'Phone'>('WhatsApp');
  const [availabilityWindow, setAvailabilityWindow] = useState('');

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    reference: string;
    whatsappUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  // Toggle service selection in basket
  function toggleService(key: GrowthServiceKey) {
    if (selectedServices.includes(key)) {
      if (selectedServices.length === 1) {
        setErrorMessage('Please keep at least one service selected.');
        return;
      }
      setSelectedServices(selectedServices.filter((s) => s !== key));
    } else {
      setSelectedServices([...selectedServices, key]);
    }
    setErrorMessage(null);
  }

  // Handle service-specific question input
  function handleServiceParamChange(serviceKey: string, questionId: string, value: any) {
    setServiceParameters((prev) => ({
      ...prev,
      [serviceKey]: {
        ...(prev[serviceKey] || {}),
        [questionId]: value,
      },
    }));
  }

  // Step navigation validations
  function validateCurrentStep(): boolean {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (selectedServices.length === 0) {
        setErrorMessage('Please select at least one introductory service.');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!businessName.trim() || !industry.trim() || !businessOverview.trim()) {
        setErrorMessage('Please fill in business name, industry, and a short overview.');
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (
        !primaryGoal.trim() ||
        !currentBottleneck.trim() ||
        !targetAudience.trim() ||
        !promotedProducts.trim() ||
        !successDefinition.trim()
      ) {
        setErrorMessage('Please answer all project objective questions.');
        return false;
      }
      return true;
    }
    if (currentStep === 5) {
      if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
        setErrorMessage('Please provide your name, email, and WhatsApp number.');
        return false;
      }
      if (!contactEmail.includes('@')) {
        setErrorMessage('Please provide a valid email address.');
        return false;
      }
      return true;
    }
    return true;
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePrev() {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        services: selectedServices,
        businessName,
        industry,
        businessOverview,
        websiteUrl: websiteUrl.trim() || undefined,
        socialLinks: socialLink.trim() ? [socialLink.trim()] : [],
        primaryGoal,
        currentBottleneck,
        targetAudience,
        promotedProducts,
        successDefinition,
        serviceParameters,
        urgency,
        targetLaunchDate: targetLaunchDate || undefined,
        contactName,
        contactEmail,
        contactPhone,
        preferredContactMethod,
        availabilityWindow: availabilityWindow.trim() || undefined,
      };

      const res = await fetch('/api/growth/project-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit project brief.');
      }

      setSubmissionSuccess({
        reference: data.reference,
        whatsappUrl: data.whatsappUrl,
      });
      setCurrentStep(6);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function getServiceIcon(key: GrowthServiceKey) {
    switch (key) {
      case 'ADS_MANAGEMENT':
        return <Target className="w-5 h-5 text-[#45bfae]" />;
      case 'AI_FLYER_DESIGN':
        return <ImageIcon className="w-5 h-5 text-amber-400" />;
      case 'AI_VIDEO_CREATION':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'LANDING_PAGE_DESIGN':
        return <Layout className="w-5 h-5 text-emerald-400" />;
      case 'VSL_DESIGN':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-[#0d0d0d] border border-[#222222] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between bg-[#121212]/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-[#45bfae]">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {currentStep === 6 ? 'Project Request Confirmed' : 'CloseCraft Growth Concierge'}
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                {currentStep === 6
                  ? 'Your project brief is registered'
                  : `Step ${currentStep} of 5: ${
                      currentStep === 1
                        ? 'Select Services'
                        : currentStep === 2
                        ? 'Business Profile'
                        : currentStep === 3
                        ? 'Project Objectives'
                        : currentStep === 4
                        ? 'Service-Specific Brief'
                        : 'Contact & Consultation'
                    }`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#71717a] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        {currentStep < 6 && (
          <div className="w-full h-1 bg-[#1a1a1a]">
            <div
              className="h-full bg-gradient-to-r from-[#248277] to-[#45bfae] transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs sm:text-sm">
              <AlertCircle size={18} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SERVICE SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Choose the introductory services your business requires.
                </h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa]">
                  Select one or multiple services. We will treat these as one cohesive growth project with coordinated execution.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {(Object.keys(GROWTH_SERVICES) as GrowthServiceKey[]).map((key) => {
                  const s = GROWTH_SERVICES[key];
                  const isSelected = selectedServices.includes(key);

                  return (
                    <div
                      key={key}
                      onClick={() => toggleService(key)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#151c1a] border-[#248277] shadow-lg shadow-[#248277]/10'
                          : 'bg-[#121212] border-[#202020] hover:border-[#333333] hover:bg-[#161616]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[#248277]/20 border-[#248277]'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          {getServiceIcon(key)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#a1a1aa] font-medium">
                              {s.badge}
                            </span>
                            <h5 className="text-sm sm:text-base font-bold text-white">{s.name}</h5>
                          </div>
                          <p className="text-xs text-[#a1a1aa] leading-relaxed">
                            {s.outcomeDescription}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#248277] border-[#248277] text-white'
                              : 'border-white/20 bg-black/40'
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={14} className="fill-white text-[#248277]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Basket Summary */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-between text-xs">
                <span className="text-[#a1a1aa]">
                  Selected Services: <strong className="text-white">{selectedServices.length}</strong>
                </span>
                <span className="text-[#45bfae] font-semibold">
                  Custom Quote via Scoped Proposal
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS PROFILE */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight">Tell us about your business</h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa]">
                  This helps our revenue advisors understand your current market position.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Business or Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Solar Solutions"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Industry or Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Real Estate, Solar Energy, B2B SaaS, Health & Wellness"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Brief Business Overview *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={businessOverview}
                    onChange={(e) => setBusinessOverview(e.target.value)}
                    placeholder="What does your business sell, who do you serve, and how long have you been operating?"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Instagram / Social Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={socialLink}
                      onChange={(e) => setSocialLink(e.target.value)}
                      placeholder="@yourhandle or profile URL"
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROJECT OBJECTIVES */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight">Project Goals & Target Audience</h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa]">
                  Help us define what commercial success looks like for this engagement.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What is the primary goal of this project? *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    placeholder="e.g. Generate 50 qualified commercial leads per month and close 5 deals"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What challenge or bottleneck are you currently facing? *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={currentBottleneck}
                    onChange={(e) => setCurrentBottleneck(e.target.value)}
                    placeholder="e.g. We get clicks but people do not leave inquiries, or leads go cold without consistent follow-up"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Who is your target audience or ideal customer? *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Homeowners in Lagos/Abuja, B2B procurement managers, Corporate HR directors"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What specific products or services will you be promoting? *
                  </label>
                  <input
                    type="text"
                    required
                    value={promotedProducts}
                    onChange={(e) => setPromotedProducts(e.target.value)}
                    placeholder="e.g. 5kVA Solar Inverter Package, Executive Leadership Masterclass"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What would a successful outcome look like in 30–60 days? *
                  </label>
                  <input
                    type="text"
                    required
                    value={successDefinition}
                    onChange={(e) => setSuccessDefinition(e.target.value)}
                    placeholder="e.g. Consistent ₦2.5M in new signed client contracts from this funnel"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SERVICE-SPECIFIC QUESTIONS (PROGRESSIVE DISCLOSURE) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Detailed Service Requirements
                </h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa]">
                  Answer tailored questions for the specific services you selected.
                </p>
              </div>

              <div className="space-y-6">
                {selectedServices.map((key) => {
                  const s = GROWTH_SERVICES[key];
                  const currentValues = serviceParameters[key] || {};

                  return (
                    <div
                      key={key}
                      className="p-5 rounded-2xl bg-[#141414] border border-[#242424] space-y-4"
                    >
                      <div className="flex items-center gap-2.5 pb-2 border-b border-[#222222]">
                        {getServiceIcon(key)}
                        <h5 className="text-sm font-bold text-white">{s.name}</h5>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {s.serviceSpecificQuestions.map((q) => (
                          <div key={q.id}>
                            <label className="block text-xs font-semibold text-white mb-1.5">
                              {q.label} {q.required && '*'}
                            </label>

                            {q.type === 'select' && q.options ? (
                              <select
                                value={currentValues[q.id] || ''}
                                onChange={(e) =>
                                  handleServiceParamChange(key, q.id, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#282828] focus:border-[#248277] text-white text-xs sm:text-sm outline-none"
                              >
                                <option value="">Select an option...</option>
                                {q.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : q.type === 'textarea' ? (
                              <textarea
                                rows={2}
                                value={currentValues[q.id] || ''}
                                onChange={(e) =>
                                  handleServiceParamChange(key, q.id, e.target.value)
                                }
                                placeholder={q.placeholder}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#282828] focus:border-[#248277] text-white text-xs sm:text-sm outline-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValues[q.id] || ''}
                                onChange={(e) =>
                                  handleServiceParamChange(key, q.id, e.target.value)
                                }
                                placeholder={q.placeholder}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#282828] focus:border-[#248277] text-white text-xs sm:text-sm outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: CONTACT & CONSULTATION PREFERENCES */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Contact & Consultation Details
                </h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa]">
                  We will reach out via WhatsApp with your dedicated partner match and custom proposal.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. David Adeyemi"
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="david@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +234 803 123 4567"
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Project Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    >
                      <option value="STANDARD">Standard Delivery (14–21 Days)</option>
                      <option value="HIGH">Priority Queue (7–14 Days)</option>
                      <option value="CRITICAL">Critical Rush (&lt; 7 Days)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Target Launch Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={targetLaunchDate}
                      onChange={(e) => setTargetLaunchDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Preferred Consultation Time
                    </label>
                    <input
                      type="text"
                      value={availabilityWindow}
                      onChange={(e) => setAvailabilityWindow(e.target.value)}
                      placeholder="e.g. Weekdays 2pm–5pm WAT"
                      className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#248277] text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#141414] border border-[#222222] text-xs text-[#a1a1aa] flex items-center gap-3">
                  <ShieldCheck size={20} className="shrink-0 text-[#45bfae]" />
                  <span>
                    No upfront payment required. You will receive a detailed proposal and itemised deliverables before deciding.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS & CONFIRMATION */}
          {currentStep === 6 && submissionSuccess && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-[#45bfae] mx-auto shadow-xl">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs px-3 py-1 rounded-full bg-[#182825] border border-[#248277]/40 text-[#45bfae] font-mono font-bold tracking-wider uppercase">
                  {submissionSuccess.reference}
                </span>
                <h4 className="text-2xl font-extrabold text-white tracking-tight">
                  Project Brief Registered Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  Thank you, <strong>{contactName}</strong>. Your project brief has been registered with our operations desk.
                </p>
              </div>

              {/* Next Steps Card */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] text-left max-w-lg mx-auto space-y-4">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} className="text-[#45bfae]" />
                  What Happens Next (Under 30 Minutes SLA)
                </h5>

                <ol className="space-y-3 text-xs text-[#a1a1aa]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <span>
                      <strong className="text-white">Partner Matching:</strong> Our algorithm reviews your requirements and pairs you with a vetted specialist.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <span>
                      <strong className="text-white">WhatsApp Consultation:</strong> Your advisor connects to confirm scope, assets, and schedule.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <span>
                      <strong className="text-white">Custom Proposal:</strong> You review an itemised proposal with transparent NGN pricing before payment.
                    </span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <a
                  href={submissionSuccess.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-sm font-bold transition-all shadow-xl shadow-[#248277]/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>Start WhatsApp Consultation Now</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls (Steps 1 to 5) */}
        {currentStep < 6 && (
          <div className="px-6 py-4 border-t border-[#1f1f1f] bg-[#121212]/90 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs text-[#71717a]">Select one or more services</span>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Registering Brief...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Project Brief</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
