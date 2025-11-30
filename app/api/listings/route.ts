import { NextRequest, NextResponse } from 'next/server';
import { Listing } from '@/lib/listings';
import { getAllListings, addListing } from '@/lib/listings-store';

export async function GET() {
  try {
    const listings = getAllListings();
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'neighborhood', 'rent', 'beds', 'baths', 'incomeMultiplier', 'cosignerAllowed', 'landlordType'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate types
    if (typeof body.rent !== 'number' || body.rent <= 0) {
      return NextResponse.json(
        { error: 'Rent must be a positive number' },
        { status: 400 }
      );
    }

    if (typeof body.beds !== 'number' || body.beds < 0) {
      return NextResponse.json(
        { error: 'Beds must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof body.baths !== 'number' || body.baths <= 0) {
      return NextResponse.json(
        { error: 'Baths must be a positive number' },
        { status: 400 }
      );
    }

    if (![2.5, 3, 3.5].includes(body.incomeMultiplier)) {
      return NextResponse.json(
        { error: 'Income multiplier must be 2.5, 3, or 3.5' },
        { status: 400 }
      );
    }

    if (body.minCreditScore !== null && (typeof body.minCreditScore !== 'number' || body.minCreditScore < 300 || body.minCreditScore > 850)) {
      return NextResponse.json(
        { error: 'Minimum credit score must be null or a number between 300 and 850' },
        { status: 400 }
      );
    }

    if (typeof body.cosignerAllowed !== 'boolean') {
      return NextResponse.json(
        { error: 'Cosigner allowed must be a boolean' },
        { status: 400 }
      );
    }

    if (!['independent', 'corporate'].includes(body.landlordType)) {
      return NextResponse.json(
        { error: 'Landlord type must be "independent" or "corporate"' },
        { status: 400 }
      );
    }

    // Generate unique ID using Date.now().toString()
    const id = Date.now().toString();

    // Create new listing
    const newListing: Listing = {
      id,
      title: String(body.title),
      neighborhood: body.neighborhood ? String(body.neighborhood) : undefined,
      city: body.city || 'Los Angeles',
      rent: Number(body.rent),
      beds: Number(body.beds),
      baths: Number(body.baths),
      source: 'manual',
      incomeMultiplier: body.incomeMultiplier ? Number(body.incomeMultiplier) : undefined,
      minCreditScore: body.minCreditScore === null || body.minCreditScore === undefined ? null : Number(body.minCreditScore),
      cosignerAllowed: body.cosignerAllowed !== undefined ? Boolean(body.cosignerAllowed) : undefined,
      landlordType: body.landlordType as 'independent' | 'corporate' | undefined,
    };

    // Add to in-memory store
    addListing(newListing);

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
