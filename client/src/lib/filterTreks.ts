export interface Trek {
  id: string;
  name: string;
  region: string;
  country: string;
  totalDays: string;
  maxAltitude: string;
  accommodation: string;
  tier: number;
  [key: string]: any;
}

interface Filters {
  tier: number | null;
  region: string | null;
  accommodation: string | null;
  duration: string | null;
  difficulty: string | null;
}

// Helper to calculate difficulty from trek data
function calculateDifficulty(trek: Trek): string {
  const altitude = parseInt(trek.maxAltitude);
  const days = parseInt(trek.totalDays);
  
  if (altitude > 5000 || days > 20) return 'Extreme';
  if (altitude > 4000 || days > 12) return 'Hard';
  if (altitude > 3000 || days > 7) return 'Moderate';
  return 'Easy';
}

// Helper to categorize accommodation
function categorizeAccommodation(accommodation: string): string {
  const lower = (accommodation || '').toLowerCase();
  if (lower.includes('camping') && !lower.includes(',')) return 'Camping';
  if (lower.includes('teahouse')) return 'Teahouses';
  if (lower.includes('hut') || lower.includes('refuge') || lower.includes('rifugio')) return 'Huts/Refugios';
  if (lower.includes('hotel') || lower.includes('lodge') || lower.includes('b&b') || lower.includes('guesthouse')) return 'Hotels/Lodges';
  return 'Mixed';
}

// Helper to categorize duration
function categorizeDuration(totalDays: string): string {
  const days = parseInt(totalDays);
  if (days <= 4) return 'Short';
  if (days <= 9) return 'Medium';
  return 'Long';
}

export function filterTreks(treks: Trek[], filters: Filters): Trek[] {
  if (!treks) return [];
  return treks.filter(trek => {
    // Tier filter
    if (filters.tier !== null && trek.tier !== filters.tier) {
      return false;
    }
    
    // Region filter
    if (filters.region !== null && trek.region !== filters.region) {
      return false;
    }
    
    // Accommodation filter
    if (filters.accommodation !== null) {
      const trekAccom = categorizeAccommodation(trek.accommodation);
      if (trekAccom !== filters.accommodation) {
        return false;
      }
    }
    
    // Duration filter
    if (filters.duration !== null) {
      const trekDuration = categorizeDuration(trek.totalDays);
      if (trekDuration !== filters.duration) {
        return false;
      }
    }
    
    // Difficulty filter
    if (filters.difficulty !== null) {
      const trekDifficulty = calculateDifficulty(trek);
      if (trekDifficulty !== filters.difficulty) {
        return false;
      }
    }
    
    return true;
  });
}
