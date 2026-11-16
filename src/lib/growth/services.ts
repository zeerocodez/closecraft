import { z } from 'zod';

export type GrowthServiceKey =
  | 'ADS_MANAGEMENT'
  | 'AI_FLYER_DESIGN'
  | 'AI_VIDEO_CREATION'
  | 'LANDING_PAGE_DESIGN'
  | 'VSL_DESIGN';

export interface GrowthServiceDefinition {
  key: GrowthServiceKey;
  name: string;
  badge: string;
  tagline: string;
  outcomeDescription: string;
  previewImage: string;
  deliverables: string[];
  serviceSpecificQuestions: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    helpText?: string;
  }[];
}

export const GROWTH_SERVICES: Record<GrowthServiceKey, GrowthServiceDefinition> = {
  ADS_MANAGEMENT: {
    key: 'ADS_MANAGEMENT',
    name: 'Facebook & Instagram Ads Management',
    badge: 'Paid Acquisition',
    tagline: 'Predictable, qualified lead generation tailored to your unit economics.',
    outcomeDescription:
      'We plan, launch, manage, and continuously optimise paid advertising campaigns across Meta (Facebook & Instagram) to generate qualified inbound buyer enquiries and increase revenue without wasted ad spend.',
    previewImage: '/images/services/ads-management.jpg',
    deliverables: [
      'Customer Avatar & Audience Targeting Matrix',
      'Meta Ad Account Setup, Pixel & Conversion API Audit',
      'Creative Strategy (Headlines, Hooks & Angles)',
      'A/B Split Testing (Audiences vs. Creatives)',
      'Real-time Lead Syncing into CloseCraft Workspace',
      'Weekly Optimization & ROAS Reporting Call',
    ],
    serviceSpecificQuestions: [
      {
        id: 'promotedProduct',
        label: 'What product, service, or core offer do you want to advertise?',
        type: 'text',
        placeholder: 'e.g. B2B SaaS onboarding, Residential Solar Installations, High-ticket Consulting',
        required: true,
      },
      {
        id: 'advertisingPlatforms',
        label: 'Which platforms are you prioritizing?',
        type: 'select',
        options: [
          'Facebook & Instagram (Recommended for B2C & SMBs)',
          'Instagram Only (Visual & Lifestyle Focus)',
          'Facebook Only',
          'Open to Expert Recommendation',
        ],
        required: true,
      },
      {
        id: 'monthlyAdBudget',
        label: 'What is your intended monthly advertising budget (paid directly to Meta)?',
        type: 'select',
        options: [
          '₦100,000 – ₦250,000 / month',
          '₦250,000 – ₦500,000 / month',
          '₦500,000 – ₦1,500,000 / month',
          '₦1,500,000+ / month',
          'Need guidance on budget sizing',
        ],
        required: true,
      },
      {
        id: 'previousCampaignHistory',
        label: 'Have you run paid Meta campaigns before?',
        type: 'select',
        options: [
          'Yes, currently running active campaigns',
          'Yes, in the past but stopped due to poor ROI',
          'No, this will be our first paid campaign',
        ],
        required: true,
      },
    ],
  },

  AI_FLYER_DESIGN: {
    key: 'AI_FLYER_DESIGN',
    name: 'AI Image & Flyer Creation',
    badge: 'Creative & Visuals',
    tagline: 'High-impact promotional graphics engineered to stop the social scroll.',
    outcomeDescription:
      'Professional marketing flyers, promotional graphics, product creatives, and social banners produced using hybrid AI-assisted creative workflows, crafted to command immediate attention and boost click-through rates.',
    previewImage: '/images/services/ai-flyers.jpg',
    deliverables: [
      'Multiple Headline Hook & Visual Concept Variations',
      'Format Sizing for Instagram Feed (1:1), Stories/Reels (9:16), and Web (16:9)',
      'High-Resolution Print & Web-Optimized PNG/JPG Files',
      'Source Layers & Editable Figma/Canva Templates',
      'Commercial Usage License for Worldwide Distribution',
    ],
    serviceSpecificQuestions: [
      {
        id: 'flyerObjective',
        label: 'What is the flyer or graphic intended to promote?',
        type: 'text',
        placeholder: 'e.g. Flash sale announcement, Webinar registration, Product launch, Seasonal event',
        required: true,
      },
      {
        id: 'numberOfVariations',
        label: 'How many distinct design concepts / variations do you need?',
        type: 'select',
        options: [
          '1 Master Concept (Multiple formats)',
          '3 Concepts with Angle Testing',
          '5+ Creative Suite for Ad Campaigns',
        ],
        required: true,
      },
      {
        id: 'brandAssetsAvailable',
        label: 'Do you have existing brand assets (logo, font guidelines, color codes)?',
        type: 'select',
        options: [
          'Yes, complete brand guide and high-res vector assets ready',
          'Have a logo and colors, but no formal guidelines',
          'No brand assets, need CloseCraft to establish visual styling',
        ],
        required: true,
      },
      {
        id: 'intendedPlacement',
        label: 'Where will these designs primarily be deployed?',
        type: 'select',
        options: [
          'Instagram & Facebook Feed / Stories',
          'WhatsApp Status & Direct Broadcasts',
          'Physical Print & Event Posters',
          'Omnichannel (Social + WhatsApp + Print)',
        ],
        required: true,
      },
    ],
  },

  AI_VIDEO_CREATION: {
    key: 'AI_VIDEO_CREATION',
    name: 'AI Video Creation',
    badge: 'Video Marketing',
    tagline: 'Dynamic, persuasive short-form videos designed for modern attention spans.',
    outcomeDescription:
      'Compelling marketing videos, product demonstrations, customer testimonial highlights, and social video ads produced with AI video models and human editorial polish to drive engagement and qualified inbound interest.',
    previewImage: '/images/services/ai-video.jpg',
    deliverables: [
      'Narrative Scripting & Hook Development',
      'Professional Voiceover (AI Synthetic or Human Accent-Matched)',
      'Motion Graphics, Text Overlays, Dynamic Captions & Sound Design',
      'Vertical (9:16) Format for TikTok/Reels & Horizontal (16:9) Format for Web/YouTube',
      'Color Grading & Brand Polish',
    ],
    serviceSpecificQuestions: [
      {
        id: 'videoPrimaryGoal',
        label: 'What is the primary objective of this video?',
        type: 'select',
        options: [
          'Direct Response Ad (Generate leads or sales)',
          'Product Demonstration (Explain how it works)',
          'Brand Authority & Social Proof',
          'Course / Education Teaser',
        ],
        required: true,
      },
      {
        id: 'existingAssets',
        label: 'Do you have existing raw footage, product shots, or an outline?',
        type: 'select',
        options: [
          'Yes, raw footage and product photos ready to edit',
          'Only product photos, need AI/stock B-roll generated',
          'No assets yet, need full concept-to-render creation',
        ],
        required: true,
      },
      {
        id: 'preferredLength',
        label: 'What is your preferred video length?',
        type: 'select',
        options: [
          '15 to 30 Seconds (Fast social ad hook)',
          '30 to 60 Seconds (Standard direct response)',
          '60 to 90 Seconds (Detailed product walkthrough)',
          'Open to Advisor recommendation',
        ],
        required: true,
      },
      {
        id: 'voiceoverStyle',
        label: 'What style of voiceover is preferred?',
        type: 'select',
        options: [
          'Nigerian / African Professional & Relatable',
          'International / Global Neutral',
          'No voiceover, high-tempo music with dynamic subtitles only',
        ],
        required: true,
      },
    ],
  },

  LANDING_PAGE_DESIGN: {
    key: 'LANDING_PAGE_DESIGN',
    name: 'Landing Page Design',
    badge: 'Conversion Rate',
    tagline: 'High-converting sales pages designed to turn cold clicks into qualified buyers.',
    outcomeDescription:
      'Custom landing pages engineered for maximum conversion. We combine persuasive direct-response copywriting, clear information hierarchy, high-contrast CTAs, and mobile-first speed to capture leads and drive transactions.',
    previewImage: '/images/services/landing-pages.jpg',
    deliverables: [
      'Direct-Response Copywriting & Value Proposition Structuring',
      'Bespoke Mobile-First Responsive Layout & Dark/Light Theming',
      'Lead Capture Form Integration Directly into CloseCraft CRM',
      'Conversion Tracking, Meta Pixel & Google Tag Verification',
      'Fast Sub-Second Page Speed Optimization',
    ],
    serviceSpecificQuestions: [
      {
        id: 'landingPageGoal',
        label: 'What is the primary call to action of this page?',
        type: 'select',
        options: [
          'Lead Generation (Collect name, phone, and qualifying details)',
          'Direct Checkout (Collect payment for product/service)',
          'Event / Webinar Registration',
          'Appointment / Discovery Call Booking',
        ],
        required: true,
      },
      {
        id: 'copywritingStatus',
        label: 'Do you already have written copy for the page?',
        type: 'select',
        options: [
          'Yes, copy is finalized and ready for layout design',
          'Have bullet points and ideas, need CloseCraft to write final copy',
          'No copy at all, need complete direct-response copy crafted',
        ],
        required: true,
      },
      {
        id: 'domainHosting',
        label: 'Do you have an existing domain and hosting preference?',
        type: 'select',
        options: [
          'Yes, own a custom domain and website ready for integration',
          'Want CloseCraft to host on a fast subdomain (e.g. you.closecrafthq.com)',
          'Need guidance on purchasing and pointing a new domain',
        ],
        required: true,
      },
      {
        id: 'desiredIntegrations',
        label: 'What tools do you need integrated with the page?',
        type: 'text',
        placeholder: 'e.g. WhatsApp Click-to-Chat, Meta Pixel, Paystack, Calendly, CloseCraft CRM',
        required: false,
      },
    ],
  },

  VSL_DESIGN: {
    key: 'VSL_DESIGN',
    name: 'Video Sales Letter (VSL) Design',
    badge: 'Closing Engine',
    tagline: 'Strategic video sales presentations that systematically dismantle objections.',
    outcomeDescription:
      'End-to-end Video Sales Letter creation designed to sell high-value offers. We structure a bulletproof psychological persuasion framework that builds trust, validates urgency, answers objections, and moves prospects to action.',
    previewImage: '/images/services/vsl-design.jpg',
    deliverables: [
      'Proven VSL Persuasion Architecture (Hook, Story, Problem, Offer, Guarantee, CTA)',
      'Complete Word-for-Word Scripting & Review',
      'High-Impact Presentation Slide Deck (Typography, Motion & Key Visuals)',
      'Audio & Video Production with Voiceover Synchronization',
      'Conversion-Optimized VSL Player Page with Timed CTA Reveal',
    ],
    serviceSpecificQuestions: [
      {
        id: 'offerPricePoint',
        label: 'What is the price point and nature of the offer being sold?',
        type: 'text',
        placeholder: 'e.g. ₦150,000 Sales Training Program, ₦500,000 Implementation Retainer',
        required: true,
      },
      {
        id: 'vslScriptStatus',
        label: 'Do you have an existing script or outline?',
        type: 'select',
        options: [
          'No script, need complete persuasion script crafted from scratch',
          'Rough draft or outline exists, needs professional restructuring',
          'Script is already written and tested, only need video production',
        ],
        required: true,
      },
      {
        id: 'presenterStyle',
        label: 'Who will be the voice/face of the presentation?',
        type: 'select',
        options: [
          'Founder / CEO on camera with slide cutaways',
          'Professional voiceover paired with dynamic kinetic slides',
          'AI-assisted avatar or voiceover with high-end presentation deck',
        ],
        required: true,
      },
      {
        id: 'primaryCustomerObjection',
        label: 'What is the #1 objection prospects usually raise before buying?',
        type: 'text',
        placeholder: 'e.g. "Too expensive", "Will this work in Nigeria?", "Do I have enough time?"',
        required: true,
      },
    ],
  },
};

