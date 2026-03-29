// filterTreks.ts
// Filters the trek list based on the active filter state.
// Duration uses the pre-computed "durationBucket" field (Short/Medium/Long/Epic/Thru)
// Tier 4 = Thru-hike. Duration "Thru" always matches tier-4 treks.
// Month filter matches treks whose season string includes the selected month(s).

interface Filters {
  tier?: string | number | null;
  region?: string | null;
  accommodation?: string | null;
  duration?: string | null;
  difficulty?: string | null;
  month?: string | null;
}

// Maps abbreviated and full month names to numeric indices (1–12)
const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Parses a season string like "March-May, October-November" or "Year-round"
 * and returns an array of active month numbers (1–12).
 */
export function parseSeasonMonths(season: string | undefined): number[] {
  if (!season) return [];
  const s = season.toLowerCase().trim();
  if (s === "year-round" || s === "year round" || s === "all year") {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  const active = new Set<number>();

  // Split on commas to handle multiple windows e.g. "March-May, October-November"
  const segments = s.split(",").map((x) => x.trim());

  for (const seg of segments) {
    const rangeParts = seg.split("-").map((x) => x.trim());
    if (rangeParts.length === 2) {
      const start = MONTH_MAP[rangeParts[0]];
      const end = MONTH_MAP[rangeParts[1]];
      if (start && end) {
        if (end >= start) {
          for (let m = start; m <= end; m++) active.add(m);
        } else {
          // Wraps year boundary e.g. "November-February"
          for (let m = start; m <= 12; m++) active.add(m);
          for (let m = 1; m <= end; m++) active.add(m);
        }
      }
    } else if (rangeParts.length === 1) {
      const m = MONTH_MAP[rangeParts[0]];
      if (m) active.add(m);
    }
  }

  return Array.from(active);
}

export function filterTreks(treks: any[], filters: Filters): any[] {
  return treks.filter((trek) => {
    // ── Tier ────────────────────────────────────────────────────────────────
    if (filters.tier && filters.tier !== "ALL" && filters.tier !== null) {
      const filterTierNum = parseInt(String(filters.tier).replace(/\D/g, ""), 10);
      if (!isNaN(filterTierNum) && trek.tier !== filterTierNum) return false;
    }

    // ── Region ──────────────────────────────────────────────────────────────
    if (filters.region && filters.region !== "ALL") {
      if (trek.region !== filters.region) return false;
    }

    // ── Accommodation ────────────────────────────────────────────────────────
    if (filters.accommodation && filters.accommodation !== "ALL") {
      const acc = (trek.accommodation || "").toLowerCase();
      const filterAcc = filters.accommodation.toLowerCase();
      if (!acc.includes(filterAcc) && !filterAcc.includes(acc)) return false;
    }

    // ── Duration ─────────────────────────────────────────────────────────────
    // "Thru" always matches tier-4 treks regardless of totalDays string value
    if (filters.duration && filters.duration !== "ALL") {
      const bucket = trek.durationBucket || getDurationBucket(trek.totalDays, trek.tier);
      if (bucket !== filters.duration) return false;
    }

    // ── Difficulty ───────────────────────────────────────────────────────────
    if (filters.difficulty && filters.difficulty !== "ALL") {
      if ((trek.difficulty || "").toLowerCase() !== filters.difficulty.toLowerCase()) return false;
    }

    // ── Month ─────────────────────────────────────────────────────────────────
    // Checks if the selected month number falls within the trek's season window.
    if (filters.month && filters.month !== "ALL") {
      const selectedMonthNum = parseInt(filters.month, 10);
      if (!isNaN(selectedMonthNum)) {
        const activeMonths = parseSeasonMonths(trek.season);
        // Year-round treks (full 12-month array) always pass
        if (activeMonths.length < 12 && !activeMonths.includes(selectedMonthNum)) return false;
      }
    }

    return true;
  });
}

// Compute duration bucket from totalDays string.
// Tier 4 (thru-hikes) always return "Thru" — their totalDays encodes
// full distance e.g. "150 days (thru) / 3-14 days (sections)" which
// would otherwise match "Epic" on the first number.
function getDurationBucket(totalDays: string | number | undefined, tier?: number): string {
  if (tier === 4) return "Thru";
  const match = String(totalDays || "").match(/\d+/);
  if (!match) return "Medium";
  const days = parseInt(match[0], 10);
  if (days <= 5)  return "Short";
  if (days <= 10) return "Medium";
  if (days <= 16) return "Long";
  return "Epic";
}
