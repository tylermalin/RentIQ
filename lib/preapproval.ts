export type PreapprovalInput = {
  monthlyIncome: number;
  creditBand: "<580" | "580–649" | "650–699" | "700–749" | "750+";
  savings: number;
  hasCosigner: boolean;
  targetRent: number;
};

export type PreapprovalResult = {
  strength: "strong" | "borderline" | "weak";
  maxRecommendedRent: number;
  explanation: string;
  suggestedTopUpDeposit?: number; // optional, null if not needed
};

/**
 * Convert credit score band to approximate numeric score
 */
function getCreditScoreFromBand(band: "<580" | "580–649" | "650–699" | "700–749" | "750+"): number {
  const bandMap: Record<string, number> = {
    '<580': 550,
    '580–649': 615,
    '650–699': 675,
    '700–749': 725,
    '750+': 775,
  };
  return bandMap[band] || 650;
}

/**
 * Calculate preapproval strength and recommendations
 */
export function calculatePreapproval(input: PreapprovalInput): PreapprovalResult {
  const { monthlyIncome, creditBand, savings, hasCosigner, targetRent } = input;
  const creditScore = getCreditScoreFromBand(creditBand);

  // Calculate maximum recommended rent based on income (standard rule: rent should be 1/3 of income)
  // So max rent = monthlyIncome / 3
  const maxRentByIncome = monthlyIncome / 3;
  
  // Calculate based on savings (typically need 2-3 months rent in savings for move-in costs)
  // Move-in costs usually include: first month + last month + security deposit = ~2-3 months rent
  const maxRentBySavings = savings / 2; // More reasonable: 2 months rent for move-in costs
  
  // Start with income-based calculation as primary
  // Only apply savings constraint if it's reasonable and not too restrictive
  // This prevents low savings from unfairly limiting high-income earners
  let maxRecommendedRent = maxRentByIncome;
  
  // Apply savings constraint only if:
  // 1. Savings-based rent is lower than income-based rent (savings is limiting)
  // 2. Savings allows at least 1 month of rent at the income-based rate (reasonable minimum)
  // This way, someone with $8500/month income and $1000 savings can still afford ~$2833/month rent
  // (since $1000 / 2 = $500, but we use income-based $2833 instead)
  if (maxRentBySavings < maxRentByIncome) {
    // Only cap by savings if savings would allow at least 1 month of income-based rent
    // This means: savings >= maxRentByIncome (at least 1 month)
    if (savings >= maxRentByIncome) {
      // Savings is sufficient for at least 1 month, use it as a soft constraint
      maxRecommendedRent = Math.min(maxRentByIncome, maxRentBySavings * 1.5); // Allow some flexibility
    } else {
      // Savings is very low (< 1 month rent), reduce income-based rent slightly
      // but don't cap it too aggressively - still allow up to 90% of income-based rent
      maxRecommendedRent = maxRentByIncome * 0.9;
    }
  }
  
  // Adjust based on credit score
  if (creditScore < 600) {
    maxRecommendedRent *= 0.85; // Reduce by 15% for poor credit
  } else if (creditScore < 650) {
    maxRecommendedRent *= 0.95; // Reduce by 5% for fair credit
  }
  
  // Boost if cosigner available
  if (hasCosigner) {
    maxRecommendedRent *= 1.1; // Increase by 10% with cosigner
  }
  
  // Round to nearest 50
  maxRecommendedRent = Math.round(maxRecommendedRent / 50) * 50;
  
  // Ensure minimum reasonable rent (at least $500/month)
  maxRecommendedRent = Math.max(500, maxRecommendedRent);
  
  // Determine strength
  let strength: "strong" | "borderline" | "weak";
  let explanation: string;
  let suggestedTopUpDeposit: number | undefined;
  
  const incomeRatio = monthlyIncome / targetRent;
  const savingsMonths = savings / targetRent;
  const creditScoreGood = creditScore >= 650;
  
  if (incomeRatio >= 3 && creditScoreGood && savingsMonths >= 3) {
    strength = "strong";
    explanation = `Your financial profile is strong. You meet the standard 3x income requirement, have good credit (${creditScore}+), and sufficient savings (${Math.round(savingsMonths)} months of rent). You should have no trouble getting approved for rentals up to $${maxRecommendedRent.toLocaleString()}/month.`;
  } else if (incomeRatio >= 2.5 && (creditScoreGood || hasCosigner) && savingsMonths >= 2) {
    strength = "borderline";
    const needsDeposit = incomeRatio < 3 || savingsMonths < 3;
    
    if (needsDeposit && savings >= targetRent * 2) {
      // Suggest additional deposit to strengthen application
      suggestedTopUpDeposit = Math.round((targetRent * 3 - savings) / 100) * 100;
      if (suggestedTopUpDeposit > 0 && suggestedTopUpDeposit <= targetRent * 2) {
        explanation = `Your profile is borderline. While you meet basic requirements, offering an additional security deposit of $${suggestedTopUpDeposit.toLocaleString()} (bringing total to $${(savings + suggestedTopUpDeposit).toLocaleString()}) would significantly strengthen your application. This shows financial stability and reduces landlord risk.`;
      } else {
        explanation = `Your profile is borderline. You're close to meeting all requirements. Consider properties up to $${maxRecommendedRent.toLocaleString()}/month, and be prepared to provide additional documentation or a larger security deposit if needed.`;
        suggestedTopUpDeposit = undefined;
      }
    } else {
      explanation = `Your profile is borderline. You meet most requirements but may face competition from stronger applicants. Focus on properties up to $${maxRecommendedRent.toLocaleString()}/month and consider offering a larger security deposit or providing additional financial documentation.`;
    }
  } else {
    strength = "weak";
    const issues: string[] = [];
    
    if (incomeRatio < 2.5) {
      issues.push(`income is below the standard 3x rent requirement`);
    }
    if (creditScore < 600 && !hasCosigner) {
      issues.push(`credit score may be below landlord requirements`);
    }
    if (savingsMonths < 2) {
      issues.push(`savings may be insufficient for move-in costs`);
    }
    
    explanation = `Your profile needs strengthening. ${issues.join(', ')}. We recommend focusing on properties up to $${maxRecommendedRent.toLocaleString()}/month. Consider: ${hasCosigner ? '' : 'adding a co-signer, '}increasing your savings, or looking for properties with more flexible requirements.`;
    
    // Suggest deposit if they have some savings
    if (savings >= targetRent && savings < targetRent * 3) {
      suggestedTopUpDeposit = Math.round((targetRent * 3 - savings) / 100) * 100;
      if (suggestedTopUpDeposit > 0) {
        explanation += ` Offering an additional $${suggestedTopUpDeposit.toLocaleString()} security deposit could help.`;
      }
    }
  }
  
  return {
    strength,
    maxRecommendedRent,
    explanation,
    suggestedTopUpDeposit: suggestedTopUpDeposit && suggestedTopUpDeposit > 0 ? suggestedTopUpDeposit : undefined,
  };
}

