import { NextRequest, NextResponse } from 'next/server';
import { calculatePreapproval, PreapprovalInput } from '@/lib/preapproval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (
      body.monthlyIncome === undefined ||
      !body.creditBand ||
      body.savings === undefined ||
      body.hasCosigner === undefined ||
      body.targetRent === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: monthlyIncome, creditBand, savings, hasCosigner, and targetRent are required' },
        { status: 400 }
      );
    }

    // Validate types and ranges
    const monthlyIncome = Number(body.monthlyIncome);
    const savings = Number(body.savings);
    const targetRent = Number(body.targetRent);
    const hasCosigner = Boolean(body.hasCosigner);
    const creditBand = String(body.creditBand);

    if (monthlyIncome <= 0) {
      return NextResponse.json(
        { error: 'Monthly income must be a positive number' },
        { status: 400 }
      );
    }

    if (savings < 0) {
      return NextResponse.json(
        { error: 'Savings must be a non-negative number' },
        { status: 400 }
      );
    }

    if (targetRent <= 0) {
      return NextResponse.json(
        { error: 'Target rent must be a positive number' },
        { status: 400 }
      );
    }

    const validCreditBands = ['<580', '580–649', '650–699', '700–749', '750+'];
    if (!validCreditBands.includes(creditBand)) {
      return NextResponse.json(
        { error: `Credit band must be one of: ${validCreditBands.join(', ')}` },
        { status: 400 }
      );
    }

    const input: PreapprovalInput = {
      monthlyIncome,
      creditBand: creditBand as PreapprovalInput['creditBand'],
      savings,
      hasCosigner,
      targetRent,
    };

    const result = calculatePreapproval(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating preapproval:', error);
    return NextResponse.json(
      { error: 'Failed to calculate preapproval' },
      { status: 500 }
    );
  }
}

