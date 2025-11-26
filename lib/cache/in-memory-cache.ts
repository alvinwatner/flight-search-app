
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * In-Memory Cache with TTL
 *
 * Purpose: Reduce redundant API calls for identical searches
 * Strategy: Hash-based key from search params, 5-minute TTL
 *
 * Interview talking point: "In production, I'd use Redis for distributed caching,
 * but in-memory works for single-instance deployments or development"
 */
export class InMemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;

  constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 5 minutes

  set(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });

    // Cleanup expired entries periodically
    if (this.cache.size % 100 === 0) {
      this.cleanup();
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }
}

// Generate cache key from search params
export function generateCacheKey(params: Record<string, unknown>): string {
  // Sort keys for consistent hashing
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);

  return JSON.stringify(sorted);
}