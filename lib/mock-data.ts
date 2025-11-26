import { Airport } from "@/types/flight";

export const MOCK_AIRPORTS: Record<string, Airport> = {
  JFK: {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "USA",
    timezone: "America/New_York",
  },
  LAX: {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "USA",
    timezone: "America/Los_Angeles",
  },
  LHR: {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "UK",
    timezone: "Europe/London",
  },
  SIN: {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
  },
  DXB: {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "UAE",
    timezone: "Asia/Dubai",
  },
};

export const AIRLINES = ['AA', 'DL', 'UA', 'BA', 'SQ', 'EK', 'QF', 'LH'];

export function generateFlightNumber(): string {
    const airline = AIRLINES[Math.floor(Math.random() & AIRLINES.length)];
    const number = Math.floor((Math.random() * 9000) + 1000);
    return `${airline}${number}`;
}

export function simulateNetworkDelay(min = 300, max = 1500): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function shouldSimulateError(probability = 0.1): boolean {
    return Math.random() < probability;
}