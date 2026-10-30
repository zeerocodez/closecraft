import { db } from '@/lib/db';
import { getDSSProduct, DSS_PRODUCTS } from './products';

export const EARLY_BIRD_CAMPAIGN_CODE = 'cohort001';
export const EARLY_BIRD_CAMPAIGN_NAME = 'DSS Early Bird Offer';
export const EARLY_BIRD_DISCOUNT_PERCENT = 50;
export const RESERVATION_WINDOW_MINUTES = 30;

export const DEFAULT_ELIGIBLE_PRODUCT_SLUGS = [
  'dss-setters-route',
  'dss-closers-route',
  'dss-live-roleplay-internship',
  'dss-both-routes',
];

export const DSS_EARLY_BIRD_CONFIG = {
  name: EARLY_BIRD_CAMPAIGN_NAME,
  code: EARLY_BIRD_CAMPAIGN_CODE,
  discountPercentage: EARLY_BIRD_DISCOUNT_PERCENT,
  isActive: true,
  maxRedemptionsPerLearner: 1,
  eligibleProductSlugs: JSON.stringify(DEFAULT_ELIGIBLE_PRODUCT_SLUGS),
  excludedProductSlugs: JSON.stringify(['starter', 'pro', 'enterprise', 'managed-sales-service']),
  currency: 'NGN',
};

export type EarlyBirdValidationResult =
  | {
      valid: true;
      campaignCode: string;
      discountPercent: number;
      originalPriceKobo: number;
      discountAmountKobo: number;
      finalPriceKobo: number;
      originalPriceNGN: number;
      discountAmountNGN: number;
      finalPriceNGN: number;
      currency: string;
      productTitle: string;
      productSlug: string;
      campaignName: string;
    }
  | {
      valid: false;
      error: string;
      code:
        | 'UNRECOGNIZED_CODE'
        | 'WRONG_PRODUCT'
        | 'EXPIRED_OR_DISABLED'
        | 'ALREADY_REDEEMED'
        | 'EXISTING_DISCOUNT'
        | 'COHORT_FULL'
        | 'VALIDATION_FAILURE';
    };

/**
 * Normalizes user-entered discount code:
 * - Trims leading/trailing whitespace
 * - Converts to lowercase for comparison
 */
export function normalizeCouponCode(code: string | null | undefined): string {
  if (!code || typeof code !== 'string') return '';
  return code.trim().toLowerCase();
}

/**
 * Gets or initializes the central EarlyBirdCampaign configuration in the database
 */
export async function getOrCreateEarlyBirdCampaign() {
  let campaign = await db.earlyBirdCampaign.findUnique({
    where: { code: EARLY_BIRD_CAMPAIGN_CODE },
  });

  if (!campaign) {
    campaign = await db.earlyBirdCampaign.create({
      data: {
        code: EARLY_BIRD_CAMPAIGN_CODE,
        name: EARLY_BIRD_CAMPAIGN_NAME,
        discountPercent: EARLY_BIRD_DISCOUNT_PERCENT,
        currency: 'NGN',
        isActive: true,
        eligibleProductSlugs: JSON.stringify(DEFAULT_ELIGIBLE_PRODUCT_SLUGS),
        cohortSlug: 'cohort-001',
      },
    });
  }

  return campaign;
}

/**
 * Validates the early bird discount code strictly against approved business rules
 */
