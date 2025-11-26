import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkoutSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Simulate Stripe API call
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock checkout session
    const session = {
      id: `cs_${crypto.randomUUID()}`,
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency,
      status: 'open',
      url: `/booking/confirm?session_id=cs_${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
    };

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: error.cause },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}