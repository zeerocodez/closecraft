-- =============================================================================
-- CLOSECRAFT DATABASE ROW-LEVEL SECURITY (RLS) MIGRATION
-- =============================================================================
-- Architecture:
-- 1. Unprivileged runtime role: closecraft_app (NOLOGIN, NOBYPASSRLS)
-- 2. Scoped context schema: closecraft with parameterised helper functions
-- 3. Tenant and user isolation policies on all application tables
-- 4. Triggers to enforce role immutability, payment status safety, and FK boundary matching
-- 5. Column-level access restrictions for sensitive notes, password hashes, and tokens
-- =============================================================================

-- Step 1: Ensure runtime role exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'closecraft_app') THEN
    CREATE ROLE closecraft_app WITH NOLOGIN NOBYPASSRLS NOCREATEROLE;
  END IF;
END
$$;

GRANT closecraft_app TO postgres;
GRANT USAGE ON SCHEMA public TO closecraft_app;
GRANT ALL ON ALL TABLES IN SCHEMA public TO closecraft_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO closecraft_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO closecraft_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO closecraft_app;

-- Step 2: Context helper schema and functions
CREATE SCHEMA IF NOT EXISTS closecraft;

CREATE OR REPLACE FUNCTION closecraft.current_org_id()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('closecraft.current_org_id', true), '');
$$;

CREATE OR REPLACE FUNCTION closecraft.current_user_id()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('closecraft.current_user_id', true), '');
$$;

CREATE OR REPLACE FUNCTION closecraft.current_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('closecraft.current_role', true), '');
$$;

CREATE OR REPLACE FUNCTION closecraft.is_operator()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('closecraft.is_operator', true), ''), 'false') = 'true';
$$;

CREATE OR REPLACE FUNCTION closecraft.is_service_role()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('closecraft.is_service_role', true), ''), 'false') = 'true';
$$;

GRANT USAGE ON SCHEMA closecraft TO closecraft_app, postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA closecraft TO closecraft_app, postgres;

-- Step 3: Enable and FORCE Row Level Security on all customer-owned tables

ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" FORCE ROW LEVEL SECURITY;

ALTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMember" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Opportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opportunity" FORCE ROW LEVEL SECURITY;

ALTER TABLE "CustomPipelineStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomPipelineStage" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" FORCE ROW LEVEL SECURITY;

ALTER TABLE "AiAction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiAction" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Deal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deal" FORCE ROW LEVEL SECURITY;

ALTER TABLE "FollowUpTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FollowUpTask" FORCE ROW LEVEL SECURITY;

ALTER TABLE "QualificationData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QualificationData" FORCE ROW LEVEL SECURITY;

ALTER TABLE "RevenueAction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RevenueAction" FORCE ROW LEVEL SECURITY;

ALTER TABLE "RevenueSignal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RevenueSignal" FORCE ROW LEVEL SECURITY;

ALTER TABLE "RevenueLeak" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RevenueLeak" FORCE ROW LEVEL SECURITY;

ALTER TABLE "SalesSupportRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SalesSupportRequest" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ReadinessAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReadinessAssessment" FORCE ROW LEVEL SECURITY;

ALTER TABLE "PreparationChecklistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PreparationChecklistItem" FORCE ROW LEVEL SECURITY;

ALTER TABLE "PilotEngagement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PilotEngagement" FORCE ROW LEVEL SECURITY;

ALTER TABLE "PilotWorkLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PilotWorkLog" FORCE ROW LEVEL SECURITY;

ALTER TABLE "OperationalIssue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OperationalIssue" FORCE ROW LEVEL SECURITY;

ALTER TABLE "PilotHandover" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PilotHandover" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ClientBlocker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientBlocker" FORCE ROW LEVEL SECURITY;

ALTER TABLE "WorkspaceSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceSubscription" FORCE ROW LEVEL SECURITY;

ALTER TABLE "BachsInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BachsInvoice" FORCE ROW LEVEL SECURITY;

ALTER TABLE "PaymentAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentAttempt" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ProfessionalPayable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfessionalPayable" FORCE ROW LEVEL SECURITY;

ALTER TABLE "WorkspaceInvite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceInvite" FORCE ROW LEVEL SECURITY;

