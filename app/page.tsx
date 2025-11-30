'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { HiHome, HiOutlineHeart, HiHeart, HiCheckCircle } from 'react-icons/hi';
import { FaBed, FaBath, FaSearch, FaUserPlus, FaChartLine } from 'react-icons/fa';
import { getAllListings } from '@/lib/listings-store';
import { Listing } from '@/lib/listings';
import { getSavedListingIds, saveListingId, removeListingId } from '@/lib/saved-listings';
import HowItWorks from '@/components/HowItWorks';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  
  // Search form state
  const [neighborhood, setNeighborhood] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  
  // Get featured listings (first 6)
  const featuredListings = getAllListings().slice(0, 6);

  // Load saved listings on mount
  useEffect(() => {
    const saved = getSavedListingIds();
    setSavedListingIds(new Set(saved));
  }, []);

  const handleRenterSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (neighborhood) params.set('neighborhood', neighborhood);
    if (zipCode) params.set('zipCode', zipCode);
    if (beds) params.set('beds', beds);
    if (baths) params.set('baths', baths);
    if (minRent) params.set('minRent', minRent);
    if (maxRent) params.set('maxRent', maxRent);
    
    router.push(`/search?${params.toString()}`);
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Value Proposition */}
      <section className="bg-gradient-to-br from-[#2A6AFF] via-blue-600 to-blue-700 py-20 md:py-32 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Find Rentals You&apos;ll Actually Get Approved For
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
            Stop wasting time and money on applications you won&apos;t qualify for.
          </p>
          <p className="text-lg md:text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
            RentIQ matches you with rentals based on your income, credit score, and co-signer options—before you apply.
          </p>
          
          {/* Key Value Props */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <HiCheckCircle className="h-8 w-8 text-[#42F7C8] mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Pre-Approval Matching</h3>
              <p className="text-blue-100 text-sm">See only rentals you qualify for</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <HiCheckCircle className="h-8 w-8 text-[#42F7C8] mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">No Hard Credit Checks</h3>
              <p className="text-blue-100 text-sm">Search without impacting your credit</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <HiCheckCircle className="h-8 w-8 text-[#42F7C8] mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Save Time & Money</h3>
              <p className="text-blue-100 text-sm">Skip applications you won&apos;t get</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Renters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Renters</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create your profile and search rentals that match your financial profile
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Create Profile Card */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-purple-600 rounded-xl">
                  <FaUserPlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Create Your Profile</h3>
                  <p className="text-gray-600">Set up your financial profile once</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Tell us your income, credit score range, and preferences. We&apos;ll save this information so you never have to fill it out again.
              </p>
              <ul className="space-y-2 mb-6 text-gray-700">
                <li className="flex items-center gap-2">
                  <HiCheckCircle className="h-5 w-5 text-green-600" />
                  <span>Save your search preferences</span>
                </li>
                <li className="flex items-center gap-2">
                  <HiCheckCircle className="h-5 w-5 text-green-600" />
                  <span>Get personalized recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <HiCheckCircle className="h-5 w-5 text-green-600" />
                  <span>Track your saved listings</span>
                </li>
              </ul>
              {status === 'authenticated' ? (
                <Link
                  href="/profile"
                  className="block w-full bg-purple-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  View My Profile
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="block w-full bg-purple-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Create Profile
                </Link>
              )}
            </div>

            {/* Search Listings Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-[#2A6AFF] rounded-xl">
                  <FaSearch className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Search Listings</h3>
                  <p className="text-gray-600">Find your perfect rental</p>
                </div>
              </div>

              <form onSubmit={handleRenterSearch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                      Neighborhood
                    </label>
                    <input
                      id="neighborhood"
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                      placeholder="e.g., 90001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      id="beds"
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                    >
                      <option value="">Any</option>
                      <option value="1">1 Bathroom</option>
                      <option value="1.5">1.5 Bathrooms</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="2.5">2.5 Bathrooms</option>
                      <option value="3">3+ Bathrooms</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minRent" className="block text-sm font-medium text-gray-700 mb-2">
                      Min Rent ($/mo)
                    </label>
                    <input
                      id="minRent"
                      type="number"
                      value={minRent}
                      onChange={(e) => setMinRent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                      placeholder="e.g., 1500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxRent" className="block text-sm font-medium text-gray-700 mb-2">
                      Max Rent ($/mo)
                    </label>
                    <input
                      id="maxRent"
                      type="number"
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                      placeholder="e.g., 3000"
                      min="0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2A6AFF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e5ae6] transition-colors shadow-md"
                >
                  Search Rentals
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* For Landlords Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Landlords</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              List your property and connect with pre-qualified renters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaChartLine className="h-8 w-8 text-[#2A6AFF]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-Qualified Leads</h3>
              <p className="text-gray-600">
                Get applications from renters who already know they qualify for your property
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <HiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reduce Application Waste</h3>
              <p className="text-gray-600">
                Save time by only reviewing applications from qualified candidates
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaUserPlus className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Listing Management</h3>
              <p className="text-gray-600">
                Post your property in minutes and manage applications all in one place
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/landlords"
              className="inline-block bg-[#2A6AFF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1e5ae6] transition-colors shadow-md hover:shadow-lg"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Featured Listings
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Discover rentals you qualify for in Los Angeles
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing: Listing) => (
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
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!listing.primaryImageUrl && (!listing.imageUrls || listing.imageUrls.length === 0)) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HiHome className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
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

                  <div className="text-2xl font-bold text-gray-900 mb-4">
                    ${listing.rent.toLocaleString()}
                    <span className="text-sm font-normal text-gray-600">/mo</span>
                  </div>

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

                  <div className="block w-full bg-[#2A6AFF] text-white text-center py-2.5 rounded-lg font-semibold hover:bg-[#1e5ae6] transition-colors">
                    View Details
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/search"
              className="inline-block bg-[#2A6AFF] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e5ae6] transition-colors shadow-md hover:shadow-lg"
            >
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* How it works Section - Bento Grid */}
      <HowItWorks />

      {/* CTA Section */}
      <section className="py-16 bg-[#2A6AFF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your perfect rental?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start searching today and see your approval chances
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="bg-white text-[#2A6AFF] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Searching
            </Link>
            <Link
              href="/landlords"
              className="bg-[#1e5ae6] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1a4fd1] transition-colors shadow-lg border-2 border-white"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
