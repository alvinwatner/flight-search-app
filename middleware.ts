// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Runs on the edge before every request
 *
 * Use cases:
 * - Authentication checks
 * - Logging
 * - Redirects
 * - Request/response modification
 * - Rate limiting (edge-level)
 *
 * Interview talking point: "Middleware runs on the edge, before
 * the request reaches the server, making it perfect for auth,
 * logging, and redirects without serverless function cold starts"
 */
export function middleware(request: NextRequest) {
  const start = Date.now();

  // Log request
  console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`);

  // Add custom headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', crypto.randomUUID());
  requestHeaders.set('x-request-time', new Date().toISOString());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add response headers
  response.headers.set('x-processing-time', `${Date.now() - start}ms`);

  return response;
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    // Run on all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
