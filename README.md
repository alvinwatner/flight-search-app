# FlightSearch 

Simulating a production-grade flight search platform with Next.js and Type Script.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**

## Key Technical Demonstrations

### System Design Patterns
| Pattern | Location | Purpose |
|---------|----------|---------|
| In-memory Cache (TTL) | `lib/cache/` | Reduce API calls, 5-min expiry |
| Token Bucket Rate Limiting | `lib/rate-limiter/` | Protect providers from overload |
| Request Deduplication | `lib/deduplication/` | Prevent duplicate in-flight requests |
| Exponential Backoff Retry | `lib/retry/` | Handle transient failures gracefully |

### API Architecture
- **Multi-provider Aggregation**: GDS, NDC, Aggregator APIs called in parallel
- **Data Normalization**: Different provider schemas → unified `Flight` interface
- **Eventual Consistency**: `Promise.allSettled` returns available results even if some fail

### Next.js Patterns
| Pattern | Location |
|---------|----------|
| Server Components | `app/search/page.tsx` |
| Client Components | `components/flights/FlightList.tsx` |
| Route Handlers | `app/api/flights/search/route.ts` |
| Suspense Boundaries | `app/search/page.tsx` |
| Error Boundaries | `components/ErrorBoundary.tsx` |
| Middleware | `middleware.ts` (logging, custom headers) |

### React Patterns
| Hook | Usage | Location |
|------|-------|----------|
| `useCallback` | Memoized event handlers | `SearchForm.tsx` |
| `useMemo` | Expensive filtering/sorting | `FlightList.tsx` |
| `useRef` | Intersection Observer for analytics | `FlightCard.tsx` |
| `useEffect` | Data fetching with cleanup | `FlightList.tsx` |
| Context API | Global search state | `SearchContext.tsx` |

### TypeScript
- Type-safe interfaces (`types/flight.ts`)
- Zod runtime validation for API requests
- `forwardRef` typing for UI components

### Mock Stripe Integration
- Checkout flow: `app/booking/checkout/page.tsx`
- Confirmation: `app/booking/confirm/page.tsx`

## Project Structure

```
flight-search-app/
├── app/
│   ├── api/flights/search/    # Route Handler
│   ├── booking/               # Checkout flow
│   ├── search/                # Search results (Server Component)
│   └── page.tsx               # Home page
├── components/
│   ├── flights/               # FlightList, FlightCard
│   ├── search/                # SearchForm, SearchContext
│   └── ui/                    # Button, Card, Input, Badge
├── lib/
│   ├── aggregation/           # Normalizer, Aggregator
│   ├── cache/                 # In-memory cache
│   ├── rate-limiter/          # Token bucket
│   ├── deduplication/         # Request dedup
│   ├── retry/                 # Exponential backoff
│   └── providers/             # GDS, NDC, Aggregator mocks
├── types/                     # TypeScript interfaces
└── middleware.ts              # Request logging
```
