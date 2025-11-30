import { PreapprovalInput, PreapprovalResult } from '@/lib/preapproval';

type PreapprovalLetterProps = {
  renterName?: string;
  city?: string;
  input: PreapprovalInput;
  result: PreapprovalResult;
};

export default function PreapprovalLetter({
  renterName = 'Applicant',
  city = 'Los Angeles',
  input,
  result,
}: PreapprovalLetterProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getCreditScoreLabel = (band: string) => {
    const labels: Record<string, string> = {
      '<580': 'Below 580',
      '580–649': '580-649',
      '650–699': '650-699',
      '700–749': '700-749',
      '750+': '750+',
    };
    return labels[band] || band;
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-0 print:max-w-full">

      {/* Letter Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-gray-900">Rent</span>
            <span className="text-[#2A6AFF]">IQ</span>
          </h1>
          <p className="text-gray-600">Rental Pre-Approval Letter</p>
        </div>

        {/* Date and Address */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-700 mb-1">{currentDate}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>RentIQ Rental Platform</p>
            <p>{city}, CA</p>
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-6">
          <p className="text-gray-900 font-semibold mb-2">To Whom It May Concern:</p>
          <p className="text-gray-700 leading-relaxed">
            This letter serves to confirm that <strong>{renterName}</strong> has been pre-approved for rental properties 
            in the {city} area based on the financial information provided to RentIQ.
          </p>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Profile Summary</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
              <p className="text-lg font-semibold text-gray-900">
                ${input.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Credit Score Range</p>
              <p className="text-lg font-semibold text-gray-900">
                {getCreditScoreLabel(input.creditBand)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Savings</p>
              <p className="text-lg font-semibold text-gray-900">
                ${input.savings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Co-Signer Available</p>
              <p className="text-lg font-semibold text-gray-900">
                {input.hasCosigner ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Pre-Approval Details */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pre-Approval Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-2">
                Based on the financial information provided, <strong>{renterName}</strong> is pre-approved for 
                rental properties with monthly rent up to:
              </p>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 inline-block">
                <p className="text-sm text-blue-800 mb-1">Maximum Recommended Monthly Rent</p>
                <p className="text-3xl font-bold text-blue-900">
                  ${result.maxRecommendedRent.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Assessment:</strong> {result.explanation}
              </p>
            </div>

            {result.suggestedTopUpDeposit && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-yellow-900 mb-1">Recommendation</p>
                <p className="text-yellow-800 text-sm">
                  To strengthen the application, consider offering an additional security deposit of{' '}
                  <strong>${result.suggestedTopUpDeposit.toLocaleString()}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Disclaimer:</strong> This pre-approval letter is based on the information provided by the applicant 
            and is not a guarantee of rental approval. Final approval is subject to the landlord&apos;s verification process, 
            including but not limited to credit checks, income verification, and reference checks. This letter is valid 
            for 30 days from the date of issuance. RentIQ reserves the right to verify all information provided.
          </p>
        </div>

        {/* Signature Section */}
        <div className="mt-12">
          <div className="border-t-2 border-gray-800 pt-4">
            <p className="text-gray-900 font-semibold mb-2">RentIQ Rental Platform</p>
            <p className="text-sm text-gray-600">
              This is an automated pre-approval letter generated on {currentDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

