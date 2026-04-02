// filterTreks.ts — updated for Tier 5 (Trekking Peaks) + month filtering
// Tier 4 = Thru-hike ("Thru" duration bucket)
// Tier 5 = Trekking Peaks (normal Short/Medium/Long duration buckets)

interface Filters {
  tier?: string | number | null | string[];
  region?: string | null | string[];
  accommodation?: string | null | string[];
  duration?: string | null | string[];
  difficulty?: string | null;
  month?: string | null | string[];
  budget?: string | null | string[];
  popularity?: string | null | string[];
  terrain?: string | null | string[];
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

export function parseSeasonMonths(season: string | undefined): number[] {
  if (!season) return [];
  const s = season.toLowerCase().trim();
  if (s === "year-round" || s === "year round" || s === "all year") {
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }
  const active = new Set<number>();
  for (const seg of s.split(",").map(x => x.trim())) {
    const parts = seg.split("-").map(x => x.trim());
    if (parts.length === 2) {
      const start = MONTH_MAP[parts[0]];
      const end = MONTH_MAP[parts[1]];
      if (start && end) {
        if (end >= start) { for (let m = start; m <= end; m++) active.add(m); }
        else { for (let m = start; m <= 12; m++) active.add(m); for (let m = 1; m <= end; m++) active.add(m); }
      }
    } else if (parts.length === 1) {
      const m = MONTH_MAP[parts[0]]; if (m) active.add(m);
    }
  }
  return Array.from(active);
}

export function filterTreks(treks: any[], filters: Filters): any[] {
  return treks.filter((trek) => {
    // ── Tier (supports array from multi-select FilterState or single string) ──
    if (filters.tier && filters.tier !== "ALL" && filters.tier !== null) {
      if (Array.isArray(filters.tier)) {
        if (filters.tier.length > 0) {
          const nums = filters.tier.map(t => parseInt(String(t).replace(/\D/g, ""), 10));
          if (!nums.includes(trek.tier)) return false;
        }
      } else {
        const n = parseInt(String(filters.tier).replace(/\D/g, ""), 10);
        if (!isNaN(n) && trek.tier !== n) return false;
      }
    }
    // ── Region ───────────────────────────────────────────────────────────────
    if (filters.region && filters.region !== "ALL") {
      if (Array.isArray(filters.region)) {
        if (filters.region.length > 0 && !filters.region.includes(trek.region)) return false;
      } else {
        if (trek.region !== filters.region) return false;
      }
    }
    // ── Accommodation ─────────────────────────────────────────────────────────
    if (filters.accommodation && filters.accommodation !== "ALL") {
      if (Array.isArray(filters.accommodation)) {
        if (filters.accommodation.length > 0) {
          const acc = (trek.accommodation || "").toLowerCase();
          const match = filters.accommodation.some(fa => acc.includes(fa.toLowerCase()) || fa.toLowerCase().includes(acc));
          if (!match) return false;
        }
      } else {
        const acc = (trek.accommodation || "").toLowerCase();
        const fa = filters.accommodation.toLowerCase();
        if (!acc.includes(fa) && !fa.includes(acc)) return false;
      }
    }
    // ── Duration ──────────────────────────────────────────────────────────────
    if (filters.duration && filters.duration !== "ALL") {
      const bucket = trek.durationBucket || getDurationBucket(trek.totalDays, trek.tier);
      if (Array.isArray(filters.duration)) {
        if (filters.duration.length > 0 && !filters.duration.includes(bucket)) return false;
      } else {
        if (bucket !== filters.duration) return false;
      }
    }
    // ── Terrain ───────────────────────────────────────────────────────────────
    if (filters.terrain && filters.terrain !== "ALL") {
      if (Array.isArray(filters.terrain)) {
        if (filters.terrain.length > 0) {
          const terrainCat = getTerrainCategory(trek.terrain || "");
          if (!filters.terrain.includes(terrainCat)) return false;
        }
      }
    }
    // ── Popularity ────────────────────────────────────────────────────────────
    if (filters.popularity && filters.popularity !== "ALL") {
      if (Array.isArray(filters.popularity)) {
        if (filters.popularity.length > 0) {
          const popLabel = getPopularityLabel(trek.popularityScore);
          if (!filters.popularity.includes(popLabel)) return false;
        }
      }
    }
    // ── Budget ────────────────────────────────────────────────────────────────
    if (filters.budget && filters.budget !== "ALL") {
      if (Array.isArray(filters.budget)) {
        if (filters.budget.length > 0 && trek.budget && !filters.budget.includes(trek.budget)) return false;
      } else {
        if (trek.budget && trek.budget !== filters.budget) return false;
      }
    }
    // ── Difficulty ────────────────────────────────────────────────────────────
    if (filters.difficulty && filters.difficulty !== "ALL") {
      if ((trek.difficulty || "").toLowerCase() !== filters.difficulty.toLowerCase()) return false;
    }
    // ── Month ─────────────────────────────────────────────────────────────────
    if (filters.month && filters.month !== "ALL") {
      if (Array.isArray(filters.month)) {
        if (filters.month.length > 0) {
          const trekMonths: number[] = Array.isArray(trek.seasonMonths)
            ? trek.seasonMonths
            : parseSeasonMonths(trek.season);
          if (trekMonths.length > 0 && trekMonths.length < 12) {
            const selectedNums = filters.month.map(m => parseInt(m, 10)).filter(n => !isNaN(n));
            if (!selectedNums.some(m => trekMonths.includes(m))) return false;
          }
        }
      } else {
        const mn = parseInt(filters.month, 10);
        if (!isNaN(mn)) {
          const active = parseSeasonMonths(trek.season);
          if (active.length < 12 && !active.includes(mn)) return false;
        }
      }
    }
    return true;
  });
}

function getDurationBucket(totalDays: string | number | undefined, tier?: number): string {
  if (tier === 4) return "Thru";
  const match = String(totalDays || "").match(/\d+/);
  if (!match) return "Medium";
  const d = parseInt(match[0], 10);
  if (d <= 5) return "Short";
  if (d <= 10) return "Medium";
  if (d <= 16) return "Long";
  return "Epic";
}

function getTerrainCategory(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes("volcanic")) return "Volcanic";
  if (t.includes("coastal")) return "Coastal";
  if (t.includes("jungle") || t.includes("rainforest") || t.includes("tropical")) return "Jungle/Forest";
  if (t.includes("desert") || t.includes("canyon") || t.includes("wadi")) return "Desert";
  if (t.includes("arctic") || t.includes("tundra") || t.includes("glacial") || t.includes("glaciated")) return "Glacial/Arctic";
  if (t.includes("high alpine") || t.includes("high sierra") || t.includes("andean")) return "High Alpine";
  return "Alpine";
}

function getPopularityLabel(score: number): string {
  if (!score && score !== 0) return "Hidden Gem";
  if (score >= 8) return "Iconic";
  if (score >= 5) return "Popular";
  return "Hidden Gem";
}
