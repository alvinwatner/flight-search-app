// app/search/page.tsx
import { Suspense } from 'react';
import { FlightList } from '@/components/flights/FlightList';

interface SearchPageProps {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    departureDate?: string;
    passengers?: string;
    cabinClass?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Validate search params
  if (!params.origin || !params.destination) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800">Invalid Search</h2>
          <p className="text-yellow-700 mt-2">Please provide origin and destination.</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to search
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {params.origin} → {params.destination}
        </h1>
        <p className="text-gray-600">
          {params.passengers || 1} passenger(s) • {params.cabinClass || 'economy'}
        </p>
      </div>

      <main>
        <Suspense fallback={<FlightListSkeleton />}>
          <FlightList searchParams={params} />
        </Suspense>
      </main>
    </div>
  );
}

function FlightListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