ALTER TABLE "EmergencySupportAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmergencySupportAccess" FORCE ROW LEVEL SECURITY;

ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSession" FORCE ROW LEVEL SECURITY;

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

ALTER TABLE "CallQualityReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CallQualityReview" FORCE ROW LEVEL SECURITY;

ALTER TABLE "AttributedOpportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttributedOpportunity" FORCE ROW LEVEL SECURITY;

ALTER TABLE "WorkspaceQualification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceQualification" FORCE ROW LEVEL SECURITY;

ALTER TABLE "OutboxMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OutboxMessage" FORCE ROW LEVEL SECURITY;

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ServicePackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServicePackage" FORCE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if any to prevent conflicts
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', r.policyname, r.tablename);
  END LOOP;
END
$$;

-- =============================================================================
-- POLICIES: 1. Organization
-- =============================================================================
CREATE POLICY org_select_policy ON "Organization"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    id = closecraft.current_org_id()
  );

CREATE POLICY org_insert_policy ON "Organization"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

CREATE POLICY org_update_policy ON "Organization"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (id = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (id = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY org_delete_policy ON "Organization"
  FOR DELETE USING (
    closecraft.is_service_role() OR 
    (id = closecraft.current_org_id() AND closecraft.current_role() = 'OWNER')
  );

-- =============================================================================
-- POLICIES: 2. OrganizationMember
-- =============================================================================
CREATE POLICY member_select_policy ON "OrganizationMember"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id() OR 
    "userId" = closecraft.current_user_id()
  );

CREATE POLICY member_insert_policy ON "OrganizationMember"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY member_update_policy ON "OrganizationMember"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN')) OR
    ("userId" = closecraft.current_user_id() AND "organizationId" = closecraft.current_org_id())
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN')) OR
    ("userId" = closecraft.current_user_id() AND "organizationId" = closecraft.current_org_id())
  );

CREATE POLICY member_delete_policy ON "OrganizationMember"
  FOR DELETE USING (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN') AND "userId" <> closecraft.current_user_id())
  );

-- =============================================================================
-- POLICIES: 3. Core CRM (Lead, Contact, Opportunity, CustomPipelineStage)
-- =============================================================================

-- Lead
CREATE POLICY lead_select_policy ON "Lead"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (
      "organizationId" = closecraft.current_org_id() AND (
        closecraft.current_role() <> 'EXTERNAL_PROFESSIONAL' OR
        "assignedUserId" = closecraft.current_user_id()
      )
    )
  );

CREATE POLICY lead_insert_policy ON "Lead"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    (
      "organizationId" = closecraft.current_org_id() AND 
      closecraft.current_role() NOT IN ('EXTERNAL_PROFESSIONAL', 'READ_ONLY_REVIEWER')
    )
  );

CREATE POLICY lead_update_policy ON "Lead"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (
      "organizationId" = closecraft.current_org_id() AND (
        closecraft.current_role() <> 'EXTERNAL_PROFESSIONAL' OR
        "assignedUserId" = closecraft.current_user_id()
      )
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (
      "organizationId" = closecraft.current_org_id() AND (
        closecraft.current_role() <> 'EXTERNAL_PROFESSIONAL' OR
        "assignedUserId" = closecraft.current_user_id()
      )
    )
  );

CREATE POLICY lead_delete_policy ON "Lead"
  FOR DELETE USING (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

-- Contact
CREATE POLICY contact_select_policy ON "Contact"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY contact_insert_policy ON "Contact"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() NOT IN ('EXTERNAL_PROFESSIONAL', 'READ_ONLY_REVIEWER'))
  );

CREATE POLICY contact_update_policy ON "Contact"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() NOT IN ('EXTERNAL_PROFESSIONAL', 'READ_ONLY_REVIEWER'))
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() NOT IN ('EXTERNAL_PROFESSIONAL', 'READ_ONLY_REVIEWER'))
  );

CREATE POLICY contact_delete_policy ON "Contact"
  FOR DELETE USING (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

-- Opportunity
CREATE POLICY opp_select_policy ON "Opportunity"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (
      "organizationId" = closecraft.current_org_id() AND (
        closecraft.current_role() <> 'EXTERNAL_PROFESSIONAL' OR
        "assignedUserId" = closecraft.current_user_id()
      )
    )
  );

