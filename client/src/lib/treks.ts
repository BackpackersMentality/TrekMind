// client/src/lib/treks.ts
import treksData from '../data/treks.json';
import itinerariesData from '../data/itineraries.json';
import editorialData from '../data/editorial.json';

export interface Trek {
  id: string;
  slug?: string;
  name: string;
  region: string;
  country: string;
  durationDays?: number;
  totalDays?: string;
  distanceKm?: number;
  distance?: string;
  maxAltitudeM?: number;
  maxAltitude?: string;
  difficulty?: string;
  terrain: string;
  accommodation: string;
  permits: string;
  season?: string;
  bestSeason?: string;
  best_season?: string;
  tier: number;
  latitude: number;
  longitude: number;
  imageFilename: string;
  whySpecial?: string;
  highlights?: string[];
  keyFeatures?: string;
}

export function getAllTreks(): Trek[] {
  return (treksData || []) as Trek[];
}

export function getTrekById(id: string): Trek | null {
  const allTreks = treksData as Trek[];
  if (!allTreks || !Array.isArray(allTreks)) return null;
  
  const trek = allTreks.find((t) => t.id === id);
  if (!trek) return null;
  
  // Merge in editorial content if available
  if (editorialData && typeof editorialData === 'object') {
    const editorial = (editorialData as any)[id];
    if (editorial) {
      return {
        ...trek,
        whySpecial: editorial.whySpecial,
        highlights: editorial.highlights
      };
    }
  }
  
  return trek;
}

export function getTreksByTier(tier: number): Trek[] {
  const allTreks = treksData as Trek[];
  if (!allTreks || !Array.isArray(allTreks)) return [];
  return allTreks.filter((t) => t.tier === tier);
}

export function getItinerary(trekId: string): any[] | null {
  if (!itinerariesData || typeof itinerariesData !== 'object') {
    console.warn('Itineraries data not loaded');
    return null;
  }
  
  const data = (itinerariesData as any)[trekId];
  if (!data) {
    console.warn(`No itinerary found for trek: ${trekId}`);
    return null;
  }
  
  // Return just the itinerary array
  return Array.isArray(data.itinerary) ? data.itinerary : null;
}

export function getTreksByRegion(region: string): Trek[] {
  const allTreks = treksData as Trek[];
  if (!allTreks || !Array.isArray(allTreks)) return [];
  return allTreks.filter((t) => t.region === region);
}

export function getEditorialContent(trekId: string): any | null {
  if (!editorialData || typeof editorialData !== 'object') {
    console.warn('Editorial data not loaded');
    return null;
  }
  
  // Use slug or id to match
  const editorial = (editorialData as any)[trekId];
  if (editorial) return editorial;

  // Fallback: search by name normalization
  const trek = (treksData as Trek[])?.find((t) => t.id === trekId);
  if (!trek) return null;

  // Try to find by name normalization
  try {
    const normalizedName = trek.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    const entry = Object.entries(editorialData as any).find(([key, val]: [string, any]) => 
      key === normalizedName || val.name === trek.name
    );

    if (entry) return entry[1];
  } catch (e) {
    console.warn(`Error finding editorial for ${trekId}`);
  }

  return null;
}
