'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SearchForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '',
    passengers: 1,
    cabinClass: 'economy' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useCallback for event handlers passed to child components
  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin) newErrors.origin = 'Origin is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (formData.origin === formData.destination) {
      newErrors.destination = 'Destination must be different from origin';
    }
    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required';
    if (formData.passengers < 1) newErrors.passengers = 'At least 1 passenger required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Build query params
    const params = new URLSearchParams({
      origin: formData.origin,
      destination: formData.destination,
      departureDate: formData.departureDate,
      passengers: formData.passengers.toString(),
      cabinClass: formData.cabinClass
    });

    // Navigate to search results
    router.push(`/search?${params.toString()}`);

    // Note: isSubmitting will reset when component unmounts during navigation
  }, [formData, validateForm, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="From"
          value={formData.origin}
          onChange={(e) => handleInputChange('origin', e.target.value.toUpperCase())}
          placeholder="JFK"
          maxLength={3}
          error={errors.origin}
        />

        <Input
          label="To"
          value={formData.destination}
          onChange={(e) => handleInputChange('destination', e.target.value.toUpperCase())}
          placeholder="LAX"
          maxLength={3}
          error={errors.destination}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Departure Date"
          type="date"
          value={formData.departureDate}
          onChange={(e) => handleInputChange('departureDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          error={errors.departureDate}
        />

        <Input
          label="Passengers"
          type="number"
          value={formData.passengers}
          onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
          min={1}
          max={9}
          error={errors.passengers}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cabin Class
        </label>
        <select
          value={formData.cabinClass}
          onChange={(e) => handleInputChange('cabinClass', e.target.value)}
          className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First Class</option>
        </select>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={isSubmitting}
      >
        Search Flights
      </Button>
    </form>
  );
}