CREATE POLICY opp_insert_policy ON "Opportunity"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() NOT IN ('EXTERNAL_PROFESSIONAL', 'READ_ONLY_REVIEWER'))
  );

CREATE POLICY opp_update_policy ON "Opportunity"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (
      "organizationId" = closecraft.current_org_id() AND (
        closecraft.current_role() <> 'EXTERNAL_PROFESSIONAL' OR
        "assignedUserId" = closecraft.current_user_id()
      )
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    (
      "organizationId" = closecraft.current_org_id() AND (
        closecraft.current_role() <> 'EXTERNAL_PROFESSIONAL' OR
        "assignedUserId" = closecraft.current_user_id()
      )
    )
  );

CREATE POLICY opp_delete_policy ON "Opportunity"
  FOR DELETE USING (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

-- CustomPipelineStage
CREATE POLICY stage_all_policy ON "CustomPipelineStage"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

-- =============================================================================
-- POLICIES: 4. Communications (Conversation & Message)
-- =============================================================================
CREATE POLICY conv_all_policy ON "Conversation"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY msg_all_policy ON "Message"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "Conversation" c 
      WHERE c.id = "Message"."conversationId" AND c."organizationId" = closecraft.current_org_id()
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    EXISTS (
      SELECT 1 FROM "Conversation" c 
      WHERE c.id = "Message"."conversationId" AND c."organizationId" = closecraft.current_org_id()
    )
  );

-- =============================================================================
-- POLICIES: 5. Appointments, Deals, FollowUpTasks, AI Actions
-- =============================================================================
CREATE POLICY appt_all_policy ON "Appointment"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY deal_all_policy ON "Deal"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY follow_all_policy ON "FollowUpTask"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY ai_all_policy ON "AiAction"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY qual_data_all_policy ON "QualificationData"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "Lead" l 
      WHERE l.id = "QualificationData"."leadId" AND l."organizationId" = closecraft.current_org_id()
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    EXISTS (
      SELECT 1 FROM "Lead" l 
      WHERE l.id = "QualificationData"."leadId" AND l."organizationId" = closecraft.current_org_id()
    )
  );

-- =============================================================================
-- POLICIES: 6. Revenue Engine Signals, Actions, Leaks
-- =============================================================================
CREATE POLICY rev_act_all_policy ON "RevenueAction"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY rev_sig_all_policy ON "RevenueSignal"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY rev_leak_all_policy ON "RevenueLeak"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

-- =============================================================================
-- POLICIES: 7. Pilot & Support Requests
-- =============================================================================
CREATE POLICY support_req_all_policy ON "SalesSupportRequest"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY readiness_all_policy ON "ReadinessAssessment"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "SalesSupportRequest" r 
      WHERE r.id = "ReadinessAssessment"."requestId" AND r."organizationId" = closecraft.current_org_id()
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

CREATE POLICY prep_item_all_policy ON "PreparationChecklistItem"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "ReadinessAssessment" ra 
      JOIN "SalesSupportRequest" r ON r.id = ra."requestId"
      WHERE ra.id = "PreparationChecklistItem"."assessmentId" AND r."organizationId" = closecraft.current_org_id()
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "ReadinessAssessment" ra 
      JOIN "SalesSupportRequest" r ON r.id = ra."requestId"
      WHERE ra.id = "PreparationChecklistItem"."assessmentId" AND r."organizationId" = closecraft.current_org_id()
    )
  );

CREATE POLICY pilot_eng_all_policy ON "PilotEngagement"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id() OR
    (closecraft.current_role() = 'EXTERNAL_PROFESSIONAL' AND "professionalId" IN (
      SELECT p.id FROM "ProfessionalProfile" p WHERE p."userId" = closecraft.current_user_id()
    ))
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY pilot_work_all_policy ON "PilotWorkLog"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "PilotEngagement" pe 
      WHERE pe.id = "PilotWorkLog"."engagementId" AND (
        pe."organizationId" = closecraft.current_org_id() OR
        "PilotWorkLog"."loggedByUserId" = closecraft.current_user_id()
      )
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "loggedByUserId" = closecraft.current_user_id()
  );

