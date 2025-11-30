import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        monthlyIncome: true,
        creditBand: true,
        hasCosigner: true,
        maxRent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, monthlyIncome, creditBand, hasCosigner, maxRent } = body;

    // Validate credit band if provided
    if (creditBand && !['<580', '580–649', '650–699', '700–749', '750+'].includes(creditBand)) {
      return NextResponse.json(
        { error: 'Invalid credit band' },
        { status: 400 }
      );
    }

    // Validate monthly income if provided
    if (monthlyIncome !== undefined && monthlyIncome !== null && monthlyIncome !== '') {
      const income = Number(monthlyIncome);
      if (isNaN(income) || income < 0) {
        return NextResponse.json(
          { error: 'Monthly income must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Validate max rent if provided
    if (maxRent !== undefined && maxRent !== null && maxRent !== '') {
      const rent = Number(maxRent);
      if (isNaN(rent) || rent < 0) {
        return NextResponse.json(
          { error: 'Max rent must be a positive number' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name && name.trim() ? name.trim() : null;
    if (monthlyIncome !== undefined) {
      updateData.monthlyIncome = (monthlyIncome && monthlyIncome !== '' && !isNaN(Number(monthlyIncome))) 
        ? Number(monthlyIncome) 
        : null;
    }
    if (creditBand !== undefined) updateData.creditBand = creditBand && creditBand.trim() ? creditBand.trim() : null;
    if (hasCosigner !== undefined) updateData.hasCosigner = Boolean(hasCosigner);
    if (maxRent !== undefined) {
      updateData.maxRent = (maxRent && maxRent !== '' && !isNaN(Number(maxRent))) 
        ? Number(maxRent) 
        : null;
    }

    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    console.log('Updating profile with data:', updateData);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        monthlyIncome: true,
        creditBand: true,
        hasCosigner: true,
        maxRent: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if it's a Prisma error
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A user with this information already exists' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