export async function validateEarlyBirdCode({
  code,
  productSlug,
  learnerEmail,
  existingDiscountApplied = false,
  currency = 'NGN',
}: {
  code: string;
  productSlug: string;
  learnerEmail?: string;
  existingDiscountApplied?: boolean;
  currency?: string;
}): Promise<EarlyBirdValidationResult> {
  try {
    const cleanCode = normalizeCouponCode(code);

    // Rule 1: Code check
    if (cleanCode !== EARLY_BIRD_CAMPAIGN_CODE) {
      return {
        valid: false,
        error: 'We couldn’t apply that code. Check it and try again.',
        code: 'UNRECOGNIZED_CODE',
      };
    }

    // Rule 2: Stacking check
    if (existingDiscountApplied) {
      return {
        valid: false,
        error: 'This offer can’t be combined with your current discount.',
        code: 'EXISTING_DISCOUNT',
      };
    }

    // Rule 3: Currency check - Early bird campaign is for approved NGN offers
    if (currency.toUpperCase() !== 'NGN') {
      return {
        valid: false,
        error: 'This offer applies to selected DSS programmes. It isn’t available for this purchase.',
        code: 'WRONG_PRODUCT',
      };
    }

    // Rule 4: Product eligibility check
    // Exclude software subscriptions, software trials, managed sales services
    const isExcludedScope =
      productSlug.startsWith('starter-') ||
      productSlug.startsWith('pro-') ||
      productSlug.startsWith('enterprise-') ||
      productSlug.includes('managed-sales') ||
      productSlug.includes('pilot-');

    if (isExcludedScope) {
      return {
        valid: false,
        error: 'This offer applies to selected DSS programmes. It isn’t available for this purchase.',
        code: 'WRONG_PRODUCT',
      };
    }

    const campaign = await getOrCreateEarlyBirdCampaign();

    // Check if campaign is active
    if (!campaign.isActive) {
      return {
        valid: false,
        error: 'This early bird offer is no longer available. Your current fee is shown below.',
        code: 'EXPIRED_OR_DISABLED',
      };
    }

    // Check campaign expiry date if configured
    const now = new Date();
    if (campaign.expiresAt && campaign.expiresAt < now) {
      return {
        valid: false,
        error: 'This early bird offer is no longer available. Your current fee is shown below.',
        code: 'EXPIRED_OR_DISABLED',
      };
    }

    // Check campaign start date if configured
    if (campaign.startsAt && campaign.startsAt > now) {
      return {
        valid: false,
        error: 'This early bird offer is no longer available. Your current fee is shown below.',
        code: 'EXPIRED_OR_DISABLED',
      };
    }

    // Check campaign capacity limit
    if (campaign.maxRedemptions && campaign.currentRedemptions >= campaign.maxRedemptions) {
      return {
        valid: false,
        error: 'This cohort is full. View the next available cohort.',
        code: 'COHORT_FULL',
      };
    }

    let eligibleSlugs: string[] = DEFAULT_ELIGIBLE_PRODUCT_SLUGS;
    try {
      eligibleSlugs = JSON.parse(campaign.eligibleProductSlugs);
    } catch {
      eligibleSlugs = DEFAULT_ELIGIBLE_PRODUCT_SLUGS;
    }

    if (!eligibleSlugs.includes(productSlug)) {
      return {
        valid: false,
        error: 'This offer applies to selected DSS programmes. It isn’t available for this purchase.',
        code: 'WRONG_PRODUCT',
      };
    }

    const dssProduct = getDSSProduct(productSlug);
    if (!dssProduct) {
      return {
        valid: false,
        error: 'This offer applies to selected DSS programmes. It isn’t available for this purchase.',
        code: 'WRONG_PRODUCT',
      };
    }

    // Price safety check:
    // Prompt directive: "A ₦50,000 fee in previous sprint planning was an assumption...
    // Do not automatically halve it to ₦25,000. An administrator must explicitly mark a genuine
    // ₦50,000 base-price product eligible before it can receive the campaign."
    // If base tuition is ₦50,000 and not explicitly marked, reject.
    if (dssProduct.priceNGN === 50000 && !campaign.eligibleProductSlugs.includes('"50k-approved"')) {
      return {
        valid: false,
        error: 'This offer applies to selected DSS programmes. It isn’t available for this purchase.',
        code: 'WRONG_PRODUCT',
      };
    }

    // Rule 5: One redemption per learner limit check
    if (learnerEmail) {
      const cleanEmail = learnerEmail.toLowerCase().trim();
      const existingRedeemed = await db.discountReservation.findFirst({
        where: {
          campaignId: campaign.id,
          learnerEmail: cleanEmail,
          status: 'REDEEMED',
        },
      });

      if (existingRedeemed) {
        return {
          valid: false,
          error: 'You’ve already used this early bird offer.',
          code: 'ALREADY_REDEEMED',
        };
      }
    }

    // 50% calculation:
    // ₦100,000 base tuition -> 50% discount = ₦50,000 -> final = ₦50,000
    // ₦150,000 base tuition -> 50% discount = ₦75,000 -> final = ₦75,000
    const originalPriceKobo = dssProduct.priceKobo;
    const discountAmountKobo = Math.floor((originalPriceKobo * campaign.discountPercent) / 100);
    const finalPriceKobo = originalPriceKobo - discountAmountKobo;

    const originalPriceNGN = dssProduct.priceNGN;
    const discountAmountNGN = discountAmountKobo / 100;
    const finalPriceNGN = finalPriceKobo / 100;

    return {
      valid: true,
      campaignCode: EARLY_BIRD_CAMPAIGN_CODE,
      discountPercent: campaign.discountPercent,
      originalPriceKobo,
      discountAmountKobo,
      finalPriceKobo,
      originalPriceNGN,
      discountAmountNGN,
      finalPriceNGN,
      currency: 'NGN',
      productTitle: dssProduct.title,
      productSlug: dssProduct.slug,
      campaignName: campaign.name,
    };
  } catch (err) {
    console.error('Error validating early bird code:', err);
    return {
      valid: false,
      error: 'We couldn’t check the code right now. Please try again before paying.',
      code: 'VALIDATION_FAILURE',
    };
  }
}

