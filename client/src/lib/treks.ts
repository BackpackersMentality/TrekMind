// client/src/lib/treks.ts
// ─────────────────────────────────────────────────────────────────────────────
// Static JSON imports — Vite bundles these at build time.
// REQUIRED FILES IN REPO:
//   client/src/data/treks.json      ← copy of treks_with_season_months.json
//   client/src/data/editorial.json  ← copy of editorial_full.json
//
// itineraries.json removed from static import (was 212KB).
// Individual itinerary files are fetched on demand via getItineraryAsync().
// ─────────────────────────────────────────────────────────────────────────────

import treksData     from '../data/treks.json';
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
  seasonMonths?: number[]; // pre-computed month numbers for filter — added in treks_with_season_months.json
  bestSeason?: string;
  best_season?: string;
  tier: number;
  latitude: number;
  longitude: number;
  imageFilename: string;
  popularityScore?: number;
  whySpecial?: string;
  highlights?: string[];
  keyFeatures?: string;
}

// ── Null-safe data access ────────────────────────────────────────────────────
// Both treksData and editorialData could theoretically be undefined during SSR
// or if the JSON file is missing — these guards prevent runtime crashes.

const _treks: Trek[] = Array.isArray(treksData) ? (treksData as Trek[]) : [];
const _editorial: Record<string, any> = (editorialData && typeof editorialData === 'object')
  ? (editorialData as Record<string, any>)
  : {};

// ── Core sync functions ───────────────────────────────────────────────────────

export function getAllTreks(): Trek[] {
  return _treks; // always an array, never null
}

export function getTrekById(id: string): Trek | null {
  if (!id) return null;
  const trek = _treks.find((t) => t.id === id);
  if (!trek) return null;

  const editorial = _editorial[id];
  if (editorial) {
    return { ...trek, whySpecial: editorial.whySpecial, highlights: editorial.highlights };
  }
  return trek;
}

export function getTreksByTier(tier: number): Trek[] {
  return _treks.filter((t) => t.tier === tier);
}

export function getTreksByRegion(region: string): Trek[] {
  return _treks.filter((t) => t.region === region);
}

export function getEditorialContent(trekId: string): any | null {
  if (!trekId) return null;

  // Direct key lookup first
  const direct = _editorial[trekId];
  if (direct) return direct;

  // Fallback: match by normalised name or name property
  const trek = _treks.find((t) => t.id === trekId);
  if (!trek) return null;

  try {
    const normalizedName = trek.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    const entry = Object.entries(_editorial).find(
      ([key, val]) => key === normalizedName || (val as any).name === trek.name
    );
    if (entry) return entry[1];
  } catch {
    console.warn(`[treks] Error finding editorial for ${trekId}`);
  }

  return null;
}

// ── Legacy sync shim — returns null, prevents import errors ──────────────────
// TrekDetail uses getItineraryAsync() instead.
export function getItinerary(_trekId: string): any[] | null {
  return null;
}

// ── Async per-trek itinerary loader ──────────────────────────────────────────
// Fetches /data/itineraries/{trekId}.json on demand (1–9KB per file).
// In-memory cache prevents duplicate fetches within the same session.

const _itineraryCache = new Map<string, Promise<any[] | null>>();

export function getItineraryAsync(trekId: string): Promise<any[] | null> {
  if (!trekId) return Promise.resolve(null);

  if (!_itineraryCache.has(trekId)) {
    const promise = fetch(`/data/itineraries/${trekId}.json`)
      .then((res) => {
        if (!res.ok) {
          console.warn(`[treks] No itinerary for "${trekId}" (${res.status})`);
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

// ── Async editorial loader ────────────────────────────────────────────────────
export async function getEditorialContentAsync(trekId: string): Promise<any | null> {
  if (!trekId) return null;

  // Primary: static editorial.json (already imported, zero cost)
  const staticEd = getEditorialContent(trekId);
  if (staticEd) return staticEd;

  // Fallback: read from per-trek itinerary JSON
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
