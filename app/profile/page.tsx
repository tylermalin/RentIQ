'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiHeart, HiOutlineHeart, HiHome, HiUser, HiMail, HiPhone, HiMapPin } from 'react-icons/hi';
import { FaBed, FaBath } from 'react-icons/fa';
import { getAllListings, getListingById } from '@/lib/listings-store';
import { getSavedListingIds, removeListingId } from '@/lib/saved-listings';
import { Listing } from '@/lib/listings';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [creditBand, setCreditBand] = useState('');
  const [hasCosigner, setHasCosigner] = useState(false);
  const [maxRent, setMaxRent] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'authenticated') {
      // Load user profile
      const loadProfile = async () => {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
            setName(data.name || '');
            setMonthlyIncome(data.monthlyIncome?.toString() || '');
            setCreditBand(data.creditBand || '');
            setHasCosigner(data.hasCosigner || false);
            setMaxRent(data.maxRent?.toString() || '');
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      };

      loadProfile();

      // Load saved listings
      const savedIds = getSavedListingIds();
      setSavedListingIds(savedIds);
      
      // Get full listing objects
      const allListings = getAllListings();
      const saved = savedIds
        .map((id) => getListingById(id))
        .filter((listing): listing is Listing => listing !== undefined);
      setSavedListings(saved);
    }
  }, [status, router]);

  const handleRemoveSaved = (listingId: string) => {
    removeListingId(listingId);
    setSavedListingIds((prev) => prev.filter((id) => id !== listingId));
    setSavedListings((prev) => prev.filter((listing) => listing.id !== listingId));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Prepare the request body, converting empty strings to null
      const requestBody: any = {};
      
      if (name !== undefined) {
        requestBody.name = name && name.trim() ? name.trim() : null;
      }
      
      if (monthlyIncome !== undefined) {
        const incomeValue = typeof monthlyIncome === 'string' ? monthlyIncome.trim() : String(monthlyIncome || '').trim();
        requestBody.monthlyIncome = incomeValue && !isNaN(Number(incomeValue)) && Number(incomeValue) > 0
          ? Number(incomeValue)
          : null;
      }
      
      if (creditBand !== undefined) {
        requestBody.creditBand = creditBand && typeof creditBand === 'string' && creditBand.trim() ? creditBand.trim() : null;
      }
      
      if (hasCosigner !== undefined) {
        requestBody.hasCosigner = Boolean(hasCosigner);
      }
      
      if (maxRent !== undefined) {
        const rentValue = typeof maxRent === 'string' ? maxRent.trim() : String(maxRent || '').trim();
        requestBody.maxRent = rentValue && !isNaN(Number(rentValue)) && Number(rentValue) > 0
          ? Number(rentValue)
          : null;
      }

      console.log('Saving profile with data:', requestBody);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setIsEditing(false);
      } else {
        let errorMessage = 'Failed to save profile. Please try again.';
        try {
          const errorData = await response.json();
          console.error('Failed to save profile - API error:', errorData);
          errorMessage = errorData.error || errorData.details || errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          errorMessage = `Failed to save profile (${response.status} ${response.statusText}). Please try again.`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Failed to save profile - Network/Request error:', error);
      const errorMessage = error instanceof Error 
        ? `Failed to save profile: ${error.message}` 
        : 'Failed to save profile. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  const user = session?.user;
  const hasName = !!user?.name;
  const hasEmail = !!user?.email;
  const missingFields = [];
  if (!hasName) missingFields.push('Full Name');
  if (!hasEmail) missingFields.push('Email');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-[#2A6AFF] hover:text-[#1e5ae6] font-medium text-sm"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="text-[#2A6AFF] hover:text-[#1e5ae6] font-medium text-sm disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900">{name || <span className="text-gray-400 italic">Not set</span>}</p>
                      {!name && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-sm text-[#2A6AFF] hover:text-[#1e5ae6] font-medium"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{user?.email || <span className="text-gray-400 italic">Not set</span>}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Search Preferences */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Search Preferences</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-[#2A6AFF] hover:text-[#1e5ae6] font-medium"
                      >
                        {profile?.monthlyIncome || profile?.creditBand || profile?.maxRent ? 'Edit' : 'Add Preferences'}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income ($)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                          placeholder="e.g., 8500"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900">
                            {profile?.monthlyIncome ? `$${profile.monthlyIncome.toLocaleString()}` : <span className="text-gray-400 italic">Not set</span>}
                          </p>
                          {!profile?.monthlyIncome && (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-sm text-[#2A6AFF] hover:text-[#1e5ae6] font-medium"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Score Band
                      </label>
                      {isEditing ? (
                        <select
                          value={creditBand}
                          onChange={(e) => setCreditBand(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                        >
                          <option value="">Select a band</option>
                          <option value="<580">&lt;580</option>
                          <option value="580–649">580–649</option>
                          <option value="650–699">650–699</option>
                          <option value="700–749">700–749</option>
                          <option value="750+">750+</option>
                        </select>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900">
                            {profile?.creditBand || <span className="text-gray-400 italic">Not set</span>}
                          </p>
                          {!profile?.creditBand && (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-sm text-[#2A6AFF] hover:text-[#1e5ae6] font-medium"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Have a Co-signer?
                      </label>
                      {isEditing ? (
                        <select
                          value={hasCosigner ? 'yes' : 'no'}
                          onChange={(e) => setHasCosigner(e.target.value === 'yes')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profile?.hasCosigner ? 'Yes' : 'No'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Rent ($/month)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={maxRent}
                          onChange={(e) => setMaxRent(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#2A6AFF] focus:border-[#2A6AFF]"
                          placeholder="e.g., 3000"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900">
                            {profile?.maxRent ? `$${profile.maxRent.toLocaleString()}` : <span className="text-gray-400 italic">Not set</span>}
                          </p>
                          {!profile?.maxRent && (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-sm text-[#2A6AFF] hover:text-[#1e5ae6] font-medium"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(!profile?.monthlyIncome || !profile?.creditBand || !profile?.maxRent) && !isEditing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Complete your search preferences:</strong> Add your monthly income, credit score, and max rent to get personalized rental recommendations.
                    </p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-blue-900 font-semibold hover:underline"
                    >
                      Add Preferences →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Listings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Saved Listings ({savedListings.length})
              </h2>

              {savedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group relative block"
                    >
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveSaved(listing.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Remove from saved"
                      >
                        <HiOutlineHeart className="h-5 w-5 text-red-500 fill-red-500" />
                      </button>

                      {/* Listing Image */}
                      <div className="relative h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-3 overflow-hidden">
                        {listing.primaryImageUrl || (listing.imageUrls && listing.imageUrls.length > 0) ? (
                          <img
                            src={listing.primaryImageUrl || listing.imageUrls[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <HiHome className="h-12 w-12 text-white opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Listing Info */}
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {listing.title}
                      </h3>
                      {listing.neighborhood && (
                        <p className="text-sm text-gray-600 mb-2">{listing.neighborhood}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                          ${listing.rent.toLocaleString()}/mo
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaBed className="h-3 w-3" />
                            <span>{listing.beds}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaBath className="h-3 w-3" />
                            <span>{listing.baths}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiHeart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No saved listings yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Save listings you&apos;re interested in by clicking the heart icon
                  </p>
                  <Link
                    href="/search"
                    className="inline-block bg-[#2A6AFF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1e5ae6] transition-colors"
                  >
                    Browse Listings
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Premium Upsell */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white sticky top-8">
              <div className="mb-4">
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  UPGRADE TO PREMIUM
                </div>
                <h3 className="text-2xl font-bold mb-2">RentIQ Plus</h3>
                <p className="text-purple-100 text-sm">
                  Unlock premium features and get more rental opportunities
                </p>
              </div>

              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  <span>Unlimited saved listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  <span>Priority application support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  <span>Printable pre-approval letters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  <span>Advanced search filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  <span>Email alerts for new matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  <span>Dedicated support line</span>
                </li>
              </ul>

              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">$9.99</div>
                <div className="text-purple-100 text-sm">per month</div>
              </div>

              <button className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
                Upgrade Now
              </button>

              <p className="text-xs text-purple-200 mt-4 text-center">
                Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

