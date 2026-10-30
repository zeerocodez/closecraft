export type EmailContext = 'CLOSECRAFT' | 'DSS';

export type ClosecraftTemplateId =
  | 'CC-01'
  | 'CC-02'
  | 'CC-03'
  | 'CC-04'
  | 'CC-05'
  | 'CC-06'
  | 'CC-07'
  | 'CC-08'
  | 'CC-09'
  | 'CC-10';

export type DSSTemplateId =
  | 'DSS-01'
  | 'DSS-02'
  | 'DSS-03'
  | 'DSS-04'
  | 'DSS-05'
  | 'DSS-06'
  | 'DSS-07'
  | 'DSS-08'
  | 'DSS-09'
  | 'DSS-10'
  | 'DSS-11';

export type TemplateId = ClosecraftTemplateId | DSSTemplateId;

export type RenderedEmail = {
  templateId: TemplateId;
  context: EmailContext;
  subject: string;
  preheader: string;
  html: string;
  text: string;
};

export type EmailRenderResult = RenderedEmail;

export type BaseEmailData = {
  first_name?: string;
  support_url?: string;
};

// Closecraft Data Types
export type CC01Data = BaseEmailData & {
  verification_url: string;
  verification_code?: string;
  verification_expiry_description?: string;
};

export type CC02Data = BaseEmailData & {
  workspace_name: string;
  trial_end_datetime: string;
  dashboard_url: string;
};

export type CC03Data = BaseEmailData & {
  workspace_name: string;
  trial_end_datetime: string;
  billing_url: string;
};

export type CC04Data = BaseEmailData & {
  workspace_name: string;
  trial_end_datetime: string;
  billing_url: string;
};

export type CC05Data = BaseEmailData & {
  workspace_name: string;
  plan_name: string;
  billing_period: string;
  amount_paid: string;
  payment_reference: string;
  dashboard_url: string;
  billing_url: string;
};

export type CC06Data = BaseEmailData & {
  workspace_name: string;
  amount_due: string;
  billing_url: string;
  order_reference: string;
};

export type CC07Data = BaseEmailData & {
  workspace_name: string;
  access_end_datetime: string;
  recurring_disabled?: boolean;
  billing_url: string;
};

export type CC08Data = BaseEmailData & {
  reset_url: string;
  reset_expiry_description?: string;
};

export type CC09Data = BaseEmailData & {
  security_event_datetime: string;
  account_recovery_url: string;
};

export type CC10Data = BaseEmailData & {
  workspace_name: string;
  inviter_name: string;
  invited_role_label: string;
  invitation_url: string;
  invitation_expiry_datetime: string;
};

// DSS Data Types
export type DSS01Data = BaseEmailData & {
  programme_name: string;
  cohort_name: string;
  review_required?: boolean;
  application_url: string;
  application_reference: string;
};

export type DSS02Data = BaseEmailData & {
  programme_name: string;
  cohort_name: string;
  offer_url: string;
  offer_expiry_datetime?: string;
};

export type DSS03Data = BaseEmailData & {
  programme_name: string;
  cohort_name: string;
  original_fee: string;
  discount_amount?: string;
  tax_or_fee_label?: string;
  tax_or_fee_amount?: string;
  amount_paid: string;
  payment_reference: string;
  order_reference: string;
  access_status: 'ACTIVE' | 'PENDING';
  receipt_url: string;
};

export type DSS04Data = BaseEmailData & {
  programme_name: string;
  cohort_name: string;
  dashboard_url: string;
  start_datetime?: string;
  has_live_schedule?: boolean;
};

export type DSS05Data = BaseEmailData & {
  cohort_name: string;
  schedule_action_label: 'confirmed' | 'updated';
  schedule_url: string;
  display_timezone: string;
  changed_session_title?: string;
  previous_datetime?: string;
  new_datetime?: string;
};

export type DSS06Data = BaseEmailData & {
  session_title: string;
  session_datetime: string;
  programme_name: string;
  session_url: string;
  approved_preparation_note?: string;
};

export type DSS07Data = BaseEmailData & {
  assignment_title: string;
  feedback_url: string;
  revision_due_datetime?: string;
};

export type DSS08Data = BaseEmailData & {
  programme_name: string;
  completion_review_url: string;
  revision_due_datetime?: string;
};

export type DSS09Data = BaseEmailData & {
  programme_name: string;
  certificate_url: string;
};

export type DSS10Data = BaseEmailData & {
  programme_name: string;
  order_url: string;
  order_reference: string;
};

export type DSS11Data = BaseEmailData & {
  programme_name: string;
  order_reference: string;
  refund_reference: string;
  refund_amount: string;
  refund_processed_datetime: string;
  refund_details_url: string;
  approved_access_change_message?: string;
};
