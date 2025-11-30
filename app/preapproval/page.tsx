'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { PreapprovalResult, PreapprovalInput } from '@/lib/preapproval';
import PreapprovalLetter from '@/components/PreapprovalLetter';

// TODO: Replace with real auth + Stripe subscription check
function getIsPremium(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('approval_isPremium');
  return stored === 'true';
}

function setIsPremium(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approval_isPremium', String(value));
}

export default function PreapprovalPage() {
  const [renterName, setRenterName] = useState('');
  const [city, setCity] = useState('Los Angeles');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [creditBand, setCreditBand] = useState('');
  const [savings, setSavings] = useState('');
  const [hasCosigner, setHasCosigner] = useState(false);
  const [targetRent, setTargetRent] = useState('');
  const [result, setResult] = useState<PreapprovalResult | null>(null);
  const [input, setInput] = useState<PreapprovalInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [isPremium, setIsPremiumState] = useState(false);

  // Load premium status from localStorage on mount
  useEffect(() => {
    setIsPremiumState(getIsPremium());
  }, []);

  const handleUpgrade = () => {
    setIsPremium(true);
    setIsPremiumState(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!monthlyIncome || !creditBand || savings === '' || !targetRent) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/preapproval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: Number(monthlyIncome),
          creditBand,
          savings: Number(savings),
          hasCosigner,
          targetRent: Number(targetRent),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate preapproval');
      }

      const data = await response.json();
      setResult(data);
      // Store input for the letter
      setInput({
        monthlyIncome: Number(monthlyIncome),
        creditBand: creditBand as PreapprovalInput['creditBand'],
        savings: Number(savings),
        hasCosigner,
        targetRent: Number(targetRent),
      });
    } catch (error) {
      console.error('Failed to calculate preapproval:', error);
      alert(error instanceof Error ? error.message : 'Failed to calculate preapproval. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'borderline':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'weak':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'Strong';
      case 'borderline':
        return 'Borderline';
      case 'weak':
        return 'Needs Improvement';
      default:
        return strength;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Get Pre-Approved</h1>
        <p className="text-lg text-gray-600 mb-8">
          Get a pre-approval letter and understand your rental budget before you start searching.
        </p>

        {/* Premium Banner */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Upgrade to RentIQ Plus</h3>
                <p className="text-blue-100 text-sm">
                  Unlock printable offer letters and premium features
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Print View - Only visible when printing */}
        {result && input && showLetter && (
          <div className="hidden print:block">
            <PreapprovalLetter
              renterName={renterName || undefined}
              city={city}
              input={input}
              result={result}
            />
          </div>
        )}

        {/* Regular View */}
        <div className="print:hidden">

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Financial Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="renterName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  id="renterName"
                  type="text"
                  value={renterName}
                  onChange={(e) => setRenterName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Los Angeles"
                />
              </div>

              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income ($) *
                </label>
                <input
                  id="monthlyIncome"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 6250"
                />
              </div>

              <div>
                <label htmlFor="creditBand" className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Score Band *
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
                <label htmlFor="savings" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Savings ($) *
                </label>
                <input
                  id="savings"
                  type="number"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10000"
                />
              </div>

              <div>
                <label htmlFor="targetRent" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Monthly Rent ($) *
                </label>
                <input
                  id="targetRent"
                  type="number"
                  value={targetRent}
                  onChange={(e) => setTargetRent(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasCosigner}
                    onChange={(e) => setHasCosigner(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    I have a co-signer available
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Calculating...' : 'Get Pre-Approval'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {result && (
              <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${getStrengthColor(result.strength)}`}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Pre-Approval Result</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStrengthColor(result.strength)}`}>
                      {getStrengthLabel(result.strength)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ${result.maxRecommendedRent.toLocaleString()}/month
                  </div>
                  <p className="text-sm text-gray-600">Maximum Recommended Rent</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Explanation</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                {result.suggestedTopUpDeposit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-1">💡 Recommendation</h3>
                    <p className="text-blue-800 text-sm">
                      Consider offering an additional security deposit of{' '}
                      <strong>${result.suggestedTopUpDeposit.toLocaleString()}</strong> to strengthen your application.
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  {/* Premium-gated Offer Letter */}
                  {isPremium ? (
                    <button
                      onClick={() => setShowLetter(true)}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      View Offer Letter
                    </button>
                  ) : (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Upgrade to RentIQ Plus to create a shareable offer letter
                      </h3>
                      <ul className="space-y-2 mb-4 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          <span>Generate a printable pre-approval summary</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          <span>Explain your profile clearly to landlords</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          <span>Highlight optional top-up deposit to improve approval odds</span>
                        </li>
                      </ul>
                      <button
                        onClick={handleUpgrade}
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Simulate Upgrade (MVP)
                      </button>
                    </div>
                  )}
                  <Link
                    href={`/search?maxRent=${result.maxRecommendedRent}`}
                    className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
                  >
                    Search Rentals in My Budget
                  </Link>
                </div>
              </div>
            )}

            {!result && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Fill out the form to get your pre-approval assessment.
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Letter Modal/View - Only shown if Premium */}
        {isPremium && result && input && showLetter && (
          <div className="print:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">Pre-Approval Letter</h2>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                    RentIQ Plus
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Print / Save as PDF
                  </button>
                  <button
                    onClick={() => setShowLetter(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-8">
                <PreapprovalLetter
                  renterName={renterName || undefined}
                  city={city}
                  input={input}
                  result={result}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

