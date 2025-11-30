import { NextRequest, NextResponse } from 'next/server';
import { getAllListings } from '@/lib/listings-store';
import { filterEligibleListings } from '@/lib/eligibility';

/**
 * Convert credit score band to approximate numeric score (midpoint of the band)
 */
function getCreditScoreFromBand(band: string): number {
  const bandMap: Record<string, number> = {
    '<580': 550, // midpoint of 300-580 range
    '580–649': 615, // midpoint of 580-649 range
    '650–699': 675, // midpoint of 650-699 range
    '700–749': 725, // midpoint of 700-749 range
    '750+': 775, // representative score for 750+ range
  };
  return bandMap[band] || 650;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.monthlyIncome || !body.creditBand || body.hasCosigner === undefined || !body.maxRent) {
      return NextResponse.json(
        { error: 'Missing required fields: monthlyIncome, creditBand, hasCosigner, and maxRent are required' },
        { status: 400 }
      );
    }

    const monthlyIncome = Number(body.monthlyIncome);
    const creditBand = String(body.creditBand);
    const hasCosigner = Boolean(body.hasCosigner);
    const maxRent = Number(body.maxRent);

    // Convert credit band to numeric score
    const estimatedCreditScore = getCreditScoreFromBand(creditBand);

    // Get all listings from the mutable in-memory store (includes newly added listings)
    let listings = getAllListings();

    // Apply property filters if provided
    if (body.neighborhood) {
      const neighborhoodLower = String(body.neighborhood).toLowerCase();
      listings = listings.filter((listing) =>
        listing.neighborhood?.toLowerCase().includes(neighborhoodLower) ||
        listing.city?.toLowerCase().includes(neighborhoodLower)
      );
    }

    if (body.zipCode) {
      // Note: We don't have zipCode field yet, but can filter by address if it contains zip
      const zipCodeStr = String(body.zipCode);
      listings = listings.filter((listing) =>
        listing.address?.includes(zipCodeStr) ||
        listing.neighborhood?.includes(zipCodeStr)
      );
    }

    if (body.beds !== undefined && body.beds !== null && body.beds !== '') {
      const bedsNum = Number(body.beds);
      listings = listings.filter((listing) => listing.beds >= bedsNum);
    }

    if (body.baths !== undefined && body.baths !== null && body.baths !== '') {
      const bathsNum = Number(body.baths);
      listings = listings.filter((listing) => listing.baths >= bathsNum);
    }

    if (body.minRent) {
      const minRentNum = Number(body.minRent);
      listings = listings.filter((listing) => listing.rent >= minRentNum);
    }

    // Use filterEligibleListings to compute scores
    const results = filterEligibleListings(listings, {
      monthlyIncome,
      estimatedCreditScore,
      hasCosigner,
      maxRent,
    });

    // Return array of { listing, score } sorted descending by score
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in eligibility API:', error);
    return NextResponse.json(
      { error: 'Failed to calculate eligibility' },
      { status: 500 }
    );
  }
}
