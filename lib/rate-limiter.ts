interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Token Bucket Rate Limiter
 *
 * Purpose: Prevent overwhelming external APIs
 * Algorithm: Token bucket - tokens refill over time
 *
 * Interview talking point: "I used token bucket because it allows bursts
 * while maintaining average rate, unlike fixed window which can cause
 * thundering herd at window boundaries"
 */
export class RateLimiter {
  private buckets = new Map<string, TokenBucket>();

  constructor(
    private maxTokens: number = 10, // max requests per window
    private refillRate: number = 1, // tokens added per second
    private refillInternal: number = 1000 // 1 second
  ) {}

  async acquire(key: string): Promise<boolean> {
    const bucket = this.getOrCreateBucket(key);
    this.refillBucket(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }

  async waitForToken(key: string): Promise<void> {
    while (!(await this.acquire(key))) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private getOrCreateBucket(key: string): TokenBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      });
    }
    return this.buckets.get(key)!;
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / this.refillInternal) * this.refillRate;

    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
  }

  getRemainingTokens(key: string): number {
    const bucket = this.getOrCreateBucket(key);
    this.refillBucket(bucket);
    return Math.floor(bucket.tokens);
  }

  reset(key?: string): void {
    if (key) {
      this.buckets.delete(key);
    } else {
      this.buckets.clear();
    }
  }
}
