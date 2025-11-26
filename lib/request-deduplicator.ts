export class RequestDeduplicator {
  private inFlightRequests = new Map<string, Promise<unknown>>();

  async deduplicate<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already in flight
    if (this.inFlightRequests.has(key)) {
      console.log(`[Deduplicator] Reusing in-flight request: ${key}`);
      return this.inFlightRequests.get(key) as Promise<T>;
    }

    // Start new request
    const promise = fn()
      .finally(() => {
        // Clean up after request completes
        this.inFlightRequests.delete(key);
      });

    this.inFlightRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.inFlightRequests.clear();
  }

  getInFlightCount(): number {
    return this.inFlightRequests.size;
  }
}