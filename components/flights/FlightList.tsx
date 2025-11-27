"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchResponse } from "@/types/flight";
import { FlightCard } from "./FlightCard";

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
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'best'>('best');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [stopFilters, setStopFilters] = useState({
    nonstop: true,
    oneStop: true,
    twoPlus: true
  });
  const [airlineFilters, setAirlineFilters] = useState<Set<string>>(new Set());
  const [timeFilters, setTimeFilters] = useState({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const FLIGHTS_PER_PAGE = 10;

  // useEffect for data fetching with cleanup to prevent memory leaks
  useEffect(() => {
    let cancelled = false;

    async function fetchFlights() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: searchParams.origin,
            destination: searchParams.destination,
            departureDate: searchParams.departureDate,
            passengers: parseInt(searchParams.passengers || "1"),
            cabinClass: searchParams.cabinClass || "economy",
          }),
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const result = await response.json();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
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

    const filtered = data.flights
      // Price filter
      .filter(f => f.price.amount >= priceRange[0] && f.price.amount <= priceRange[1])
      // Stops filter
      .filter(f => {
        if (f.stops === 0 && stopFilters.nonstop) return true;
        if (f.stops === 1 && stopFilters.oneStop) return true;
        if (f.stops >= 2 && stopFilters.twoPlus) return true;
        return false;
      })
      // Airline filter (if specific airlines selected)
      .filter(f => airlineFilters.size === 0 || airlineFilters.has(f.airline))
      // Time filter (if any selected)
      .filter(f => {
        if (!timeFilters.morning && !timeFilters.afternoon && !timeFilters.evening) return true;
        const hour = new Date(f.departure).getHours();
        if (timeFilters.morning && hour >= 6 && hour < 12) return true;
        if (timeFilters.afternoon && hour >= 12 && hour < 18) return true;
        if (timeFilters.evening && hour >= 18 && hour < 24) return true;
        return false;
      });

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'price') return a.price.amount - b.price.amount;
      if (sortBy === 'duration') return a.duration - b.duration;
      // Best value: weighted score
      const scoreA = a.price.amount / 100 + a.duration / 10;
      const scoreB = b.price.amount / 100 + b.duration / 10;
      return scoreA - scoreB;
    });
  }, [data?.flights, priceRange, stopFilters, airlineFilters, timeFilters, sortBy]);

  // Extract unique airlines from results
  const availableAirlines = useMemo(() => {
    if (!data?.flights) return [];
    const airlines = new Set(data.flights.map(f => f.airline));
    return Array.from(airlines).sort();
  }, [data?.flights]);

  // Calculate stop counts
  const stopCounts = useMemo(() => {
    if (!data?.flights) return { nonstop: 0, oneStop: 0, twoPlus: 0 };
    return {
      nonstop: data.flights.filter(f => f.stops === 0).length,
      oneStop: data.flights.filter(f => f.stops === 1).length,
      twoPlus: data.flights.filter(f => f.stops >= 2).length
    };
  }, [data?.flights]);

  // Clear all filters
  const clearFilters = () => {
    setSortBy('best');
    setPriceRange([0, 2000]);
    setStopFilters({ nonstop: true, oneStop: true, twoPlus: true });
    setAirlineFilters(new Set());
    setTimeFilters({ morning: false, afternoon: false, evening: false });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, stopFilters, airlineFilters, timeFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedFlights.length / FLIGHTS_PER_PAGE);
  const startIndex = (currentPage - 1) * FLIGHTS_PER_PAGE;
  const endIndex = startIndex + FLIGHTS_PER_PAGE;
  const paginatedFlights = filteredAndSortedFlights.slice(startIndex, endIndex);

  // Compact filter labels
  const getStopsLabel = () => {
    const active = [stopFilters.nonstop, stopFilters.oneStop, stopFilters.twoPlus].filter(Boolean).length;
    if (active === 3) return "All";
    if (stopFilters.nonstop && !stopFilters.oneStop && !stopFilters.twoPlus) return "Nonstop only";
    return `${active} selected`;
  };

  const getAirlinesLabel = () => {
    if (airlineFilters.size === 0) return "All";
    return `${airlineFilters.size} selected`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        <h3 className="text-lg font-semibold text-yellow-800">
          No Flights Found
        </h3>
        <p className="text-yellow-700 mt-2">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Compact Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'duration' | 'best')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="best">Sort: Best Value</option>
              <option value="price">Sort: Lowest Price</option>
              <option value="duration">Sort: Shortest Duration</option>
            </select>

            {/* Compact filter indicators */}
            <span className="text-sm text-gray-600">Price: ${priceRange[0]}-${priceRange[1]}</span>
            <span className="text-sm text-gray-600">Stops: {getStopsLabel()}</span>
            <span className="text-sm text-gray-600">Airlines: {getAirlinesLabel()}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 whitespace-nowrap">{filteredAndSortedFlights.length} flights</span>
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 whitespace-nowrap"
            >
              {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
              <span>{filtersExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* Expanded filter panel */}
        {filtersExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-sm text-gray-600 min-w-[60px]">$2000</span>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Stops Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Stops:</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stopFilters.nonstop}
                    onChange={(e) => setStopFilters({ ...stopFilters, nonstop: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Nonstop ({stopCounts.nonstop})</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stopFilters.oneStop}
                    onChange={(e) => setStopFilters({ ...stopFilters, oneStop: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">1 stop ({stopCounts.oneStop})</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stopFilters.twoPlus}
                    onChange={(e) => setStopFilters({ ...stopFilters, twoPlus: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">2+ stops ({stopCounts.twoPlus})</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Airlines Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Airlines:</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={airlineFilters.size === 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAirlineFilters(new Set());
                      }
                    }}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-medium">All Airlines</span>
                </label>
                {availableAirlines.map(airline => (
                  <label key={airline} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={airlineFilters.has(airline)}
                      onChange={(e) => {
                        const newFilters = new Set(airlineFilters);
                        if (e.target.checked) {
                          newFilters.add(airline);
                        } else {
                          newFilters.delete(airline);
                        }
                        setAirlineFilters(newFilters);
                      }}
                      className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{airline}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Departure Time Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Departure Time:</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timeFilters.morning}
                    onChange={(e) => setTimeFilters({ ...timeFilters, morning: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Morning (6AM-12PM)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timeFilters.afternoon}
                    onChange={(e) => setTimeFilters({ ...timeFilters, afternoon: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Afternoon (12PM-6PM)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timeFilters.evening}
                    onChange={(e) => setTimeFilters({ ...timeFilters, evening: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Evening (6PM-12AM)</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Clear Filters and Results Count */}
            <div className="flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear Filters
              </button>
              <div className="text-sm text-gray-600">
                {filteredAndSortedFlights.length} of {data.flights.length} flights shown
                {data.cached && <span className="ml-2 text-emerald-600 font-medium">(cached)</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {paginatedFlights.map(flight => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedFlights.length)} of {filteredAndSortedFlights.length} flights
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-cyan-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                {currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}
                <button
                  onClick={() => {
                    setCurrentPage(totalPages);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-cyan-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
