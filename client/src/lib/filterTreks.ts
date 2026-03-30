// lib/filterTreks.ts
// ─────────────────────────────────────────────────────────────────────────────
// Month filter fix — uses pre-computed trek.seasonMonths[] array instead of
// parsing the "season" string at runtime. This prevents blank-screen crashes
// caused by unhandled season string formats (e.g. "March-May & Sep-Nov").
//
// SETUP REQUIRED:
//   1. Add "seasonMonths": [3,4,5,10,11] to every entry in treks.json
//      (use the pre-computed treks_with_season_months.json output)
//   2. "season" string stays for display on trek cards and detail pages — untouched
//   3. FilterState must include "month" in its type (see types/filters.ts snippet below)
//
// ─────────────────────────────────────────────────────────────────────────────

// ── types/filters.ts additions ────────────────────────────────────────────────
// Add "month" to FilterState and EMPTY_FILTERS:
//
//   export interface FilterState {
//     tier:          string[];
//     region:        string[];
//     duration:      string[];
//     terrain:       string[];
//     accommodation: string[];
//     popularity:    string[];
//     month:         string[];   // ← ADD THIS
//   }
//
//   export const EMPTY_FILTERS: FilterState = {
//     tier: [], region: [], duration: [], terrain: [],
//     accommodation: [], popularity: [],
//     month: [],                          // ← ADD THIS
//   };
//
//   export function countActiveFilters(f: FilterState): number {
//     return Object.values(f).reduce((n, v) => n + v.length, 0);
//   }
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterState {
  tier:          string[];
  region:        string[];
  duration:      string[];
  terrain:       string[];
  accommodation: string[];
  popularity:    string[];
  month:         string[]; // numeric strings "1"–"12"
}

export const EMPTY_FILTERS: FilterState = {
  tier: [], region: [], duration: [], terrain: [],
  accommodation: [], popularity: [], month: [],
};

export function countActiveFilters(f: FilterState): number {
  return Object.values(f).reduce((n, v) => n + v.length, 0);
}

// ── Safe month filter ─────────────────────────────────────────────────────────
// Reads trek.seasonMonths (pre-computed number[]) instead of parsing season string.
// Year-round treks have seasonMonths = [1..12] and always pass.
// Treks without seasonMonths field default to year-round (no crash).
function matchesMonth(trek: any, selectedMonths: string[]): boolean {
  if (!selectedMonths.length) return true;
  const trekMonths: number[] = Array.isArray(trek.seasonMonths)
    ? trek.seasonMonths
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // safe fallback: year-round
  if (trekMonths.length >= 12) return true; // year-round always passes
  return selectedMonths.some(m => trekMonths.includes(parseInt(m, 10)));
}

// ── Duration bucket ───────────────────────────────────────────────────────────
function getDurationBucket(totalDays: any, tier?: number): string {
  if (tier === 4) return "Thru";
  const m = String(totalDays ?? "").match(/\d+/);
  if (!m) return "Medium";
  const d = parseInt(m[0], 10);
  if (d <= 5)  return "Short";
  if (d <= 10) return "Medium";
  if (d <= 16) return "Long";
  return "Epic";
}

// ── Accommodation bucket ──────────────────────────────────────────────────────
function getAccommodationCategory(raw = ""): string {
  const a = raw.toLowerCase();
  if (a.includes("teahouse")) return "Teahouses";
  if (a.includes("rifugio") || a.includes("refuge") || a.includes("hut") ||
      a.includes("albergue") || a.includes("gite") || a.includes("ryokan") ||
      a.includes("minshuku") || a.includes("monastery") || a.includes("cave")) return "Huts/Refuges";
  if (a.includes("guesthouse") || a.includes("homestay") || a.includes("hotel") ||
      a.includes("b&b") || a.includes("pension") || a.includes("lodge")) return "Guesthouses";
  if (a.includes("camp") || a.includes("wilderness") || a.includes("backcountry")) return "Camping";
  return "Guesthouses";
}

