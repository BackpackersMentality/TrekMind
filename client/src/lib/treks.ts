// client/src/lib/treks.ts
//
// OPTIMISATION: itineraries.json (212KB) is no longer imported at the top.
// Instead, getItineraryAsync() fetches only the specific trek's JSON on demand.
// All other functions (getAllTreks, getTrekById, editorial, etc.) are IDENTICAL
// to your original — nothing breaks.

import treksData     from '../data/treks.json';
import editorialData from '../data/editorial.json';
// ✅ itineraries.json import REMOVED — was 212KB loaded on every page

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

// ── Unchanged sync functions (identical to your original) ────────────────────

export function getAllTreks(): Trek[] {
  return (treksData || []) as Trek[];
}

export function getTrekById(id: string): Trek | null {
  const allTreks = treksData as Trek[];
  if (!allTreks || !Array.isArray(allTreks)) return null;

  const trek = allTreks.find((t) => t.id === id);
  if (!trek) return null;

  if (editorialData && typeof editorialData === 'object') {
    const editorial = (editorialData as any)[id];
    if (editorial) {
      return { ...trek, whySpecial: editorial.whySpecial, highlights: editorial.highlights };
    }
  }

  return trek;
}

export function getTreksByTier(tier: number): Trek[] {
  const allTreks = treksData as Trek[];
  if (!allTreks || !Array.isArray(allTreks)) return [];
  return allTreks.filter((t) => t.tier === tier);
}

export function getTreksByRegion(region: string): Trek[] {
  const allTreks = treksData as Trek[];
  if (!allTreks || !Array.isArray(allTreks)) return [];
  return allTreks.filter((t) => t.region === region);
}

export function getEditorialContent(trekId: string): any | null {
  if (!editorialData || typeof editorialData !== 'object') return null;

  const editorial = (editorialData as any)[trekId];
  if (editorial) return editorial;

  const trek = (treksData as Trek[])?.find((t) => t.id === trekId);
  if (!trek) return null;

  try {
    const normalizedName = trek.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    const entry = Object.entries(editorialData as any).find(
      ([key, val]: [string, any]) => key === normalizedName || val.name === trek.name
    );
    if (entry) return entry[1];
  } catch (e) {
    console.warn(`Error finding editorial for ${trekId}`);
  }

  return null;
}

// ── Legacy sync shim — kept so nothing crashes ───────────────────────────────
// Returns null. TrekDetail now uses getItineraryAsync() instead.
// Any component still calling this won't throw, it just gets null.
export function getItinerary(trekId: string): any[] | null {
  return null;
}

// ── NEW: Async per-trek itinerary loader ─────────────────────────────────────
// Fetches /data/itineraries/{trekId}.json — only 1–9KB per trek.
// In-memory cache prevents duplicate fetches within the same session.

const _itineraryCache = new Map<string, Promise<any[] | null>>();

export function getItineraryAsync(trekId: string): Promise<any[] | null> {
  if (!trekId) return Promise.resolve(null);

  if (!_itineraryCache.has(trekId)) {
    const promise = fetch(`/data/itineraries/${trekId}.json`)
      .then((res) => {
        if (!res.ok) {
          console.warn(`[treks] No itinerary file for "${trekId}" (${res.status})`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return null;
        return Array.isArray(data.itinerary) ? data.itinerary : null;
      })
      .catch((err) => {
        console.warn(`[treks] Failed to load itinerary for "${trekId}":`, err);
        return null;
      });

    _itineraryCache.set(trekId, promise);
  }

  return _itineraryCache.get(trekId)!;
}

// ── NEW: Async editorial — checks static editorial.json first, then trek JSON ─
export async function getEditorialContentAsync(trekId: string): Promise<any | null> {
  if (!trekId) return null;

  // Primary: static editorial.json (already imported, zero cost)
  const staticEd = getEditorialContent(trekId);
  if (staticEd) return staticEd;

  // Fallback: read whySpecial/highlights from the per-trek itinerary JSON
  try {
    const res = await fetch(`/data/itineraries/${trekId}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      whySpecial: data.whySpecial ?? null,
      highlights: data.highlights ?? data.keyHighlights ?? [],
    };
    return (result.whySpecial || result.highlights.length > 0) ? result : null;
  } catch {
    return null;
  }
}
