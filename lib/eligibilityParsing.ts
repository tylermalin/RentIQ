/**
 * Parse eligibility requirements from listing text fields (title, description).
 * Extracts income multipliers, credit scores, co-signer policies, etc.
 */

export type IncomeFlexibility = "strict" | "flexible" | "negotiable";
export type CreditFlexibility = "strict" | "flexible" | "negotiable" | "no_minimum";

export interface ParsedEligibility {
  incomeMultiplier?: number;
  incomeFlexibility?: IncomeFlexibility;
  minCreditScore?: number;
  creditFlexibility?: CreditFlexibility;
  cosignerAllowed?: boolean;
  guarantorAllowed?: boolean;
  extraDepositAllowed?: boolean;
  keywords?: string[];
  primeCandidateScore?: number;
}

/**
 * Parse eligibility requirements from listing title and description text.
 */
export function parseEligibilityFromListingFields(
  title: string,
  description: string
): ParsedEligibility {
  const combinedText = `${title} ${description}`.toLowerCase();
  const keywords: string[] = [];
  let incomeMultiplier: number | undefined;
  let incomeFlexibility: IncomeFlexibility | undefined;
  let minCreditScore: number | undefined;
  let creditFlexibility: CreditFlexibility | undefined;
  let cosignerAllowed: boolean | undefined;
  let guarantorAllowed: boolean | undefined;
  let extraDepositAllowed: boolean | undefined;

  // Parse income multiplier (e.g., "3x income", "2.5x rent", "income must be 3 times rent")
  const incomePatterns = [
    /(\d+(?:\.\d+)?)\s*x\s*(?:income|rent|salary)/i,
    /income\s*(?:must\s*be|of|at\s*least)\s*(\d+(?:\.\d+)?)\s*x/i,
    /(\d+(?:\.\d+)?)\s*times\s*(?:income|rent)/i,
  ];

  for (const pattern of incomePatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      const multiplier = parseFloat(match[1]);
      if (multiplier >= 2 && multiplier <= 4) {
        incomeMultiplier = multiplier;
        keywords.push(`${multiplier}x income`);
        break;
      }
    }
  }

  // If no explicit multiplier found, check for flexible language
  if (!incomeMultiplier) {
    if (/\b(flexible|negotiable|open|willing)\b.*\b(income|salary|rent)\b/i.test(combinedText)) {
      incomeFlexibility = "flexible";
      keywords.push("flexible income");
    } else if (/\b(strict|must|required|minimum)\b.*\b(income|salary)\b/i.test(combinedText)) {
      incomeFlexibility = "strict";
    }
  }

  // Parse credit score (e.g., "credit score 650+", "minimum credit 700", "credit: 680")
  const creditPatterns = [
    /(?:credit|credit\s*score|fico)\s*(?:score\s*)?(?:of|at\s*least|minimum|min)?\s*(\d{3,4})\+?/i,
    /(\d{3,4})\+?\s*(?:credit|fico)/i,
  ];

  for (const pattern of creditPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      const score = parseInt(match[1], 10);
      if (score >= 300 && score <= 850) {
        minCreditScore = score;
        keywords.push(`credit ${score}+`);
        break;
      }
    }
  }

  // Check for credit flexibility
  if (!minCreditScore) {
    if (/\b(no\s*credit|credit\s*not\s*required|bad\s*credit\s*ok)\b/i.test(combinedText)) {
      creditFlexibility = "no_minimum";
      keywords.push("no credit check");
    } else if (/\b(flexible|negotiable|open)\b.*\bcredit\b/i.test(combinedText)) {
      creditFlexibility = "flexible";
      keywords.push("flexible credit");
    }
  }

  // Parse co-signer/guarantor
  if (/\b(co[\s-]?signer|co[\s-]?sign|guarantor)\b/i.test(combinedText)) {
    if (/\b(allow|accept|welcome|ok|yes)\b.*\b(co[\s-]?signer|co[\s-]?sign|guarantor)\b/i.test(combinedText)) {
      cosignerAllowed = true;
      keywords.push("co-signer allowed");
    } else if (/\b(co[\s-]?signer|co[\s-]?sign|guarantor)\b.*\b(allow|accept|welcome|ok|yes)\b/i.test(combinedText)) {
      cosignerAllowed = true;
      keywords.push("co-signer allowed");
    } else if (/\b(no|not|don't|doesn't)\b.*\b(co[\s-]?signer|co[\s-]?sign|guarantor)\b/i.test(combinedText)) {
      cosignerAllowed = false;
    }
  }

  // Check for guarantor specifically
  if (/\bguarantor\b/i.test(combinedText) && /\b(allow|accept|welcome|ok|yes)\b/i.test(combinedText)) {
    guarantorAllowed = true;
    keywords.push("guarantor allowed");
  }

  // Parse extra deposit
  if (/\b(extra|additional|higher|larger)\s*(?:security\s*)?deposit\b/i.test(combinedText)) {
    if (/\b(allow|accept|welcome|ok|yes|option)\b/i.test(combinedText)) {
      extraDepositAllowed = true;
      keywords.push("extra deposit option");
    }
  }

  // Calculate prime candidate score (0-100)
  // Higher score = more flexible/accessible
  let primeCandidateScore = 50; // Base score

  if (!minCreditScore || creditFlexibility === "no_minimum") {
    primeCandidateScore += 20;
  }
  if (cosignerAllowed || guarantorAllowed) {
    primeCandidateScore += 15;
  }
  if (extraDepositAllowed) {
    primeCandidateScore += 10;
  }
  if (incomeFlexibility === "flexible" || incomeFlexibility === "negotiable") {
    primeCandidateScore += 15;
  }
  if (incomeMultiplier && incomeMultiplier <= 2.5) {
    primeCandidateScore += 10;
  } else if (incomeMultiplier && incomeMultiplier >= 3.5) {
    primeCandidateScore -= 10;
  }

  primeCandidateScore = Math.max(0, Math.min(100, primeCandidateScore));

  return {
    incomeMultiplier,
    incomeFlexibility,
    minCreditScore,
    creditFlexibility,
    cosignerAllowed,
    guarantorAllowed,
    extraDepositAllowed,
    keywords: keywords.length > 0 ? keywords : undefined,
    primeCandidateScore,
  };
}

