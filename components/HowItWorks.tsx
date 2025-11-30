'use client';

import { useState, useEffect } from 'react';
import { FileCheck, Search, Zap, BarChart3 } from 'lucide-react';

export default function HowItWorks() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar to 100%
    const timer = setTimeout(() => {
      setProgress(100);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 bg-[#1A1E23]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          How it works
        </h2>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: The Engine */}
          <div className="bg-[#252A30] border border-[#2A6AFF]/20 rounded-xl p-8 hover:border-[#2A6AFF]/50 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#2A6AFF]/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-[#42F7C8]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">The Eligibility Engine</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Stop guessing. Our AI analyzes your income & credit to calculate your true rental power.
                </p>
              </div>
            </div>
            
            {/* Progress Bar Visual */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Rental Power</span>
                <span className="text-xs font-semibold text-[#42F7C8]">{progress}%</span>
              </div>
              <div className="h-2 bg-[#1A1E23] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#42F7C8] to-[#2A6AFF] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: The Proof */}
          <div className="bg-[#252A30] border border-[#2A6AFF]/20 rounded-xl p-8 hover:border-[#2A6AFF]/50 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#2A6AFF]/10 rounded-lg">
                    <FileCheck className="h-6 w-6 text-[#42F7C8]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Verified Offer Letter</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Generate a cryptographically verified &apos;Proof of Funds&apos; that landlords trust.
                </p>
              </div>
            </div>
            
            {/* Document Icon with Checkmark Visual */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-20 bg-[#1A1E23] border-2 border-[#2A6AFF]/30 rounded-lg flex items-center justify-center">
                  <FileCheck className="h-8 w-8 text-[#2A6AFF]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#42F7C8] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#1A1E23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: The Filter */}
          <div className="bg-[#252A30] border border-[#2A6AFF]/20 rounded-xl p-8 hover:border-[#2A6AFF]/50 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#2A6AFF]/10 rounded-lg">
                    <Search className="h-6 w-6 text-[#42F7C8]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Smart Search</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  See only the homes you are pre-approved for.
                </p>
              </div>
            </div>
            
            {/* Mock List of Apartments Visual */}
            <div className="mt-6 space-y-2">
              {[
                { name: 'Downtown Loft', price: '$2,400', match: 95 },
                { name: 'Riverside Apartment', price: '$1,800', match: 88 },
                { name: 'Studio in Midtown', price: '$1,500', match: 92 },
              ].map((apt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#1A1E23] rounded-lg border border-[#2A6AFF]/10">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{apt.name}</div>
                    <div className="text-xs text-gray-500">{apt.price}/mo</div>
                  </div>
                  <div className="text-xs font-semibold text-[#42F7C8]">{apt.match}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: The Speed */}
          <div className="bg-[#252A30] border border-[#2A6AFF]/20 rounded-xl p-8 hover:border-[#2A6AFF]/50 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#2A6AFF]/10 rounded-lg">
                    <Zap className="h-6 w-6 text-[#42F7C8]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Instant Apply</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Apply with confidence and move in faster.
                </p>
              </div>
            </div>
            
            {/* Speed Visual */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#2A6AFF]/30 border-t-[#42F7C8] rounded-full animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-[#42F7C8]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