CREATE POLICY op_issue_all_policy ON "OperationalIssue"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY pilot_handover_all_policy ON "PilotHandover"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    EXISTS (
      SELECT 1 FROM "PilotEngagement" pe 
      WHERE pe.id = "PilotHandover"."engagementId" AND pe."organizationId" = closecraft.current_org_id()
    )
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

CREATE POLICY client_blocker_all_policy ON "ClientBlocker"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY prof_payable_all_policy ON "ProfessionalPayable"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "professionalId" IN (SELECT id FROM "ProfessionalProfile" WHERE "userId" = closecraft.current_user_id())
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

-- =============================================================================
-- POLICIES: 8. Billing & Bachs Invoices (Strict Write Protection)
-- =============================================================================
CREATE POLICY sub_all_policy ON "WorkspaceSubscription"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY invoice_select_policy ON "BachsInvoice"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY invoice_insert_policy ON "BachsInvoice"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY invoice_update_policy ON "BachsInvoice"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY invoice_delete_policy ON "BachsInvoice"
  FOR DELETE USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

CREATE POLICY payment_attempt_all_policy ON "PaymentAttempt"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

-- =============================================================================
-- POLICIES: 9. Identity & Sessions (User, UserSession, WorkspaceInvite)
-- =============================================================================
CREATE POLICY user_select_policy ON "User"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    id = closecraft.current_user_id() OR
    id IN (
      SELECT om."userId" FROM "OrganizationMember" om 
      WHERE om."organizationId" = closecraft.current_org_id()
    )
  );

CREATE POLICY user_update_policy ON "User"
  FOR UPDATE USING (
    closecraft.is_service_role() OR 
    id = closecraft.current_user_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    id = closecraft.current_user_id()
  );

CREATE POLICY user_session_all_policy ON "UserSession"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    "userId" = closecraft.current_user_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "userId" = closecraft.current_user_id()
  );

CREATE POLICY invite_all_policy ON "WorkspaceInvite"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY emergency_all_policy ON "EmergencySupportAccess"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() = 'OWNER')
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

-- =============================================================================
-- POLICIES: 10. WorkspaceQualification & Sensitive Reviewer Protection
-- =============================================================================
CREATE POLICY qual_all_policy ON "WorkspaceQualification"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

-- =============================================================================
-- POLICIES: 11. Auditing, Quality, Outbox, Packages
-- =============================================================================
CREATE POLICY audit_select_policy ON "AuditLog"
  FOR SELECT USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY audit_insert_policy ON "AuditLog"
  FOR INSERT WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY outbox_all_policy ON "OutboxMessage"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY qa_review_all_policy ON "CallQualityReview"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id() OR
    "professionalId" IN (SELECT id FROM "ProfessionalProfile" WHERE "userId" = closecraft.current_user_id())
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

CREATE POLICY attr_opp_all_policy ON "AttributedOpportunity"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator()
  );

-- ServicePackage: Public template rows (organizationId is null) are readable by all; customized packages are scoped to tenant
CREATE POLICY pkg_select_policy ON "ServicePackage"
  FOR SELECT USING (
    "organizationId" IS NULL OR 
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    "organizationId" = closecraft.current_org_id()
  );

