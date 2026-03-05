// filterTreks.ts
// Filters the trek list based on the active filter state.
// Duration uses the pre-computed "durationBucket" field (Short/Medium/Long/Epic/Thru)
// Tier 4 = Thru-hike. Duration "Thru" always matches tier-4 treks.

interface Filters {
  tier?: string | number | null;
  region?: string | null;
  accommodation?: string | null;
  duration?: string | null;
  difficulty?: string | null;
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