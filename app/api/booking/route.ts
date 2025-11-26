import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const passengerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: z.string(),
  passportNumber: z.string().optional(),
});

const bookingSchema = z.object({
  flightId: z.string(),
  passengers: z.array(passengerSchema).min(1),
  contactEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    // Simulate booking creation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const booking = {
      id: `BKG${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
      flightId: data.flightId,
      passengers: data.passengers,
      status: "pending",
      totalPrice: 450 * data.passengers.length, // Mock calculation
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid booking data", details: error.cause },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
