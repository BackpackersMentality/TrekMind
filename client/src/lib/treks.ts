import treksData from '../data/treks.json';
import itinerariesData from '../data/itineraries.json';
import editorialData from '../data/editorial.json';

export interface Trek {
  id: string;
  slug: string;
  name: string;
  region: string;
  country: string;
  durationDays: number;
  distanceKm: number;
  maxAltitudeM: number;
  difficulty: string;
  bestSeason: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  imageFilename: string;
  terrain: string;
  accommodation: string;
  permits: string;
  totalDays: string;
  distance: string;
  maxAltitude: number;
  season: string;
  best_season?: string; // Add optional for backward compatibility
}

export interface ItineraryDay {
  day: number;
  location: string;
  lat: number;
  lng: number;
  elevation: number;
  route: string;
  distance: string;
  notes: string;
}

export interface TrekItinerary {
  slug: string;
  days: ItineraryDay[];
}

export function getAllTreks(): Trek[] {
  const data = (treksData as any).treks || treksData;
  return data as any[];
}

export function getTrekById(id: string): Trek | undefined {
  const treks = getAllTreks();
  return treks.find(t => t.id === id || t.slug === id);
}

export function getItinerary(slug: string): ItineraryDay[] | undefined {
  const data = (itinerariesData as any).itineraries || itinerariesData;
  const item = (data as any[]).find((i: any) => i.slug === slug);
  return item?.days;
}

export function getEditorialContent(slug: string) {
  const data = (editorialData as any).editorialContent || editorialData;
  return (data as any)[slug];
}
