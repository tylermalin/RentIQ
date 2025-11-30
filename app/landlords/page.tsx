'use client';

import { useState, FormEvent } from 'react';

export default function LandlordsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    neighborhood: '',
    rent: '',
    beds: '',
    baths: '',
    incomeMultiplier: '3',
    minCreditScore: 'None',
    cosignerAllowed: 'No',
    landlordType: 'independent',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          neighborhood: formData.neighborhood,
          rent: Number(formData.rent),
          beds: Number(formData.beds),
          baths: Number(formData.baths),
          incomeMultiplier: Number(formData.incomeMultiplier),
          minCreditScore: formData.minCreditScore === 'None' ? null : Number(formData.minCreditScore),
          cosignerAllowed: formData.cosignerAllowed === 'Yes',
          landlordType: formData.landlordType as 'independent' | 'corporate',
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          neighborhood: '',
          rent: '',
          beds: '',
          baths: '',
          incomeMultiplier: '3',
          minCreditScore: 'None',
          cosignerAllowed: 'No',
          landlordType: 'independent',
        });
      } else {
        const error = await response.json();
        alert(`Failed to create listing: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">List your rental</h1>
        <p className="text-lg text-gray-600 mb-8">
          Publish your unit with clear income, credit, and co-signer rules. We&apos;ll match you with pre-qualified renters in Los Angeles.
        </p>

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-800 p-4 rounded-lg mb-6">
            <p className="font-semibold">
              ✓ Listing submitted. In this MVP, it will be added to our in-memory store until the server restarts.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Modern Studio in Koreatown"
                  />
                </div>
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                    Neighborhood *
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Koreatown"
                  />
                </div>
                <div>
                  <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-2">
                    Rent ($/month) *
                  </label>
                  <input
                    id="rent"
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2500"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Property Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
                    Beds *
                  </label>
                  <input
                    id="beds"
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-2">
                    Baths *
                  </label>
                  <input
                    id="baths"
                    type="number"
                    name="baths"
                    value={formData.baths}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1.5"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Renter Requirements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="incomeMultiplier" className="block text-sm font-medium text-gray-700 mb-2">
                    Income Multiplier *
                  </label>
                  <select
                    id="incomeMultiplier"
                    name="incomeMultiplier"
                    value={formData.incomeMultiplier}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2.5">2.5</option>
                    <option value="3">3</option>
                    <option value="3.5">3.5</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="minCreditScore" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Credit Score *
                  </label>
                  <select
                    id="minCreditScore"
                    name="minCreditScore"
                    value={formData.minCreditScore}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="None">None</option>
                    <option value="600">600</option>
                    <option value="650">650</option>
                    <option value="680">680</option>
                    <option value="700">700</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cosignerAllowed" className="block text-sm font-medium text-gray-700 mb-2">
                    Cosigner Allowed *
                  </label>
                  <select
                    id="cosignerAllowed"
                    name="cosignerAllowed"
                    value={formData.cosignerAllowed}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="landlordType" className="block text-sm font-medium text-gray-700 mb-2">
                    Landlord Type *
                  </label>
                  <select
                    id="landlordType"
                    name="landlordType"
                    value={formData.landlordType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="independent">Independent</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </div>
        </form>

        {/* Future Pro Features */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Coming Soon: Pro Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Screening</h3>
              <p className="text-gray-600 text-sm">
                Automated background checks, credit reports, and rental history verification for all applicants.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-Qualified Leads</h3>
              <p className="text-gray-600 text-sm">
                Receive only applicants who meet your requirements. Save time with instant pre-qualification.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Listings</h3>
              <p className="text-gray-600 text-sm">
                Boost visibility with featured placement in search results and priority matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