CREATE POLICY pkg_write_policy ON "ServicePackage"
  FOR ALL USING (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  ) WITH CHECK (
    closecraft.is_service_role() OR 
    closecraft.is_operator() OR 
    ("organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))
  );

-- =============================================================================
-- STEP 5: SECURITY TRIGGERS (Tamper-proofing critical fields)
-- =============================================================================

-- 1. Invoices can ONLY be marked as PAID/CONFIRMED by service_role (payment webhook)
CREATE OR REPLACE FUNCTION closecraft.fn_protect_invoice_settlement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status IN ('PAID', 'CONFIRMED', 'FUNDS_AVAILABLE') AND 
     OLD.status NOT IN ('PAID', 'CONFIRMED', 'FUNDS_AVAILABLE') THEN
    IF NOT closecraft.is_service_role() THEN
      RAISE EXCEPTION 'Access Denied: Invoices can only be marked as paid through verified server-side payment webhooks.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_invoice_settlement ON "BachsInvoice";
CREATE TRIGGER trg_protect_invoice_settlement
  BEFORE UPDATE ON "BachsInvoice"
  FOR EACH ROW
  EXECUTE FUNCTION closecraft.fn_protect_invoice_settlement();

-- 2. Prevent member self-promotion and unauthorized role escalation
CREATE OR REPLACE FUNCTION closecraft.fn_protect_member_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    IF NOT (closecraft.is_service_role() OR closecraft.is_operator() OR 
            (OLD."organizationId" = closecraft.current_org_id() AND closecraft.current_role() IN ('OWNER', 'ADMIN'))) THEN
      RAISE EXCEPTION 'Access Denied: Ordinary workspace members cannot alter member roles.';
    END IF;
  END IF;
  IF NEW."organizationId" <> OLD."organizationId" THEN
    RAISE EXCEPTION 'Access Denied: Workspace members cannot be transferred between organizations.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_member_role ON "OrganizationMember";
CREATE TRIGGER trg_protect_member_role
  BEFORE UPDATE ON "OrganizationMember"
  FOR EACH ROW
  EXECUTE FUNCTION closecraft.fn_protect_member_role();

-- 3. Prevent non-operators from modifying reviewerPrivateNotes in WorkspaceQualification
CREATE OR REPLACE FUNCTION closecraft.fn_protect_reviewer_private_notes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW."reviewerPrivateNotes" IS DISTINCT FROM OLD."reviewerPrivateNotes" THEN
    IF NOT (closecraft.is_service_role() OR closecraft.is_operator()) THEN
      RAISE EXCEPTION 'Access Denied: Only authorized platform operators can modify reviewer private notes.';
    END IF;
  END IF;
  IF NEW."organizationId" <> OLD."organizationId" THEN
    RAISE EXCEPTION 'Access Denied: Organization ID cannot be changed on qualification records.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_reviewer_private_notes ON "WorkspaceQualification";
CREATE TRIGGER trg_protect_reviewer_private_notes
  BEFORE UPDATE ON "WorkspaceQualification"
  FOR EACH ROW
  EXECUTE FUNCTION closecraft.fn_protect_reviewer_private_notes();

-- 4. Prevent non-operators from modifying internalNotes in ReadinessAssessment
CREATE OR REPLACE FUNCTION closecraft.fn_protect_readiness_internal_notes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW."internalNotes" IS DISTINCT FROM OLD."internalNotes" THEN
    IF NOT (closecraft.is_service_role() OR closecraft.is_operator()) THEN
      RAISE EXCEPTION 'Access Denied: Only authorized platform operators can modify readiness internal notes.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_readiness_internal_notes ON "ReadinessAssessment";
CREATE TRIGGER trg_protect_readiness_internal_notes
  BEFORE UPDATE ON "ReadinessAssessment"
  FOR EACH ROW
  EXECUTE FUNCTION closecraft.fn_protect_readiness_internal_notes();

-- 5. Prevent cross-tenant lead contact or engagement hijacking
CREATE OR REPLACE FUNCTION closecraft.fn_validate_lead_relationships()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW."contactId" IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "Contact" c WHERE c.id = NEW."contactId" AND c."organizationId" = NEW."organizationId") THEN
      RAISE EXCEPTION 'Cross-Tenant Relationship Violation: Associated contact does not belong to the same organization.';
    END IF;
  END IF;
  IF NEW."pilotEngagementId" IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "PilotEngagement" pe WHERE pe.id = NEW."pilotEngagementId" AND pe."organizationId" = NEW."organizationId") THEN
      RAISE EXCEPTION 'Cross-Tenant Relationship Violation: Associated pilot engagement does not belong to the same organization.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_lead_relationships ON "Lead";
CREATE TRIGGER trg_validate_lead_relationships
  BEFORE INSERT OR UPDATE ON "Lead"
  FOR EACH ROW
  EXECUTE FUNCTION closecraft.fn_validate_lead_relationships();

-- 6. Column-level security: Revoke direct read privileges on private notes from unprivileged app role
REVOKE SELECT ("reviewerPrivateNotes") ON "WorkspaceQualification" FROM closecraft_app;
REVOKE SELECT ("internalNotes") ON "ReadinessAssessment" FROM closecraft_app;
REVOKE SELECT ("passwordHash", "emailVerificationCode") ON "User" FROM closecraft_app;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
