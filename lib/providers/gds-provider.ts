import { GDSResponse, SearchParams } from "@/types/flight";
import {
  simulateNetworkDelay,
  shouldSimulateError,
  MOCK_AIRPORTS,
  generateFlightNumber,
} from "../mock-data";

export class GDSProvider {
  private readonly name = "GDS";

  async search(params: SearchParams): Promise<GDSResponse> {
    console.log(`[${this.name}] Searching flights...`, params);

    await simulateNetworkDelay(800, 2000);

    if (shouldSimulateError(0.1)) {
      throw new Error(`${this.name} API Error: Connection timeoput`);
    }

    const flights = this.generateMockFlights(params);

    return { flights };
  }

  private generateMockFlights(params: SearchParams) {
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 flights
    const flights = [];

    for (let i = 0; i < count; i++) {
      const departureTime = new Date(params.departureDate);
      departureTime.setHours(6 + i * 2, Math.random() * 60);

      const duration = 180 + Math.random() * 300;

      const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

      flights.push({
        pnr: `GDS${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        carrier: generateFlightNumber().substring(0, 2),
        flightNo: generateFlightNumber(),
        dep: {
          airport: params.origin,
          time: departureTime.toISOString(),
        },
        arr: {
          airport: params.destination,
          time: arrivalTime.toISOString(),
        },
        fare: {
          total: Math.floor(300 + Math.random() * 700),
          curr: "USD",
        },
        stops: Math.random() > 0.7 ? 1 : 0,
      });
    }
    return flights;
  }
}
