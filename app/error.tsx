// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Next.js Error Boundary
 *
 * Automatically wraps route segments
 * Catches errors during rendering, in event handlers, and in Server Components
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Route Error]', error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-red-800 mb-4">
          An error occurred
        </h2>
        <p className="text-red-700 mb-6">
          {error.message || 'Something went wrong while loading this page'}
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
