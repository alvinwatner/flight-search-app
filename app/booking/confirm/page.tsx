// app/booking/confirm/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const sessionId = searchParams.get('sessionId');

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">Your flight has been successfully booked</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="text-2xl font-bold">{bookingId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Payment Session</p>
            <p className="font-mono text-sm break-all">{sessionId}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              A confirmation email has been sent to your email address.
            </p>
          </div>

          <Button onClick={() => window.location.href = '/'} variant="primary" className="w-full">
            Book Another Flight
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-12 px-4">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
