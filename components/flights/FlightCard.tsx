// components/flights/FlightCard.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flight } from '@/types/flight';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDuration, formatTime } from '@/lib/utils';

interface FlightCardProps {
  flight: Flight;
}

/**
 * FlightCard - Client Component
 *
 * Demonstrates:
 * - useRef for DOM references
 * - useEffect for side effects (Intersection Observer for analytics)
 * - Router navigation
 */
export function FlightCard({ flight }: FlightCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  // useEffect with Intersection Observer for analytics tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Track impression - in production: send to analytics service
            console.log('[Analytics] Flight viewed:', flight.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // Cleanup to prevent memory leaks
    return () => {
      observer.disconnect();
    };
  }, [flight.id]);

  const handleSelect = () => {
    console.log('[Analytics] Flight selected:', flight.id);
    router.push(`/booking/checkout?flightId=${flight.id}`);
  };

  return (
    <Card ref={cardRef} hoverable>
      <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge variant="info">{flight.provider}</Badge>
            <span className="font-semibold text-lg">{flight.airline} {flight.flightNumber}</span>
            {flight.stops === 0 && <Badge variant="success">Nonstop</Badge>}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-2xl font-bold">{formatTime(flight.departure)}</div>
              <div className="text-sm text-gray-600">{flight.origin.code}</div>
              <div className="text-xs text-gray-500">{flight.origin.city}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600">{formatDuration(flight.duration)}</div>
              <div className="border-t-2 border-gray-300 my-2"></div>
              <div className="text-xs text-gray-500">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime(flight.arrival)}</div>
              <div className="text-sm text-gray-600">{flight.destination.code}</div>
              <div className="text-xs text-gray-500">{flight.destination.city}</div>
            </div>
          </div>
        </div>

        <div className="text-right w-full md:w-auto">
          <div className="text-3xl font-bold text-blue-600">
            ${flight.price.amount}
          </div>
          <div className="text-sm text-gray-600">per person</div>
          <Button variant="primary" className="mt-4 w-full md:w-auto" onClick={handleSelect}>
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
