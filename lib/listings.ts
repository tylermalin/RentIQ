export type Listing = {
  id: string;
  title: string;
  address?: string;
  neighborhood?: string;
  city: string;
  rent: number;
  beds: number;
  baths: number;
  description?: string;
  source: string; // e.g. "craigslist_la" | "manual" | etc.

  primaryImageUrl?: string;
  imageUrls?: string[];

  // Eligibility fields from eligibilityParsing
  incomeMultiplier?: number;
  incomeFlexibility?: import("./eligibilityParsing").IncomeFlexibility;
  minCreditScore?: number | null;
  creditFlexibility?: import("./eligibilityParsing").CreditFlexibility;
  cosignerAllowed?: boolean;
  guarantorAllowed?: boolean;
  extraDepositAllowed?: boolean;

  keywords?: string[];
  primeCandidateScore?: number;

  // Legacy fields for backward compatibility
  landlordType?: "independent" | "corporate";
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Modern Studio in Koreatown',
    neighborhood: 'Koreatown',
    city: 'Los Angeles',
    rent: 1800,
    beds: 0,
    baths: 1,
    source: 'manual',
    incomeMultiplier: 3,
    minCreditScore: 600,
    cosignerAllowed: true,
    landlordType: 'independent',
  },
  {
    id: '2',
    title: 'Spacious 2BR Near UCLA',
    neighborhood: 'Westside',
    city: 'Los Angeles',
    rent: 3200,
    beds: 2,
    baths: 2,
    source: 'manual',
    incomeMultiplier: 3.5,
    minCreditScore: 700,
    cosignerAllowed: false,
    landlordType: 'corporate',
  },
  {
    id: '3',
    title: 'Cozy 1BR in Hollywood',
    neighborhood: 'Hollywood',
    city: 'Los Angeles',
    rent: 2200,
    beds: 1,
    baths: 1,
    source: 'manual',
    incomeMultiplier: 2.5,
    minCreditScore: 650,
    cosignerAllowed: true,
    landlordType: 'independent',
  },
  {
    id: '4',
    title: 'Luxury 3BR in Beverly Hills',
    neighborhood: 'Beverly Hills',
    city: 'Los Angeles',
    rent: 5500,
    beds: 3,
    baths: 2.5,
    source: 'manual',
    incomeMultiplier: 3.5,
    minCreditScore: 750,
    cosignerAllowed: false,
    landlordType: 'corporate',
  },
  {
    id: '5',
    title: 'Affordable 1BR in Valley',
    neighborhood: 'San Fernando Valley',
    city: 'Los Angeles',
    rent: 1900,
    beds: 1,
    baths: 1,
    source: 'manual',
    incomeMultiplier: 2.5,
    minCreditScore: null,
    cosignerAllowed: true,
    landlordType: 'independent',
  },
  {
    id: '6',
    title: 'Updated 2BR in Mid-Wilshire',
    neighborhood: 'Mid-Wilshire',
    city: 'Los Angeles',
    rent: 2800,
    beds: 2,
    baths: 1.5,
    source: 'manual',
    incomeMultiplier: 3,
    minCreditScore: 680,
    cosignerAllowed: true,
    landlordType: 'corporate',
  },
  {
    id: '7',
    title: 'Charming Studio in Silver Lake',
    neighborhood: 'Silver Lake',
    city: 'Los Angeles',
    rent: 2100,
    beds: 0,
    baths: 1,
    source: 'manual',
    incomeMultiplier: 3,
    minCreditScore: 650,
    cosignerAllowed: true,
    landlordType: 'independent',
  },
  {
    id: '8',
    title: 'Family-Friendly 3BR in Pasadena',
    neighborhood: 'Pasadena',
    city: 'Los Angeles',
    rent: 3800,
    beds: 3,
    baths: 2,
    source: 'manual',
    incomeMultiplier: 3,
    minCreditScore: 700,
    cosignerAllowed: false,
    landlordType: 'corporate',
  },
  {
    id: '9',
    title: 'Budget Studio in Downtown LA',
    neighborhood: 'Downtown LA',
    city: 'Los Angeles',
    rent: 1600,
    beds: 0,
    baths: 1,
    source: 'manual',
    incomeMultiplier: 2.5,
    minCreditScore: null,
    cosignerAllowed: true,
    landlordType: 'independent',
  },
  {
    id: '10',
    title: 'Modern 2BR in Santa Monica',
    neighborhood: 'Santa Monica',
    city: 'Los Angeles',
    rent: 4200,
    beds: 2,
    baths: 2,
    source: 'manual',
    incomeMultiplier: 3.5,
    minCreditScore: 720,
    cosignerAllowed: false,
    landlordType: 'corporate',
  },
];

// This will be populated with a mixture of seed data and future in-memory additions.
export let listings: Listing[] = [];

// Helper to replace the current listings array (used by seed loader).
export function setListings(newListings: Listing[]) {
  listings = newListings;
}

// Initialize listings with MOCK_LISTINGS if no seed data
if (listings.length === 0) {
  listings = [...MOCK_LISTINGS];
}

export function getAllListings(): Listing[] {
  return listings.length > 0 ? listings : MOCK_LISTINGS;
}

export function getListingById(id: string): Listing | undefined {
  const allListings = listings.length > 0 ? listings : MOCK_LISTINGS;
  return allListings.find(listing => listing.id === id);
}