/**
 * Creates a transactional discount reservation during pending checkout with a 30-minute bounded expiry.
 * Concurrency protected: prevents concurrent checkouts from redeeming same learner's single allowance.
 */
export async function reserveDiscount({
  code,
  productSlug,
  learnerEmail,
  orderReference,
}: {
  code: string;
  productSlug: string;
  learnerEmail: string;
  orderReference: string;
}) {
  const cleanEmail = learnerEmail.toLowerCase().trim();

  // Validate the code first
  const validation = await validateEarlyBirdCode({
    code,
    productSlug,
    learnerEmail: cleanEmail,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const campaign = await getOrCreateEarlyBirdCampaign();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_WINDOW_MINUTES * 60 * 1000);

  // Transactional reservation:
  return await db.$transaction(async (tx) => {
    // Check if another active reservation or redeemed status exists for this learner
    const existing = await tx.discountReservation.findFirst({
      where: {
        campaignId: campaign.id,
        learnerEmail: cleanEmail,
        OR: [
          { status: 'REDEEMED' },
          {
            status: 'RESERVED',
            expiresAt: { gt: now },
            orderReference: { not: orderReference },
          },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'REDEEMED') {
        throw new Error('You’ve already used this early bird offer.');
      }
      throw new Error('You have another pending checkout reserving this early bird offer. Please complete or cancel it.');
    }

    // Upsert reservation for this specific orderReference
    const reservation = await tx.discountReservation.upsert({
      where: { orderReference },
      create: {
        campaignId: campaign.id,
        learnerEmail: cleanEmail,
        productSlug,
        status: 'RESERVED',
        originalAmountKobo: validation.originalPriceKobo,
        discountAmountKobo: validation.discountAmountKobo,
        finalAmountKobo: validation.finalPriceKobo,
        currency: 'NGN',
        orderReference,
        expiresAt,
      },
      update: {
        campaignId: campaign.id,
        learnerEmail: cleanEmail,
        productSlug,
        status: 'RESERVED',
        originalAmountKobo: validation.originalPriceKobo,
        discountAmountKobo: validation.discountAmountKobo,
        finalAmountKobo: validation.finalPriceKobo,
        expiresAt,
      },
    });

    return { reservation, validation };
  });
}

/**
 * Confirms redemption of the early bird discount after verified payment
 */
export async function confirmDiscountRedemption({
  orderReference,
  paymentReference,
}: {
  orderReference: string;
  paymentReference?: string;
}) {
  return await db.$transaction(async (tx) => {
    const reservation = await tx.discountReservation.findUnique({
      where: { orderReference },
    });

    if (!reservation) return null;
    if (reservation.status === 'REDEEMED') return reservation; // Idempotent

    const updated = await tx.discountReservation.update({
      where: { orderReference },
      data: {
        status: 'REDEEMED',
        redeemedAt: new Date(),
        paymentReference: paymentReference || null,
      },
    });

    // Increment campaign redemption count
    await tx.earlyBirdCampaign.update({
      where: { id: reservation.campaignId },
      data: {
        currentRedemptions: { increment: 1 },
      },
    });

    return updated;
  });
}

/**
 * Releases a reserved discount upon cancellation, terminal failure, or expiry
 */
export async function releaseDiscountReservation(orderReference: string) {
  try {
    const reservation = await db.discountReservation.findUnique({
      where: { orderReference },
    });

    if (!reservation || reservation.status === 'REDEEMED') {
      return null;
    }

    return await db.discountReservation.update({
      where: { orderReference },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('Error releasing discount reservation:', err);
    return null;
  }
}
