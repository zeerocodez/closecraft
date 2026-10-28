export type PrimaryHelpNeed = 
  | 'SOFTWARE_ORGANIZING'
  | 'MANAGED_SALES_PRO'
  | 'BOTH'
  | 'NOT_SURE_YET';

export type EnquiryRange = '0-9' | '10-19' | '20-49' | '50-99' | '100+' | 'NOT_SURE';

export type NumberInputType = 'EXACT' | 'ESTIMATED' | 'UNKNOWN';

export type WhoFollowsUp =
  | 'MAINLY_ME'
  | 'ONE_MEMBER'
  | 'SEVERAL_PEOPLE'
  | 'EXTERNAL_AGENCY'
  | 'NOT_CLEARLY_ASSIGNED'
  | 'OTHER';

export type FollowUpTrackingMethod =
  | 'ASK_PERSON'
  | 'MESSAGE_HISTORY'
  | 'NOTEBOOK_SPREADSHEET'
  | 'REMINDERS_TASK_TOOL'
  | 'CRM'
  | 'NO_CONSISTENT_WAY'
  | 'OTHER';

export type ForgottenEnquiryOption =
  | 'DESCRIBE_EXAMPLE'
  | 'DELAYS_NO_SPECIFIC'
  | 'NOT_A_PROBLEM'
  | 'NOT_SURE';

export type DifficultyOption =
  | 'REMEMBERING_WHEN'
  | 'KNOWING_WHO'
  | 'FINDING_UPDATE'
  | 'COORDINATING_PEOPLE'
  | 'MANAGING_OLDER_OPPORTUNITIES'
  | 'NONE'
  | 'OTHER';

export type DifficultyFrequency = 'OCCASIONAL' | 'RECURRING';

export type SoftwareFitCategory =
  | 'PRIORITY_SOFTWARE_FIT'
  | 'POTENTIAL_SOFTWARE_FIT'
  | 'EXPLORE_SOFTWARE_FIT'
  | 'NEEDS_MORE_CONTEXT';

export type ManagedServiceNeed =
  | 'RESPONDING_NEW'
  | 'FOLLOWING_UP_EXISTING'
  | 'QUALIFYING_APPOINTMENTS'
  | 'CONDUCTING_CONVERSATIONS'
  | 'HELP_DECIDING';

export type ManagedServiceRecommendation =
  | 'READY_FOR_SERVICE_REVIEW'
  | 'WORKLOAD_OR_ECONOMICS_NEED_REVIEW'
  | 'BOUNDED_PILOT_RECOMMENDED'
  | 'ALTERNATIVE_SUPPORT_MAY_FIT'
  | 'PREPARATION_REQUIRED'
  | 'NOT_REQUESTED';

export interface SoftwareAnswers {
  newEnquiries30dExact?: number | null;
  newEnquiries30dRange?: EnquiryRange | null;
  newEnquiries30dType: NumberInputType;
  olderOpportunitiesCount?: number | null;
  olderOpportunitiesRange?: EnquiryRange | null;
  olderOpportunitiesType: NumberInputType;
  whoFollowsUp?: WhoFollowsUp | null;
  whoFollowsUpDetail?: string | null;
  howFollowUpChecked: FollowUpTrackingMethod[];
  howFollowUpCheckedDetail?: string | null;
  forgottenEnquiryOption?: ForgottenEnquiryOption | null;
  forgottenEnquiryNarrative?: string | null;
  forgottenEnquiryAftermath?: string | null;
  difficulties: DifficultyOption[];
  difficultyFrequency?: DifficultyFrequency | null;
}

export interface ManagedServiceAnswers {
  managedServiceNeed: ManagedServiceNeed;
  qualifiedConversations30dExact?: number | null;
  qualifiedConversations30dRange?: '0-9' | '10-19' | '20-39' | '40+' | 'NOT_SURE' | null;
  bookedConversationsNext30dExact?: number | null;
  bookedConversationsNext30dRange?: '0-9' | '10-19' | '20-39' | '40+' | 'NOT_SURE' | null;
  pipelineSuitableCount?: number | null;
  pipelineAgreedNextCallCount?: number | null;
  pipelineStagesSummary?: string | null;
  workloadTasksPerOpportunity?: number | null;
  workloadChannels?: string[];
  workloadAvgTaskDurationMinutes?: number | null;
  workloadCoverageHours?: string | null;
  workloadExpectedResponseWindow?: string | null;
  workloadLanguages?: string[];
}

export interface EconomicsAnswers {
  currency: string;
  assessmentPeriod: string;
  expectedAttributableSales?: number | null;
  typicalSaleValue?: number | null;
  directDeliveryCost?: number | null;
  grossProfitPerSale?: number | null;
  fixedEngagementCost?: number | null;
  variableFeePerSale?: number | null;
  totalEngagementCost?: number | null;
  historicalConversations?: number | null;
  historicalSales?: number | null;
  historicalMeasurementPeriod?: string | null;
  sameCohort?: boolean | null;
  economicsEvidenceSource?: string | null;
  dataLimitationNote?: string | null;
}

export interface BoundedPilotSpec {
  question: string;
  scope: string;
  capacity: string;
  period: string;
  fee: number;
  currency: string;
  clientObligations: string[];
  evidenceToCollect: string[];
  reviewDate: Date;
  stopConditions: string[];
}
