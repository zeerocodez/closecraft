-- CreateEnum
CREATE TYPE "GrowthServiceType" AS ENUM ('ADS_MANAGEMENT', 'AI_FLYER_DESIGN', 'AI_VIDEO_CREATION', 'LANDING_PAGE_DESIGN', 'VSL_DESIGN');

-- CreateEnum
CREATE TYPE "ProjectRequestStatus" AS ENUM ('PENDING_ASSIGNMENT', 'ASSIGNED', 'CONSULTING', 'PROPOSAL_SENT', 'PROPOSAL_APPROVED', 'PROPOSAL_REJECTED', 'INVOICED', 'PAID', 'IN_DELIVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProjectUrgency" AS ENUM ('STANDARD', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVISION', 'APPROVED');

-- CreateTable
CREATE TABLE "ProjectRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "services" "GrowthServiceType"[],
    "status" "ProjectRequestStatus" NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
    "assignedPartnerId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "whatsappThreadUrl" TEXT,
    "consultationNotes" TEXT,
    "consultedAt" TIMESTAMP(3),
    "operatorNotes" TEXT,
    "slaBreachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBrief" (
    "id" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "businessOverview" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "socialLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryGoal" TEXT NOT NULL,
    "currentBottleneck" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "promotedProducts" TEXT NOT NULL,
    "successDefinition" TEXT NOT NULL,
    "serviceParameters" JSONB NOT NULL DEFAULT '{}',
    "targetLaunchDate" TIMESTAMP(3),
    "urgency" "ProjectUrgency" NOT NULL DEFAULT 'STANDARD',
    "preferredContactMethod" TEXT,
    "availabilityWindow" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectProposal" (
    "id" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scopeSummary" TEXT NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "estimatedDays" INTEGER NOT NULL DEFAULT 14,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "clientAcceptedAt" TIMESTAMP(3),
    "clientRejectionReason" TEXT,
    "revisionHistory" TEXT,
    "projectInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalLineItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "serviceType" "GrowthServiceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "totalPrice" DECIMAL(14,2) NOT NULL,
    "deliverables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "bachsCheckoutId" TEXT,
    "bachsCheckoutUrl" TEXT,
    "bachsChargeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "paidAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "serviceType" "GrowthServiceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequenceOrder" INTEGER NOT NULL DEFAULT 1,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "proofUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "reviewedByUserId" TEXT,
    "clientFeedback" TEXT,
    "clientApproved" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRequest_reference_key" ON "ProjectRequest"("reference");

-- CreateIndex
CREATE INDEX "ProjectRequest_organizationId_status_idx" ON "ProjectRequest"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProjectRequest_assignedPartnerId_idx" ON "ProjectRequest"("assignedPartnerId");

-- CreateIndex
CREATE INDEX "ProjectRequest_reference_idx" ON "ProjectRequest"("reference");

-- CreateIndex
CREATE INDEX "ProjectRequest_status_idx" ON "ProjectRequest"("status");

-- CreateIndex
CREATE INDEX "ProjectRequest_createdAt_idx" ON "ProjectRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBrief_projectRequestId_key" ON "ProjectBrief"("projectRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectProposal_proposalNumber_key" ON "ProjectProposal"("proposalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectProposal_projectInvoiceId_key" ON "ProjectProposal"("projectInvoiceId");

-- CreateIndex
CREATE INDEX "ProjectProposal_projectRequestId_status_idx" ON "ProjectProposal"("projectRequestId", "status");

-- CreateIndex
CREATE INDEX "ProjectProposal_proposalNumber_idx" ON "ProjectProposal"("proposalNumber");

-- CreateIndex
CREATE INDEX "ProjectProposal_status_idx" ON "ProjectProposal"("status");

-- CreateIndex
CREATE INDEX "ProposalLineItem_proposalId_idx" ON "ProposalLineItem"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvoice_invoiceNumber_key" ON "ProjectInvoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvoice_bachsCheckoutId_key" ON "ProjectInvoice"("bachsCheckoutId");

-- CreateIndex
CREATE INDEX "ProjectInvoice_projectRequestId_idx" ON "ProjectInvoice"("projectRequestId");

-- CreateIndex
CREATE INDEX "ProjectInvoice_organizationId_idx" ON "ProjectInvoice"("organizationId");

-- CreateIndex
CREATE INDEX "ProjectInvoice_status_idx" ON "ProjectInvoice"("status");

-- CreateIndex
CREATE INDEX "ProjectInvoice_bachsCheckoutId_idx" ON "ProjectInvoice"("bachsCheckoutId");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectRequestId_status_idx" ON "ProjectMilestone"("projectRequestId", "status");

-- CreateIndex
CREATE INDEX "ProjectMilestone_serviceType_idx" ON "ProjectMilestone"("serviceType");

-- CreateIndex
CREATE INDEX "ProjectMilestone_sequenceOrder_idx" ON "ProjectMilestone"("sequenceOrder");

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_assignedPartnerId_fkey" FOREIGN KEY ("assignedPartnerId") REFERENCES "ProfessionalProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBrief" ADD CONSTRAINT "ProjectBrief_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProposal" ADD CONSTRAINT "ProjectProposal_projectInvoiceId_fkey" FOREIGN KEY ("projectInvoiceId") REFERENCES "ProjectInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalLineItem" ADD CONSTRAINT "ProposalLineItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProjectProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvoice" ADD CONSTRAINT "ProjectInvoice_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvoice" ADD CONSTRAINT "ProjectInvoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

