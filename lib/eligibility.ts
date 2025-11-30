import { Listing } from './listings';

export interface RenterProfile {
  monthlyIncome: number;
  estimatedCreditScore: number;
  hasCosigner: boolean;
  maxRent: number;
}

export interface ListingWithScore {
  listing: Listing;
  score: number;
}

/**
 * Compute approval score for a single listing based on renter profile
 * Returns a number between 0 and 100
 */
export function computeApprovalScore(
  listing: Listing,
  monthlyIncome: number,
  estimatedCreditScore: number,
  hasCosigner: boolean,
  maxRent: number
): number {
  // If listing rent exceeds max rent, return 0
  if (listing.rent > maxRent) {
    return 0;
  }

  // Use incomeMultiplier from listing, fallback to 3x if not specified
  const incomeMultiplier = listing.incomeMultiplier ?? 3;

  // Start with base score of 50
  let score = 50;

  // Income check: +25 if income >= incomeMultiplier * rent, else scale down
  const requiredMonthlyIncome = incomeMultiplier * listing.rent;
  if (monthlyIncome >= requiredMonthlyIncome) {
    score += 25;
  } else {
    // Scale down proportionally, but don't go below 0
    const incomeRatio = monthlyIncome / requiredMonthlyIncome;
    score += Math.max(0, incomeRatio * 25 - 10); // Penalty for being below requirement
  }

  // Credit score check - use minCreditScore from listing
  const minCreditScore = listing.minCreditScore ?? null;
  if (minCreditScore !== null && minCreditScore !== undefined) {
    if (estimatedCreditScore >= minCreditScore) {
      score += 15;
    } else if (hasCosigner && (listing.cosignerAllowed || listing.guarantorAllowed)) {
      // Can use cosigner to compensate
      score += 10;
    } else {
      // Below credit requirement and no cosigner option
      score -= 20;
    }
  } else {
    // No explicit credit requirement, small bonus
    score += 5;
  }

  // Co-signer/guarantor bonus
  if ((listing.cosignerAllowed || listing.guarantorAllowed) && hasCosigner) {
    score += 10;
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Filter listings and compute eligibility scores
 * Returns array of listings with scores, sorted descending by score
 */
export function filterEligibleListings(
  listings: Listing[],
  renterProfile: RenterProfile
): ListingWithScore[] {
  const results: ListingWithScore[] = [];

  for (const listing of listings) {
    const score = computeApprovalScore(
      listing,
      renterProfile.monthlyIncome,
      renterProfile.estimatedCreditScore,
      renterProfile.hasCosigner,
      renterProfile.maxRent
    );

    results.push({ listing, score });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
