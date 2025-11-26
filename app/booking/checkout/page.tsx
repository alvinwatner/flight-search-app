// app/booking/checkout/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flightId = searchParams.get('flightId');

  const [step, setStep] = useState<'passenger' | 'payment'>('passenger');
  const [passengers, setPassengers] = useState([{
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: ''
  }]);
  const [processing, setProcessing] = useState(false);

  const handleSubmitPassengers = () => {
    const isValid = passengers.every(p =>
      p.firstName && p.lastName && p.email && p.dateOfBirth
    );

    if (isValid) {
      setStep('payment');
    } else {
      alert('Please fill all passenger details');
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // 1. Create booking
      const bookingResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId,
          passengers,
          contactEmail: passengers[0].email
        })
      });

      const booking = await bookingResponse.json();

      // 2. Initialize payment
      const paymentResponse = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
          currency: 'USD'
        })
      });

      const session = await paymentResponse.json();

      // 3. Redirect to confirmation
      router.push(`/booking/confirm?bookingId=${booking.id}&sessionId=${session.id}`);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment initialization failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

      {step === 'passenger' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Passenger Information</h2>
          </CardHeader>
          <CardContent>
            {passengers.map((passenger, index) => (
              <div key={index} className="space-y-4 mb-6 pb-6 border-b last:border-b-0">
                <h3 className="font-medium">Passenger {index + 1}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={passenger.firstName}
                    onChange={(e) => {
                      const newPassengers = [...passengers];
                      newPassengers[index].firstName = e.target.value;
                      setPassengers(newPassengers);
                    }}
                  />
                  <Input
                    label="Last Name"
                    value={passenger.lastName}
                    onChange={(e) => {
                      const newPassengers = [...passengers];
                      newPassengers[index].lastName = e.target.value;
                      setPassengers(newPassengers);
                    }}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={passenger.email}
                  onChange={(e) => {
                    const newPassengers = [...passengers];
                    newPassengers[index].email = e.target.value;
                    setPassengers(newPassengers);
                  }}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) => {
                    const newPassengers = [...passengers];
                    newPassengers[index].dateOfBirth = e.target.value;
                    setPassengers(newPassengers);
                  }}
                />
              </div>
            ))}
            <Button onClick={handleSubmitPassengers} variant="primary" size="lg" className="w-full">
              Continue to Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'payment' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Payment Information</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>Demo Mode:</strong> This is a mock Stripe integration.
                In production, Stripe would handle the payment form here.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <Input label="Card Number" placeholder="4242 4242 4242 4242" disabled />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiry" placeholder="MM/YY" disabled />
                <Input label="CVC" placeholder="123" disabled />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep('passenger')} variant="outline" size="lg">
                Back
              </Button>
              <Button
                onClick={handlePayment}
                variant="primary"
                size="lg"
                className="flex-1"
                loading={processing}
              >
                Complete Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-12 px-4">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
