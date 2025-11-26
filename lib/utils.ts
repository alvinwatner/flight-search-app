// lib/utils.ts

/**
 * Format ISO timestamp to readable time
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format duration in minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format date string to human-readable format
 * Example: "2025-01-15" → "January 15, 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Map airport codes to city names
 */
export function getAirportCity(code: string): string {
  const cities: Record<string, string> = {
    'JFK': 'New York',
    'LAX': 'Los Angeles',
    'SFO': 'San Francisco',
    'ORD': 'Chicago',
    'MIA': 'Miami',
    'DFW': 'Dallas',
    'SEA': 'Seattle',
    'BOS': 'Boston',
    'ATL': 'Atlanta',
    'DEN': 'Denver',
    'LAS': 'Las Vegas',
    'PHX': 'Phoenix',
    'IAH': 'Houston',
    'MCO': 'Orlando'
  };
  return cities[code] || code;
}
