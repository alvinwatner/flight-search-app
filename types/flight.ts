export interface Flight {
  id: string;
  provider: "GDS" | "NDC" | "AGGREGATOR";
  airline: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departure: string;
  arrival: string;
  duration: number;
  price: Price;
  stops: number;
  segments: FlightSegments[];
  amenities: string[];
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  availability: number;
}

export interface Airport {
  code: string; // IATA code (e.g., 'JFK', 'CGK', 'HND')
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface FlightSegments {
  id: string;
  airline: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departure: string;
  arrival: string;
  duration: number;
  aircraft: string;
}

export interface Price {
  amount: number;
  currency: string;
  breakdown?: {
    base: number;
    taxes: number;
    fees: number;
  };
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  [key: string]: string | number | undefined; // Index signature
}
// Provider-specific response types (before normalization)
export interface GDSResponse {
  flights: Array<{
    pnr: string;
    carrier: string;
    flightNo: string;
    dep: { airport: string; time: string };
    arr: { airport: string; time: string };
    fare: { total: number; curr: string };
    stops: number;
  }>;
}

export interface NDCResponse {
  offers: Array<{
    offerId: string;
    airline: { iata: string };
    flight: { number: string };
    origin: { iata: string };
    destination: { iata: string };
    departureTime: string;
    arrivalTime: string;
    totalPrice: { value: number; currency: string };
    segments: NDCSegment[];
  }>;
}

export interface NDCSegment {
    departure: string;
    arrival: string;
    duration: number;
}

export interface AggregatorResponse {
  results: Array<{
    id: string;
    airlineCode: string;
    flightNum: string;
    from: string;
    to: string;
    departs: string;
    arrives: string;
    price: number;
    currency: string;
    layovers: number;
  }>;
}

// Booking types
export interface Booking {
  id: string;
  flight: Flight;
  passengers: Passenger[];
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentIntent?: string;
  createdAt: string;
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  passportNumber?: string;
}

export interface SearchResponse {
  flights: Flight[];
  cached: boolean;
  providers: {
    gds: { success: boolean; count: number };
    ndc: { success: boolean; count: number };
    aggregator: { success: boolean; count: number };
  };
  requestId: string;
}
