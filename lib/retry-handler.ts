interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

export class RetryHandler {
  private defaults: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['timeout', 'ECONNRESET', 'ETIMEDOUT', '429', '503']
  };

  async execute<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const opts = { ...this.defaults, ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === opts.maxAttempts) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryable(error, opts.retryableErrors)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );

        console.log(
          `[Retry] Attempt ${attempt}/${opts.maxAttempts} failed. Retrying in ${delay}ms...`,
          error
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryable(error: unknown, retryableErrors: string[]): boolean {
    const errorString = String(error).toString().toLowerCase();
    return retryableErrors.some(pattern =>
      errorString.includes(pattern.toLowerCase())
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}