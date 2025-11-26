import { SearchParams, AggregatorResponse } from '@/types/flight';
import { simulateNetworkDelay, shouldSimulateError } from '../mock-data';

/**
 * Flight Aggregator Provider
 * Simulates Skyscanner, Kayak, Google Flights
 * Characteristics:
 * - Aggregates data from multiple sources
 * - Fast response (300-800ms - heavily cached)
 * - High reliability (5% error rate)
 * - Simplified data structure
 */
export class AggregatorProvider {
  private readonly name = 'Aggregator';

  async search(params: SearchParams): Promise<AggregatorResponse> {
    console.log(`[${this.name}] Searching flights...`, params);

    await simulateNetworkDelay(300, 800);

    if (shouldSimulateError(0.05)) {
      throw new Error(`${this.name} API Error: Rate limit exceeded`);
    }

    const results = this.generateMockResults(params);

    return { results };
  }

  private generateMockResults(params: SearchParams) {
    const count = Math.floor(Math.random() * 8) + 5; // 5-12 results
    const results = [];
    const airlines = ['AA', 'DL', 'UA', 'QF', 'AI']; // Aggregator airlines

    for (let i = 0; i < count; i++) {
      const departureTime = new Date(params.departureDate);
      departureTime.setHours(5 + i * 1.5, Math.random() * 60);

      const duration = 190 + Math.random() * 280;
      const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

      const airlineCode = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNum = Math.floor(Math.random() * 9000) + 1000;

      results.push({
        id: `AGG${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        airlineCode,
        flightNum: `${airlineCode}${flightNum}`,
        from: params.origin,
        to: params.destination,
        departs: departureTime.toISOString(),
        arrives: arrivalTime.toISOString(),
        price: Math.floor(280 + Math.random() * 750),
        currency: 'USD',
        layovers: Math.random() > 0.6 ? 1 : 0
      });
    }

    return results;
  }
}