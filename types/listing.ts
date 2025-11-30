export interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number; // monthly rent
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  creditScoreRequired: number;
  incomeRequired: number; // minimum annual income
  allowsCoSigner: boolean;
  description?: string;
  createdAt: string;
}

export interface RenterProfile {
  creditScore: number;
  income: number; // annual income
  hasCoSigner: boolean;
}

export interface EligibilityResult {
  listingId: string;
  eligibilityScore: number; // 0-100 percentage
  isEligible: boolean;
  reasons: string[];
  missingRequirements: string[];
}

