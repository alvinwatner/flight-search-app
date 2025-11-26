import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { FlightAggregator } from "@/lib/aggregation/flight-aggregator";

// Validation schema
const searchSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  passengers: z.number().min(1).max(9),
  cabinClass: z.enum(["economy", "premium_economy", "business", "first"]),
});

const aggregator = new FlightAggregator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const params = searchSchema.parse(body);

    // search flights
    const result = await aggregator.search(params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Invalid request",
        details: error.cause,
      });
    }
    console.error('Search error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}

// GET endpoint for cache stats (useful for monitoring)
export async function GET() {
    const stats = aggregator.getCacheStats();
    return NextResponse.json(stats);
}
