'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllListings } from '@/lib/listings-store';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { computeApprovalScore } from '@/lib/eligibility';
import type { Listing } from '@/lib/listings';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ListingDetailPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [approvalScore, setApprovalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const listings = getAllListings();
  const listing = listings.find(l => l.id === params.id);

  if (!listing) {
    notFound();
  }

  const incomeMultiplier = listing.incomeMultiplier ?? 3;
  const requiredMonthlyIncome = incomeMultiplier * listing.rent;

  // Combine all images into a single array for the slideshow
  const allImages = [
    ...(listing.primaryImageUrl ? [listing.primaryImageUrl] : []),
    ...(listing.imageUrls || []).filter(url => url !== listing.primaryImageUrl)
  ];

  // Convert credit band to numeric score
  const getCreditScoreFromBand = (band: string): number => {
    const bandMap: Record<string, number> = {
      '<580': 550,
      '580–649': 615,
      '650–699': 675,
      '700–749': 725,
      '750+': 775,
    };
    return bandMap[band] || 650;
  };

  // Load user profile and calculate score
  useEffect(() => {
    const loadProfileAndCalculate = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);

            // Calculate approval score if profile has required data
            if (profile.monthlyIncome && profile.creditBand && profile.maxRent !== null && profile.maxRent !== undefined) {
              const creditScore = getCreditScoreFromBand(profile.creditBand);
              const score = computeApprovalScore(
                listing,
                profile.monthlyIncome,
                creditScore,
                profile.hasCosigner || false,
                profile.maxRent
              );
              setApprovalScore(score);
            }
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
      setLoading(false);
    };

    loadProfileAndCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
      } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight' && currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, currentImageIndex, allImages.length]);

  // Format description with bold key terms and line breaks
  const formatDescription = (description: string): JSX.Element => {
    // List of key terms to bold (case-insensitive)
    const keyTerms = [
      'Bedrooms?:',
      'Bathrooms?:',
      'Date Available:',
      'Address:',
      'Amenities?:',
      'Amenities Include:',
      'Pets?:',
      'Pet Friendly',
      'Parking:',
      'Utilities:',
      'Lease Terms?:',
      'Application Fee:',
      'Security Deposit:',
      'Move-in Special:',
      'Contact:',
      'Call:',
      'Phone:',
      'Email:',
      'Website:',
      'For more information:',
      'Pricing and availability:',
      'Residents:',
    ];

    // Build regex pattern to match key terms
    const escapedTerms = keyTerms.map(term => term.replace(/[?]/g, '\\?')).join('|');
    const pattern = new RegExp(`(${escapedTerms})`, 'gi');

    // Process the description
    const elements: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    const matches: Array<{ index: number; term: string }> = [];

    // Find all matches
    while ((match = pattern.exec(description)) !== null) {
      matches.push({ index: match.index, term: match[0] });
    }

    // Process each match
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      // Add text before this match
      if (currentMatch.index > lastIndex) {
        const textBefore = description.substring(lastIndex, currentMatch.index).trim();
        if (textBefore) {
          elements.push(
            <p key={`text-${i}`} className="text-gray-700 mb-2">{textBefore}</p>
          );
        }
      }

      // Get the value (text after the key term until next key term or end)
      const valueStart = currentMatch.index + currentMatch.term.length;
      let valueEnd = nextMatch ? nextMatch.index : description.length;
      let value = description.substring(valueStart, valueEnd);

      // Handle cases where value runs into next key term (e.g., "Bedrooms: 2Bathrooms:")
      // The value might contain the start of the next key term if there's no space
      if (nextMatch && value.length > 0) {
        // Check if the value contains a capital letter that matches the start of the next key term
        const nextKeyTerm = nextMatch.term;
        // Extract the word from the key term (e.g., "Bathrooms:" -> "Bathrooms")
        const nextKeyWord = nextKeyTerm.replace(/[:?]/g, '').trim();
        
        // Look for the next key word within the value (case-insensitive)
        const valueLower = value.toLowerCase();
        const nextKeyLower = nextKeyWord.toLowerCase();
        const keyWordIndex = valueLower.indexOf(nextKeyLower);
        
        if (keyWordIndex > 0) {
          // Found the next key word in the value - split before it
          valueEnd = valueStart + keyWordIndex;
          value = description.substring(valueStart, valueEnd).trim();
        } else {
          // Also check for pattern: number/letter followed by capital letter (like "2Bathrooms")
          // This handles cases where the key word isn't found but there's a capital letter
          const capitalLetterMatch = value.match(/(\d+)([A-Z][a-z]+)/);
          if (capitalLetterMatch && capitalLetterMatch.index !== undefined) {
            // Split at the capital letter
            valueEnd = valueStart + capitalLetterMatch.index + capitalLetterMatch[1].length;
            value = description.substring(valueStart, valueEnd).trim();
          } else {
            value = value.trim();
          }
        }
      } else {
        value = value.trim();
      }

      // Render key term with value on same line, each on its own line
      if (value) {
        elements.push(
          <div key={`key-${i}`} className="mb-2">
            <strong className="text-gray-900 font-semibold">{currentMatch.term}</strong>
            <span className="text-gray-700 ml-2">{value}</span>
          </div>
        );
      } else {
        // Just the key term if no value
        elements.push(
          <div key={`key-${i}`} className="mb-2">
            <strong className="text-gray-900 font-semibold">{currentMatch.term}</strong>
          </div>
        );
      }

      lastIndex = valueEnd;
    }

    // Add remaining text
    if (lastIndex < description.length) {
      const remainingText = description.substring(lastIndex).trim();
      if (remainingText) {
        elements.push(
          <p key="text-final" className="text-gray-700 mb-2">{remainingText}</p>
        );
      }
    }

    // If no matches found, return original text
    if (elements.length === 0) {
      return <p className="text-gray-700 whitespace-pre-wrap">{description}</p>;
    }

    return <div className="space-y-2">{elements}</div>;
  };

  // Format title: "X bedroom, Y bath in Neighborhood, CA"
  const formatListingTitle = (listingData: typeof listing): string => {
    const parts: string[] = [];
    
    // Try to extract beds/baths from description if not in listing data
    let beds = listingData.beds;
    let baths = listingData.baths;
    
    if ((beds === undefined || beds === null || beds === 0) && listingData.description) {
      // Try to extract from description (e.g., "Bedrooms: 2")
      const bedMatch = listingData.description.match(/bedroom[s]?[:\s]+(\d+)/i);
      if (bedMatch) beds = parseInt(bedMatch[1], 10);
    }
    
    if ((baths === undefined || baths === null) && listingData.description) {
      // Try to extract from description (e.g., "Bathrooms: 1")
      const bathMatch = listingData.description.match(/bathroom[s]?[:\s]+(\d+(?:\.\d+)?)/i);
      if (bathMatch) baths = parseFloat(bathMatch[1]);
    }
    
    // Add beds/baths
    if (beds !== undefined && beds !== null) {
      const bedText = beds === 0 ? 'Studio' : `${beds} bedroom${beds !== 1 ? 's' : ''}`;
      parts.push(bedText);
    }
    
    if (baths !== undefined && baths !== null) {
      const bathText = `${baths} bath${baths !== 1 ? 's' : ''}`;
      parts.push(bathText);
    }
    
    // Extract location - try neighborhood first, then title, then city
    let location: string | undefined = listingData.neighborhood;
    
    if (!location && listingData.title) {
      // Try to extract from title (e.g., "in San Pedro CA" or "San Pedro")
      const locationMatch = listingData.title.match(/(?:in\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*,?\s*CA/i);
      if (locationMatch) {
        location = locationMatch[1].trim();
      }
    }
    
    if (location) {
      // Clean up location name (remove "CA" if already there, add it properly)
      location = location.trim();
      location = location.replace(/\s*,\s*CA\s*$/i, ''); // Remove trailing ", CA"
      location = location.replace(/\s+CA\s*$/i, ''); // Remove trailing " CA"
      parts.push(`in ${location}, CA`);
    } else if (listingData.city) {
      parts.push(`in ${listingData.city}`);
    }
    
    return parts.join(', ');
  };

  const formattedTitle = formatListingTitle(listing);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/search"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Search
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Heading - Above Image Gallery */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{formattedTitle}</h1>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${listing.rent.toLocaleString()}/month
              </div>
            </div>

            {/* Image Gallery */}
            {allImages.length > 0 ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Image - Clickable */}
                    <div 
                      className="md:col-span-2 cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={allImages[0]}
                        alt={formattedTitle}
                        className="w-full h-64 md:h-96 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </div>
                    {/* Thumbnail Grid - Clickable */}
                    {allImages.length > 1 && (
                      <>
                        {allImages.slice(1, 5).map((imageUrl, idx) => (
                          <div 
                            key={idx} 
                            className="relative cursor-pointer"
                            onClick={() => {
                              setCurrentImageIndex(idx + 1);
                              setShowImageModal(true);
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`${formattedTitle} - Image ${idx + 2}`}
                              className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  {allImages.length > 5 && (
                    <button
                      onClick={() => {
                        setCurrentImageIndex(5);
                        setShowImageModal(true);
                      }}
                      className="text-sm text-[#2A6AFF] hover:text-[#1e5ae6] mt-2 w-full text-center font-medium transition-colors"
                    >
                      +{allImages.length - 5} more images
                    </button>
                  )}
                </div>

                {/* Image Slideshow Modal */}
                {showImageModal && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                    onClick={() => setShowImageModal(false)}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                      aria-label="Close"
                    >
                      <X className="h-8 w-8" />
                    </button>

                    {/* Previous Button */}
                    {currentImageIndex > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(currentImageIndex - 1);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </button>
                    )}

                    {/* Next Button */}
                    {currentImageIndex < allImages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(currentImageIndex + 1);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-8 w-8" />
                      </button>
                    )}

                    {/* Image Container */}
                    <div 
                      className="max-w-7xl max-h-[90vh] mx-4 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={allImages[currentImageIndex]}
                        alt={`${formattedTitle} - Image ${currentImageIndex + 1}`}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                      />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
                      {currentImageIndex + 1} of {allImages.length}
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-16 left-0 right-0 overflow-x-auto px-4 pb-2">
                        <div className="flex gap-2 justify-center max-w-7xl mx-auto">
                          {allImages.map((imageUrl, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(idx);
                              }}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentImageIndex 
                                  ? 'border-white scale-110' 
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={imageUrl}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}

            {/* Listing Details */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              
              {listing.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <div className="text-gray-700">
                    {formatDescription(listing.description)}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-gray-600">
                  {listing.beds !== undefined && listing.beds !== null 
                    ? `${listing.beds === 0 ? 'Studio' : `${listing.beds} bed${listing.beds !== 1 ? 's' : ''}`} / ${listing.baths} bath${listing.baths !== 1 ? 's' : ''}`
                    : `${listing.baths} bath${listing.baths !== 1 ? 's' : ''}`
                  }
                </p>
              </div>

              {/* Key Rules */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Rules</h2>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong className="text-gray-900">Income requirement:</strong>{' '}
                    Must earn at least {incomeMultiplier}x rent (${requiredMonthlyIncome.toLocaleString()} per month).
                  </div>
                  <div>
                    <strong className="text-gray-900">Minimum credit score:</strong>{' '}
                    {listing.minCreditScore ? `${listing.minCreditScore}+` : 'No explicit minimum'}
                  </div>
                  <div>
                    <strong className="text-gray-900">Co-signers:</strong>{' '}
                    {listing.cosignerAllowed ? 'Allowed' : 'Not allowed'}
                  </div>
                  <div>
                    <strong className="text-gray-900">Landlord type:</strong>{' '}
                    {listing.landlordType === 'corporate' ? 'Corporate' : 'Independent'}
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Score or CTA Button */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
                <div className="text-gray-600">Loading your approval score...</div>
              </div>
            ) : status === 'authenticated' && userProfile && approvalScore !== null ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Approval Score</h2>
                
                {/* Score Display */}
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold text-white ${
                    approvalScore >= 70 ? 'bg-green-500' :
                    approvalScore >= 50 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}>
                    {approvalScore}%
                  </div>
                  <p className="text-gray-600 mt-2">
                    {approvalScore >= 70 ? 'Strong Match' :
                     approvalScore >= 50 ? 'Moderate Match' :
                     'Weak Match'}
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile vs. Requirements</h3>
                  <div className="space-y-3">
                    {/* Income Comparison */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <div className="font-semibold text-gray-900">Income</div>
                        <div className="text-sm text-gray-600">
                          Required: {incomeMultiplier}x rent (${requiredMonthlyIncome.toLocaleString()}/mo)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          userProfile.monthlyIncome >= requiredMonthlyIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${userProfile.monthlyIncome?.toLocaleString() || 'N/A'}/mo
                        </div>
                        <div className="text-xs text-gray-500">
                          {userProfile.monthlyIncome && requiredMonthlyIncome 
                            ? `${((userProfile.monthlyIncome / requiredMonthlyIncome) * 100).toFixed(0)}% of required`
                            : 'Not set'}
                        </div>
                      </div>
                    </div>

                    {/* Credit Score Comparison */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <div className="font-semibold text-gray-900">Credit Score</div>
                        <div className="text-sm text-gray-600">
                          Required: {listing.minCreditScore ? `${listing.minCreditScore}+` : 'No minimum'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          listing.minCreditScore && userProfile.creditBand
                            ? (getCreditScoreFromBand(userProfile.creditBand) >= listing.minCreditScore ? 'text-green-600' : 'text-red-600')
                            : 'text-gray-600'
                        }`}>
                          {userProfile.creditBand || 'Not set'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userProfile.creditBand 
                            ? `~${getCreditScoreFromBand(userProfile.creditBand)}`
                            : 'Not set'}
                        </div>
                      </div>
                    </div>

                    {/* Co-signer Comparison */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <div className="font-semibold text-gray-900">Co-signer</div>
                        <div className="text-sm text-gray-600">
                          {listing.cosignerAllowed ? 'Allowed' : 'Not allowed'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          userProfile.hasCosigner && listing.cosignerAllowed ? 'text-green-600' :
                          !listing.cosignerAllowed ? 'text-gray-600' :
                          'text-orange-600'
                        }`}>
                          {userProfile.hasCosigner ? 'Yes' : 'No'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userProfile.hasCosigner && listing.cosignerAllowed ? 'Bonus applied' :
                           !listing.cosignerAllowed ? 'Not applicable' :
                           'Could help'}
                        </div>
                      </div>
                    </div>

                    {/* Max Rent Check */}
                    {userProfile.maxRent && (
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <div className="font-semibold text-gray-900">Your Max Rent</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            listing.rent <= userProfile.maxRent ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${userProfile.maxRent.toLocaleString()}/mo
                          </div>
                          <div className="text-xs text-gray-500">
                            {listing.rent <= userProfile.maxRent ? 'Within budget' : 'Over budget'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {approvalScore < 70 && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Tips to Improve Your Score</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {userProfile.monthlyIncome && userProfile.monthlyIncome < requiredMonthlyIncome && (
                        <li>• Increase your income or add household income</li>
                      )}
                      {listing.minCreditScore && userProfile.creditBand && getCreditScoreFromBand(userProfile.creditBand) < listing.minCreditScore && (
                        <li>• Improve your credit score or add a co-signer if allowed</li>
                      )}
                      {!userProfile.hasCosigner && listing.cosignerAllowed && (
                        <li>• Consider adding a co-signer (this listing allows it)</li>
                      )}
                      {userProfile.maxRent && listing.rent > userProfile.maxRent && (
                        <li>• Increase your max rent budget or look for lower-priced units</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : status === 'authenticated' && !userProfile?.monthlyIncome ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Complete Your Profile</h3>
                <p className="text-yellow-800 mb-4">
                  Add your income, credit score, and preferences to see your approval score for this listing.
                </p>
                <Link
                  href="/profile"
                  className="inline-block bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <Link
                href="/auth"
                className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
              >
                Sign in to see your approval score
              </Link>
            )}
          </div>

          {/* Side Card - Only show when logged in */}
          {status === 'authenticated' && (
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Improve your approval chances
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Increase income / household income</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Add a co-signer if allowed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Improve your credit score over time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Consider listings with flexible requirements</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
