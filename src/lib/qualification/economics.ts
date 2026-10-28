import { EconomicsAnswers } from './types';

export interface EconomicsCalculationResult {
  isCalculable: boolean;
  unassessedReason?: string;
  expectedAttributableSales: number | null;
  grossProfitPerSale: number | null;
  totalEngagementCost: number | null;
  fixedCost: number;
  variableCost: number;
  estimatedContribution: number | null;
  isPositiveContribution: boolean;
  currency: string;
  boundedPilotRecommended: boolean;
  caveatNotes: string[];
}

/**
 * Pure domain calculation for Managed Service Economics Assessment.
 * Implements the official Closecraft screening formula:
 * Expected Attributable Sales * Gross Profit Per Sale - Total Engagement Cost = Estimated Contribution.
 */
export function calculateEconomicsAssessment(
  inputs: EconomicsAnswers,
  operatorOverrides?: {
    assumedAttributableSales?: number;
    assumedGrossProfit?: number;
    assumedFixedCost?: number;
    assumedVariableFeePerSale?: number;
  }
): EconomicsCalculationResult {
  const currency = inputs.currency || 'NGN';
  const caveats: string[] = [];

  // Multi-currency safety: Verify single currency enforcement
  if (inputs.currency && inputs.currency !== 'NGN' && inputs.currency !== 'USD' && inputs.currency !== 'GBP') {
    return {
      isCalculable: false,
      unassessedReason: `Unsupported currency '${inputs.currency}'. Calculations must be conducted in a single configured currency.`,
      expectedAttributableSales: null,
      grossProfitPerSale: null,
      totalEngagementCost: null,
      fixedCost: 0,
      variableCost: 0,
      estimatedContribution: null,
      isPositiveContribution: false,
      currency,
      boundedPilotRecommended: true,
      caveatNotes: ['Currency must be verified.'],
    };
  }

  // Check cohort comparability
  if (inputs.sameCohort === false) {
    caveats.push('Historical sales and conversation figures do not belong to the same cohort. Win rate comparability is limited.');
  }

  // 1. Determine Attributable Sales
  const expectedSales = operatorOverrides?.assumedAttributableSales ?? inputs.expectedAttributableSales ?? null;

  // 2. Determine Gross Profit Per Sale (Revenue - Direct Delivery Cost)
  let grossProfit: number | null = operatorOverrides?.assumedGrossProfit ?? inputs.grossProfitPerSale ?? null;
  
  if (grossProfit === null && typeof inputs.typicalSaleValue === 'number') {
    const directCost = inputs.directDeliveryCost || 0;
    grossProfit = Math.max(0, inputs.typicalSaleValue - directCost);
  }

  // 3. Determine Costs
  const fixedCost = operatorOverrides?.assumedFixedCost ?? inputs.fixedEngagementCost ?? 150000; // standard pilot base
  const variableFee = operatorOverrides?.assumedVariableFeePerSale ?? inputs.variableFeePerSale ?? 0;

  // If critical numbers are missing, do NOT invent an industry average or fill with AI
  if (expectedSales === null || grossProfit === null) {
    return {
      isCalculable: false,
      unassessedReason: 'Insufficient historical sales evidence or gross profit data. Financial contribution kept unassessed. Bounded pilot recommended to establish baseline metrics.',
      expectedAttributableSales: expectedSales,
      grossProfitPerSale: grossProfit,
      totalEngagementCost: null,
      fixedCost,
      variableCost: 0,
      estimatedContribution: null,
      isPositiveContribution: false,
      currency,
      boundedPilotRecommended: true,
      caveatNotes: [
        'Gross profit per sale or attributable volume was not provided.',
        'Industry averages or fabricated conversion estimates were strictly rejected.',
        'A 30-day bounded pilot scope is recommended to measure actual close rate.'
      ],
    };
  }

  // Total engagement cost = Fixed cost + (Attributable sales * Variable fee per sale)
  const variableCost = Math.round(expectedSales * variableFee);
  const totalCost = fixedCost + variableCost;

  // Estimated contribution = (Expected Attributable Sales * Gross Profit Per Sale) - Total Engagement Cost
  const grossRevenueGenerated = Math.round(expectedSales * grossProfit);
  const estimatedContribution = grossRevenueGenerated - totalCost;
  const isPositive = estimatedContribution > 0;

  caveats.push('This calculation represents an exploratory screening estimate, not a guaranteed commercial return.');
  caveats.push('Attributable sales exclude organic customer referrals or self-served conversions that would have completed without managed closer assistance.');

  return {
    isCalculable: true,
    expectedAttributableSales: expectedSales,
    grossProfitPerSale: grossProfit,
    totalEngagementCost: totalCost,
    fixedCost,
    variableCost,
    estimatedContribution,
    isPositiveContribution: isPositive,
    currency,
    boundedPilotRecommended: !isPositive,
    caveatNotes: caveats,
  };
}
