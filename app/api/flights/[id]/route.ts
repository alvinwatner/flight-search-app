import { NextRequest, NextResponse } from 'next/server';

// Mock flight details (in production, fetch from database)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Simulate database lookup
    await new Promise(resolve => setTimeout(resolve, 200));

    const flightDetails = {
      id,
      aircraft: 'Boeing 787-9',
      seatMap: generateMockSeatMap(),
      baggage: {
        checkedBags: 2,
        carryOn: 1,
        personal: 1
      },
      meals: ['breakfast', 'lunch'],
      entertainment: true,
      wifi: true,
      policies: {
        cancellation: 'Full refund within 24 hours',
        changes: 'Change fee applies after 24 hours'
      }
    };

    return NextResponse.json(flightDetails);
  } catch (error) {
    return NextResponse.json(
      { error: 'Flight not found' },
      { status: 404 }
    );
  }
}

function generateMockSeatMap() {
  // Simplified seat map
  return {
    rows: 30,
    seatsPerRow: 6,
    available: Math.floor(Math.random() * 100) + 50
  };
}