'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Listing } from '@/lib/listings';
import { HiHeart, HiHome, HiOutlineHeart } from 'react-icons/hi';
import { FaBed, FaBath } from 'react-icons/fa';
import { getSavedListingIds, saveListingId, removeListingId } from '@/lib/saved-listings';

interface ListingWithScore {
  listing: Listing;
  score: number;
}

export default function SearchPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [creditBand, setCreditBand] = useState('');
  const [hasCosigner, setHasCosigner] = useState(false);
  const [maxRent, setMaxRent] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [minRent, setMinRent] = useState('');
  const [results, setResults] = useState<ListingWithScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());

  // Track if we've loaded profile to prevent multiple auto-searches
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Extract search function to be reusable
  const performSearch = async (searchData: {
    monthlyIncome: number;
    creditBand: string;
    hasCosigner: boolean;
    maxRent: number;
    neighborhood?: string;
    zipCode?: string;
    beds?: string;
    baths?: string;
    minRent?: string;
  }) => {
    setLoading(true);
    setSearched(true);

    try {
      // Save profile data if user is authenticated
      if (status === 'authenticated' && session?.user?.id) {
        try {
          await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              monthlyIncome: searchData.monthlyIncome,
              creditBand: searchData.creditBand,
              hasCosigner: searchData.hasCosigner,
              maxRent: searchData.maxRent,
            }),
          });
        } catch (error) {
          console.error('Failed to save profile:', error);
          // Continue with search even if profile save fails
        }
      }

      // Perform search
      const response = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: searchData.monthlyIncome,
          creditBand: searchData.creditBand,
          hasCosigner: searchData.hasCosigner,
          maxRent: searchData.maxRent,
          neighborhood: searchData.neighborhood || undefined,
          zipCode: searchData.zipCode || undefined,
          beds: searchData.beds || undefined,
          baths: searchData.baths || undefined,
          minRent: searchData.minRent || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search listings');
      }

      const data = await response.json();
      // API returns array of { listing, score }
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to search listings:', error);
      alert('Failed to search listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load user profile data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (status === 'authenticated' && session?.user?.id && !profileLoaded) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const profile = await response.json();
            // Prefill form with saved profile data
            if (profile.monthlyIncome) {
              setMonthlyIncome(profile.monthlyIncome.toString());
            }
            if (profile.creditBand) {
              setCreditBand(profile.creditBand);
            }
            if (profile.hasCosigner !== undefined && profile.hasCosigner !== null) {
              setHasCosigner(profile.hasCosigner);
            }
            if (profile.maxRent) {
              setMaxRent(profile.maxRent.toString());
            }
            
            setProfileLoaded(true);
            
            // Auto-search if profile has all required fields and we haven't searched yet
            if (profile.monthlyIncome && profile.creditBand && profile.maxRent && !searched) {
              // Use query param maxRent if provided, otherwise use profile maxRent
              const maxRentToUse = searchParams.get('maxRent') || profile.maxRent.toString();
              setMaxRent(maxRentToUse);
              
              // Trigger auto-search after a brief delay to ensure state is set
              setTimeout(() => {
                performSearch({
                  monthlyIncome: profile.monthlyIncome,
                  creditBand: profile.creditBand,
                  hasCosigner: profile.hasCosigner || false,
                  maxRent: Number(maxRentToUse),
                  neighborhood: searchParams.get('neighborhood') || '',
                  zipCode: searchParams.get('zipCode') || '',
                  beds: searchParams.get('beds') || '',
                  baths: searchParams.get('baths') || '',
                  minRent: searchParams.get('minRent') || '',
                });
              }, 200);
            }
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
          setProfileLoaded(true); // Set to true even on error to prevent retries
        }
      }
    };

    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  // Prefill from query parameters (overrides profile data)
  useEffect(() => {
    const maxRentParam = searchParams.get('maxRent');
    if (maxRentParam) setMaxRent(maxRentParam);
    
    const neighborhoodParam = searchParams.get('neighborhood');
    if (neighborhoodParam) setNeighborhood(neighborhoodParam);
    
    const zipCodeParam = searchParams.get('zipCode');
    if (zipCodeParam) setZipCode(zipCodeParam);
    
    const bedsParam = searchParams.get('beds');
    if (bedsParam) setBeds(bedsParam);
    
    const bathsParam = searchParams.get('baths');
    if (bathsParam) setBaths(bathsParam);
    
    const minRentParam = searchParams.get('minRent');
    if (minRentParam) setMinRent(minRentParam);
  }, [searchParams]);

  // Load saved listings on mount
  useEffect(() => {
    const saved = getSavedListingIds();
    setSavedListingIds(new Set(saved));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!monthlyIncome || !creditBand || !maxRent) {
      alert('Please fill in all required fields');
      return;
    }

    await performSearch({
      monthlyIncome: Number(monthlyIncome),
      creditBand,
      hasCosigner,
      maxRent: Number(maxRent),
      neighborhood,
      zipCode,
      beds,
      baths,
      minRent,
    });
  };

  // Helper function to format listing title
  const getListingTitle = (listing: Listing): string => {
    if (listing.neighborhood) {
      return `${listing.neighborhood} • ${listing.title}`;
    }
    return listing.title;
  };

  const toggleSave = (listingId: string) => {
    if (savedListingIds.has(listingId)) {
      removeListingId(listingId);
      setSavedListingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    } else {
      saveListingId(listingId);
      setSavedListingIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(listingId);
        return newSet;
      });
    }
  };

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              You need an account to check your approval chances.
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in or create an account to search for rentals and see your eligibility scores.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign in or create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show full form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Check your approval chances in Los Angeles
        </h1>

        {/* Large Central Search Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Find Your Dream Rental
          </h1>
          <p className="text-blue-100 text-center mb-8 text-lg">
            Search by income, credit score, and location
          </p>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg">
            {/* Financial Profile Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Profile</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly household income ($) *
                  </label>
                  <input
                    id="monthlyIncome"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 6250"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="creditBand" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated credit score band *
                  </label>
                  <select
                    id="creditBand"
                    value={creditBand}
                    onChange={(e) => setCreditBand(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a band</option>
                    <option value="<580">&lt;580</option>
                    <option value="580–649">580–649</option>
                    <option value="650–699">650–699</option>
                    <option value="700–749">700–749</option>
                    <option value="750+">750+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hasCosigner" className="block text-sm font-medium text-gray-700 mb-2">
                    Have a co-signer? *
                  </label>
                  <select
                    id="hasCosigner"
                    value={hasCosigner ? 'yes' : 'no'}
                    onChange={(e) => setHasCosigner(e.target.value === 'yes')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="maxRent" className="block text-sm font-medium text-gray-700 mb-2">
                    Desired max rent ($/month) *
                  </label>
                  <input
                    id="maxRent"
                    type="number"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Property Filters Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Filters (Optional)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                    Neighborhood
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Downtown"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 90001"
                  />
                </div>

                <div>
                  <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    id="beds"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="0">Studio</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    id="baths"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Bathroom</option>
                    <option value="1.5">1.5 Bathrooms</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="2.5">2.5 Bathrooms</option>
                    <option value="3">3+ Bathrooms</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="minRent" className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rent ($/month)
                  </label>
                  <input
                    id="minRent"
                    type="number"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1500"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? 'Searching...' : 'Search Rentals'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {results.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Featured Listings ({results.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map(({ listing, score }) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden card-hover group relative block"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                        {listing.primaryImageUrl || (listing.imageUrls && listing.imageUrls.length > 0) ? (
                          <img
                            src={listing.primaryImageUrl || (listing.imageUrls?.[0] ?? '')}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide image and show placeholder on error
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {/* Placeholder - shown when no image or image fails */}
                        {(!listing.primaryImageUrl && (!listing.imageUrls || listing.imageUrls.length === 0)) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <HiHome className="h-16 w-16 text-white opacity-50" />
                          </div>
                        )}
                        {/* Hot Price Tag */}
                        {score >= 70 && (
                          <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            Hot Price
                          </div>
                        )}
                        {/* Save Button - appears on hover */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSave(listing.id);
                          }}
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          aria-label="Save listing"
                        >
                          {savedListingIds.has(listing.id) ? (
                            <HiHeart className="h-5 w-5 text-red-500" />
                          ) : (
                            <HiOutlineHeart className="h-5 w-5 text-gray-700" />
                          )}
                        </button>
                        {/* Approval Score Badge */}
                        <div className="absolute bottom-3 right-3">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                              score >= 70
                                ? 'bg-green-500'
                                : score >= 50
                                ? 'bg-orange-500'
                                : 'bg-gray-500'
                            }`}
                          >
                            {score}% Match
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                          {listing.title}
                        </h3>
                        {listing.neighborhood && (
                          <p className="text-gray-600 text-sm mb-3">
                            {listing.neighborhood}
                          </p>
                        )}

                        {/* Price */}
                        <div className="text-2xl font-bold text-gray-900 mb-4">
                          ${listing.rent.toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">/mo</span>
                        </div>

                        {/* Property Details with Icons */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaBed className="h-4 w-4" />
                            <span className="font-medium">{listing.beds}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaBath className="h-4 w-4" />
                            <span className="font-medium">{listing.baths}</span>
                          </div>
                        </div>

                        {/* Key Rules */}
                        <div className="space-y-2 mb-4 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold">Income:</span> {listing.incomeMultiplier ? `${listing.incomeMultiplier}x rent` : 'Not specified'}
                          </div>
                          <div>
                            <span className="font-semibold">Credit:</span> {listing.minCreditScore ? `${listing.minCreditScore}+` : 'No minimum'}
                          </div>
                          <div>
                            <span className="font-semibold">Co-signer:</span> {listing.cosignerAllowed ? 'Allowed' : 'Not allowed'}
                          </div>
                        </div>

                        {/* View Details Button */}
                        <div className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          View Details
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg text-gray-600 mb-2">
                  We couldn&apos;t find good matches based on your info.
                </p>
                <p className="text-gray-500">
                  Try adjusting your max rent or including a co-signer.
                </p>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center py-12 text-gray-500">
            Fill out the form above to see rentals you qualify for.
          </div>
        )}
      </div>
    </div>
  );
}