// ── Terrain bucket ────────────────────────────────────────────────────────────
function getTerrainCategory(raw = ""): string {
  const t = raw.toLowerCase();
  if (t.includes("volcanic")) return "Volcanic";
  if (t.includes("coastal")) return "Coastal";
  if (t.includes("jungle") || t.includes("rainforest") || t.includes("tropical")) return "Jungle/Forest";
  if (t.includes("desert") || t.includes("canyon") || t.includes("wadi")) return "Desert";
  if (t.includes("arctic") || t.includes("tundra") || t.includes("glacial") || t.includes("glaciated")) return "Glacial/Arctic";
  if (t.includes("high alpine") || t.includes("high sierra") || t.includes("andean")) return "High Alpine";
  return "Alpine";
}

// ── Popularity bucket ─────────────────────────────────────────────────────────
function getPopularityBucket(s: any): string {
  return !s ? "Hidden Gem" : s >= 8 ? "Iconic" : s >= 5 ? "Popular" : "Hidden Gem";
}

// ── Main filter function ──────────────────────────────────────────────────────
export function filterTreks(treks: any[], filters: FilterState): any[] {
  return treks.filter(trek => {
    // Tier
    if (filters.tier.length) {
      const nums = filters.tier.map(t => parseInt(String(t).replace(/\D/g, ""), 10));
      if (!nums.includes(trek.tier)) return false;
    }

    // Region
    if (filters.region.length && !filters.region.includes(trek.region)) return false;

    // Duration (Tier 4 → always "Thru"; Tier 5 uses normal buckets)
    if (filters.duration.length) {
      const bucket = getDurationBucket(trek.totalDays, trek.tier);
      if (!filters.duration.includes(bucket)) return false;
    }

    // Terrain
    if (filters.terrain.length && !filters.terrain.includes(getTerrainCategory(trek.terrain))) return false;

    // Accommodation
    if (filters.accommodation.length && !filters.accommodation.includes(getAccommodationCategory(trek.accommodation))) return false;

    // Popularity
    if (filters.popularity.length && !filters.popularity.includes(getPopularityBucket(trek.popularityScore))) return false;

    // Month — SAFE: reads seasonMonths[], never parses season string at runtime
    if (!matchesMonth(trek, filters.month)) return false;

    return true;
  });
}

// ── Script: pre-compute seasonMonths for treks.json ──────────────────────────
// Run this once (Node.js) to add seasonMonths to your treks.json:
//
// import * as fs from "fs";
//
// const MONTH_MAP: Record<string, number> = {
//   jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,
//   jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,
//   oct:10,october:10,nov:11,november:11,dec:12,december:12,
// };
//
// function parseSeasonMonths(season: string): number[] {
//   if (!season) return [1,2,3,4,5,6,7,8,9,10,11,12];
//   const s = season.toLowerCase();
//   if (s.includes("year") || s.includes("all year")) return [1,2,3,4,5,6,7,8,9,10,11,12];
//   const active = new Set<number>();
//   const normalised = s.replace(/\s*(&|;|\band\b)\s*/g, ",");
//   for (const seg of normalised.split(",")) {
//     const words = seg.match(/[a-z]+/g)?.filter(w => w in MONTH_MAP) ?? [];
//     if (words.length === 2) {
//       const [start, end] = [MONTH_MAP[words[0]], MONTH_MAP[words[1]]];
//       if (end >= start) { for (let m=start; m<=end; m++) active.add(m); }
//       else { for (let m=start; m<=12; m++) active.add(m); for (let m=1; m<=end; m++) active.add(m); }
//     } else if (words.length === 1) { active.add(MONTH_MAP[words[0]]); }
//   }
//   return active.size ? [...active].sort((a,b)=>a-b) : [1,2,3,4,5,6,7,8,9,10,11,12];
// }
//
// const treks = JSON.parse(fs.readFileSync("treks.json", "utf8"));
// treks.forEach((t: any) => { t.seasonMonths = parseSeasonMonths(t.season ?? ""); });
// fs.writeFileSync("treks.json", JSON.stringify(treks, null, 2));
// console.log(`Updated ${treks.length} treks with seasonMonths field`);
