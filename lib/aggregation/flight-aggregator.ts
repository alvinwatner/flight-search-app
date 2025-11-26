// lib/aggregation/flight-aggregator.ts
import { SearchParams, Flight, SearchResponse } from '@/types/flight';
import { GDSProvider } from '../providers/gds-provider';
import { NDCProvider } from '../providers/ndc-provider';
import { AggregatorProvider } from '../providers/aggregator-provider';
import { normalizeGDSFlights, normalizeNDCFlights, normalizeAggregatorFlights } from './normalizer';
import { InMemoryCache, generateCacheKey } from '../cache/in-memory-cache';
import { RateLimiter } from '../rate-limiter';
import { RequestDeduplicator } from '../request-deduplicator';
import { RetryHandler } from '../retry-handler';

/**
 * Flight Aggregator Service
 *
 * This is the core of our system design - it orchestrates:
 * 1. Caching (check cache before calling APIs)
 * 2. Rate limiting (respect API limits)
 * 3. Request deduplication (prevent duplicate concurrent requests)
 * 4. Parallel execution (call all providers simultaneously)
 * 5. Retry logic (handle transient failures)
 * 6. Normalization (unify different response formats)
 * 7. Eventual consistency (some providers may fail, return partial results)
 */
export class FlightAggregator {
  private gdsProvider = new GDSProvider();
  private ndcProvider = new NDCProvider();
  private aggregatorProvider = new AggregatorProvider();

  private cache = new InMemoryCache<SearchResponse>(5 * 60 * 1000); // 5 min
  private rateLimiter = new RateLimiter(10, 1, 1000); // 10 req/sec
  private deduplicator = new RequestDeduplicator();
  private retryHandler = new RetryHandler();

  async search(params: SearchParams): Promise<SearchResponse> {
    const cacheKey = generateCacheKey(params);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('[Aggregator] Cache hit');
      return { ...cached, cached: true };
    }

    // Deduplicate concurrent requests
    return this.deduplicator.deduplicate(cacheKey, async () => {
      // Rate limit check
      await this.rateLimiter.waitForToken('flight-search');

      // Call all providers in parallel
      const results = await Promise.allSettled([
        this.fetchFromGDS(params),
        this.fetchFromNDC(params),
        this.fetchFromAggregator(params)
      ]);

      // Process results (eventual consistency - some may fail)
      const flights: Flight[] = [];
      const providerStats = {
        gds: { success: false, count: 0 },
        ndc: { success: false, count: 0 },
        aggregator: { success: false, count: 0 }
      };

      results.forEach((result, index) => {
        const providerName = ['gds', 'ndc', 'aggregator'][index] as keyof typeof providerStats;

        if (result.status === 'fulfilled') {
          flights.push(...result.value);
          providerStats[providerName].success = true;
          providerStats[providerName].count = result.value.length;
        } else {
          console.error(`[${providerName.toUpperCase()}] Failed:`, result.reason);
        }
      });

      // Sort by price
      flights.sort((a, b) => a.price.amount - b.price.amount);

      // Remove duplicates (same flight from different providers)
      const uniqueFlights = this.deduplicateFlights(flights);

      const response: SearchResponse = {
        flights: uniqueFlights,
        cached: false,
        providers: providerStats,
        requestId: crypto.randomUUID()
      };

      // Cache for future requests
      this.cache.set(cacheKey, response);

      return response;
    });
  }

  private async fetchFromGDS(params: SearchParams): Promise<Flight[]> {
    return this.retryHandler.execute(async () => {
      const response = await this.gdsProvider.search(params);
      return normalizeGDSFlights(response);
    });
  }

  private async fetchFromNDC(params: SearchParams): Promise<Flight[]> {
    return this.retryHandler.execute(async () => {
      const response = await this.ndcProvider.search(params);
      return normalizeNDCFlights(response);
    });
  }

  private async fetchFromAggregator(params: SearchParams): Promise<Flight[]> {
    return this.retryHandler.execute(async () => {
      const response = await this.aggregatorProvider.search(params);
      return normalizeAggregatorFlights(response);
    });
  }

  private deduplicateFlights(flights: Flight[]): Flight[] {
    const seen = new Set<string>();
    return flights.filter(flight => {
      const key = `${flight.flightNumber}-${flight.departure}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}