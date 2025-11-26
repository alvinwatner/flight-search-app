// lib/aggregation/normalizer.ts
import { Flight, GDSResponse, NDCResponse, AggregatorResponse } from '@/types/flight';
import { MOCK_AIRPORTS } from '../mock-data';

/**
 * Flight Data Normalizer
 *
 * Purpose: Convert different provider formats to unified schema
 * Challenge: Each API has different field names, structures, units
 * Solution: Provider-specific transformation functions
 */

export function normalizeGDSFlights(response: GDSResponse): Flight[] {
  return response.flights.map(flight => ({
    id: flight.pnr,
    provider: 'GDS' as const,
    airline: flight.carrier,
    flightNumber: flight.flightNo,
    origin: MOCK_AIRPORTS[flight.dep.airport] || {
      code: flight.dep.airport,
      name: flight.dep.airport,
      city: flight.dep.airport,
      country: 'Unknown',
      timezone: 'UTC'
    },
    destination: MOCK_AIRPORTS[flight.arr.airport] || {
      code: flight.arr.airport,
      name: flight.arr.airport,
      city: flight.arr.airport,
      country: 'Unknown',
      timezone: 'UTC'
    },
    departure: flight.dep.time,
    arrival: flight.arr.time,
    duration: Math.floor(
      (new Date(flight.arr.time).getTime() - new Date(flight.dep.time).getTime()) / 60000
    ),
    price: {
      amount: flight.fare.total,
      currency: flight.fare.curr
    },
    stops: flight.stops,
    segments: [], // GDS doesn't provide segment details in our mock
    amenities: ['wifi', 'meal'],
    cabinClass: 'economy',
    availability: Math.floor(Math.random() * 50) + 1
  }));
}

export function normalizeNDCFlights(response: NDCResponse): Flight[] {
  return response.offers.map(offer => ({
    id: offer.offerId,
    provider: 'NDC' as const,
    airline: offer.airline.iata,
    flightNumber: offer.flight.number,
    origin: MOCK_AIRPORTS[offer.origin.iata] || {
      code: offer.origin.iata,
      name: offer.origin.iata,
      city: offer.origin.iata,
      country: 'Unknown',
      timezone: 'UTC'
    },
    destination: MOCK_AIRPORTS[offer.destination.iata] || {
      code: offer.destination.iata,
      name: offer.destination.iata,
      city: offer.destination.iata,
      country: 'Unknown',
      timezone: 'UTC'
    },
    departure: offer.departureTime,
    arrival: offer.arrivalTime,
    duration: Math.floor(
      (new Date(offer.arrivalTime).getTime() - new Date(offer.departureTime).getTime()) / 60000
    ),
    price: {
      amount: offer.totalPrice.value,
      currency: offer.totalPrice.currency
    },
    stops: 0,
    segments: [],
    amenities: ['seat_selection', 'priority_boarding'],
    cabinClass: 'economy',
    availability: Math.floor(Math.random() * 30) + 1
  }));
}

export function normalizeAggregatorFlights(response: AggregatorResponse): Flight[] {
  return response.results.map(result => ({
    id: result.id,
    provider: 'AGGREGATOR' as const,
    airline: result.airlineCode,
    flightNumber: result.flightNum,
    origin: MOCK_AIRPORTS[result.from] || {
      code: result.from,
      name: result.from,
      city: result.from,
      country: 'Unknown',
      timezone: 'UTC'
    },
    destination: MOCK_AIRPORTS[result.to] || {
      code: result.to,
      name: result.to,
      city: result.to,
      country: 'Unknown',
      timezone: 'UTC'
    },
    departure: result.departs,
    arrival: result.arrives,
    duration: Math.floor(
      (new Date(result.arrives).getTime() - new Date(result.departs).getTime()) / 60000
    ),
    price: {
      amount: result.price,
      currency: result.currency
    },
    stops: result.layovers,
    segments: [],
    amenities: [],
    cabinClass: 'economy',
    availability: Math.floor(Math.random() * 20) + 1
  }));
}