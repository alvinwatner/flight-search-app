// components/flights/FlightList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { SearchResponse } from '@/types/flight';
import { FlightCard } from './FlightCard';

interface FlightListProps {
  searchParams: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    passengers?: string;
    cabinClass?: string;
  };
}

/**
 * FlightList - Client Component
 *
 * Demonstrates:
 * - useEffect for data fetching with cleanup
 * - useMemo for expensive filtering/sorting
 * - Loading and error states
 */
export function FlightList({ searchParams }: FlightListProps) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'duration'>('price');
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  // useEffect for data fetching with cleanup to prevent memory leaks
  useEffect(() => {
    let cancelled = false;

    async function fetchFlights() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: searchParams.origin,
            destination: searchParams.destination,
            departureDate: searchParams.departureDate,
            passengers: parseInt(searchParams.passengers || '1'),
            cabinClass: searchParams.cabinClass || 'economy'
          })
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const result = await response.json();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFlights();

    // Cleanup function prevents setting state after unmount
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // useMemo for expensive filtering and sorting operations
  const filteredAndSortedFlights = useMemo(() => {
    if (!data?.flights) return [];

    return data.flights
      .filter(flight => flight.price.amount <= maxPrice)
      .sort((a, b) => {
        if (sortBy === 'price') {
          return a.price.amount - b.price.amount;
        }
        return a.duration - b.duration;
      });
  }, [data?.flights, maxPrice, sortBy]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Searching flights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800">Search Failed</h3>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!data || filteredAndSortedFlights.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800">No Flights Found</h3>
        <p className="text-yellow-700 mt-2">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'duration')}
              className="ml-2 px-3 py-1 border rounded"
            >
              <option value="price">Price</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Max price: ${maxPrice}</label>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="ml-2"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {filteredAndSortedFlights.length} of {data.flights.length} flights
          {data.cached && <span className="ml-2 text-green-600">(cached)</span>}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedFlights.map(flight => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
