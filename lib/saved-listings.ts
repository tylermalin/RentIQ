/**
 * Utility functions for managing saved listings in localStorage
 * In the future, this should be moved to a database
 */

const SAVED_LISTINGS_KEY = 'rentiq_saved_listings';

export function getSavedListingIds(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SAVED_LISTINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved listings:', error);
    return [];
  }
}

export function saveListingId(listingId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const saved = getSavedListingIds();
    if (!saved.includes(listingId)) {
      saved.push(listingId);
      localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(saved));
    }
  } catch (error) {
    console.error('Error saving listing:', error);
  }
}

export function removeListingId(listingId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const saved = getSavedListingIds();
    const filtered = saved.filter((id) => id !== listingId);
    localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing listing:', error);
  }
}

export function isListingSaved(listingId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const saved = getSavedListingIds();
  return saved.includes(listingId);
}