// -------------------------------------------------------------
// PROJECT BRIEF VALIDATION SCHEMA (ZOD)
// -------------------------------------------------------------

export const ProjectBriefSubmissionSchema = z.object({
  // Selected services (at least 1 required)
  services: z
    .array(
      z.enum([
        'ADS_MANAGEMENT',
        'AI_FLYER_DESIGN',
        'AI_VIDEO_CREATION',
        'LANDING_PAGE_DESIGN',
        'VSL_DESIGN',
      ])
    )
    .min(1, 'Please select at least one introductory service to proceed.'),

  // Business Profile
  businessName: z.string().trim().min(2, 'Please enter your business or brand name.'),
  industry: z.string().trim().min(2, 'Please specify your industry or category.'),
  businessOverview: z
    .string()
    .trim()
    .min(10, 'Please provide a brief overview of your business (at least 10 characters).'),
  websiteUrl: z.string().trim().optional(),
  socialLinks: z.array(z.string().trim()).default([]),

  // Core Objectives
  primaryGoal: z
    .string()
    .trim()
    .min(5, 'Please describe what you want to achieve with this project.'),
  currentBottleneck: z
    .string()
    .trim()
    .min(5, 'Please describe your current main challenge or bottleneck.'),
  targetAudience: z
    .string()
    .trim()
    .min(5, 'Please describe your target audience or ideal customer profile.'),
  promotedProducts: z
    .string()
    .trim()
    .min(3, 'Please list the products or services you want to promote.'),
  successDefinition: z
    .string()
    .trim()
    .min(5, 'Please describe what a successful outcome looks like.'),

  // Service-specific answers map: { [serviceKey]: { [questionId]: answer } }
  serviceParameters: z.record(z.string(), z.any()).default({}),

  // Project Timelines & Urgency
  urgency: z.enum(['STANDARD', 'HIGH', 'CRITICAL']).default('STANDARD'),
  targetLaunchDate: z.string().optional(),

  // Contact Information
  contactName: z.string().trim().min(2, 'Please enter your contact name.'),
  contactEmail: z.string().trim().email('Please enter a valid email address.'),
  contactPhone: z.string().trim().min(7, 'Please enter a valid WhatsApp or phone number.'),
  preferredContactMethod: z.enum(['WhatsApp', 'Email', 'Phone']).default('WhatsApp'),
  availabilityWindow: z.string().optional(),

  // Optional honeypot check
  hpField: z.string().optional(),
});

export type ProjectBriefSubmission = z.infer<typeof ProjectBriefSubmissionSchema>;

/**
 * Generates an official, human-readable CloseCraft Project Reference
 * Format: CC-PR-YYYY-XXXX (e.g. CC-PR-2026-A8F2)
 */
export function generateProjectReference(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-PR-${year}-${randomChars}`;
}

/**
 * Builds the pre-formatted WhatsApp deep-link for concierge consultation
 */
export function buildWhatsAppConsultationLink(
  reference: string,
  businessName: string,
  serviceKeys: GrowthServiceKey[],
  contactName: string
): string {
  const officialNumber = process.env.NEXT_PUBLIC_CLOSECRAFT_WHATSAPP_NUMBER || '2349026365853';
  const serviceNames = serviceKeys.map((k) => GROWTH_SERVICES[k]?.name || k).join(', ');

  const text = `Hello CloseCraft Growth Team,\n\nI have submitted Project Brief ${reference} for ${businessName}.\n\n*Services Selected:* ${serviceNames}\n*Contact:* ${contactName}\n\nI would like to schedule our WhatsApp consultation to review the project brief and discuss the custom proposal.`;

  return `https://wa.me/${officialNumber}?text=${encodeURIComponent(text)}`;
}

