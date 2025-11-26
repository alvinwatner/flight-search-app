import { SearchParams, NDCResponse } from '@/types/flight';
import { simulateNetworkDelay, shouldSimulateError, generateFlightNumber } from '../mock-data';

/**
 * NDC (New Distribution Capability) Provider
 * Modern XML-based standard by IATA
 * Characteristics:
 * - Direct airline connections
 * - Rich content (seat maps, ancillaries)
 * - Faster than GDS (400-1200ms)
 * - Moderate reliability (15% error rate - newer tech, less stable)
 */
export class NDCProvider {
  private readonly name = 'NDC';

  async search(params: SearchParams): Promise<NDCResponse> {
    console.log(`[${this.name}] Searching flights...`, params);

    await simulateNetworkDelay(400, 1200);

    if (shouldSimulateError(0.15)) {
      throw new Error(`${this.name} API Error: Airline system unavailable`);
    }

    const offers = this.generateMockOffers(params);

    return { offers };
  }

  private generateMockOffers(params: SearchParams) {
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 offers
    const offers = [];

    for (let i = 0; i < count; i++) {
      const departureTime = new Date(params.departureDate);
      departureTime.setHours(7 + i * 3, Math.random() * 60);

      const duration = 200 + Math.random() * 250;
      const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

      offers.push({
        offerId: `NDC${Math.random().toString(36).substr(2, 11).toUpperCase()}`,
        airline: { iata: generateFlightNumber().substring(0, 2) },
        flight: { number: generateFlightNumber() },
        origin: { iata: params.origin },
        destination: { iata: params.destination },
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        totalPrice: {
          value: Math.floor(250 + Math.random() * 800),
          currency: 'USD'
        },
        segments: [] // Simplified
      });
    }

    return offers;
  }
}