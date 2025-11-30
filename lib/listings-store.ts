import { Listing, setListings as setListingsFromLib, MOCK_LISTINGS } from './listings';

// Try to import seed data, fallback to empty array if not available
let CRAIGSLIST_LA_SEED: Listing[] = [];
try {
  const seedModule = require('../data/craigslist_la_seed');
  CRAIGSLIST_LA_SEED = seedModule.CRAIGSLIST_LA_SEED || [];
} catch (e) {
  // Seed file doesn't exist yet or has errors, use empty array
  console.log('No Craigslist seed data found, using mock listings');
}

// Initialize with seed data, fallback to mock listings
const initialListings = CRAIGSLIST_LA_SEED.length > 0 ? CRAIGSLIST_LA_SEED : MOCK_LISTINGS;

// Mutable in-memory array initialized with seed data
export let listings: Listing[] = [...initialListings];

// Sync with lib/listings.ts
setListingsFromLib([...listings]);

/**
 * Get all listings from the in-memory store
 */
export function getAllListings(): Listing[] {
  return listings;
}

/**
 * Get a listing by ID from the in-memory store
 */
export function getListingById(id: string): Listing | undefined {
  return listings.find(listing => listing.id === id);
}

/**
 * Add a new listing to the in-memory store
 */
export function addListing(listing: Listing): void {
  listings.push(listing);
  // Sync with lib/listings.ts
  setListingsFromLib([...listings]);
}

/**
 * Replace all listings (used when loading seed data)
 */
export function setListings(newListings: Listing[]): void {
  listings = newListings;
  setListingsFromLib([...listings]);
}

