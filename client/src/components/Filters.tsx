// filterTreks.ts — updated for Tier 5 (Trekking Peaks) + month filtering
// Tier 4 = Thru-hike ("Thru" duration bucket)
// Tier 5 = Trekking Peaks (normal Short/Medium/Long duration buckets)

interface Filters {
  tier?: string | number | null;
  region?: string | null;
  accommodation?: string | null;
  duration?: string | null;
  difficulty?: string | null;
  month?: string | null;
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
    // Tier
    if (filters.tier && filters.tier !== "ALL" && filters.tier !== null) {
      const n = parseInt(String(filters.tier).replace(/\D/g, ""), 10);
      if (!isNaN(n) && trek.tier !== n) return false;
    }
    // Region
    if (filters.region && filters.region !== "ALL") {
      if (trek.region !== filters.region) return false;
    }
    // Accommodation
    if (filters.accommodation && filters.accommodation !== "ALL") {
      const acc = (trek.accommodation || "").toLowerCase();
      const fa = filters.accommodation.toLowerCase();
      if (!acc.includes(fa) && !fa.includes(acc)) return false;
    }
    // Duration — Tier 4 = Thru; Tier 5 uses normal buckets
    if (filters.duration && filters.duration !== "ALL") {
      const bucket = trek.durationBucket || getDurationBucket(trek.totalDays, trek.tier);
      if (bucket !== filters.duration) return false;
    }
    // Difficulty
    if (filters.difficulty && filters.difficulty !== "ALL") {
      if ((trek.difficulty || "").toLowerCase() !== filters.difficulty.toLowerCase()) return false;
    }
    // Month
    if (filters.month && filters.month !== "ALL") {
      const mn = parseInt(filters.month, 10);
      if (!isNaN(mn)) {
        const active = parseSeasonMonths(trek.season);
        if (active.length < 12 && !active.includes(mn)) return false;
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
