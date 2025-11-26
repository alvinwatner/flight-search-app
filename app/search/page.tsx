// app/search/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { FlightList } from '@/components/flights/FlightList';
import { Button } from '@/components/ui/Button';
import { formatDate, getAirportCity } from '@/lib/utils';

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
          <Link
            href="/"
            className="text-cyan-600 hover:underline mt-4 inline-block"
          >
            {" "}
            Return to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          {getAirportCity(params.origin)} ({params.origin}) → {getAirportCity(params.destination)} ({params.destination})
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          {params.departureDate ? formatDate(params.departureDate) : 'No date specified'} • {params.passengers || 1} passenger{parseInt(params.passengers || '1') !== 1 ? 's' : ''} • {(params.cabinClass || 'economy').charAt(0).toUpperCase() + (params.cabinClass || 'economy').slice(1)}
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Modify Search
          </Button>
        </Link>
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
