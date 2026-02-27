// filterTreks.ts
// Filters the trek list based on the active filter state.
// Duration uses the pre-computed "durationBucket" field (Short/Medium/Long)
// based on totalDays: Short ≤7 days, Medium 8-14 days, Long ≥15 days.
// Difficulty uses the "difficulty" field (Easy/Moderate/Hard/Extreme).

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
      // Handle both numeric (1) and string formats ("Tier 1", "1")
      const filterTierNum = parseInt(String(filters.tier).replace(/\D/g, ""), 10);
      if (!isNaN(filterTierNum) && trek.tier !== filterTierNum) return false;
    }

    // ── Region ──────────────────────────────────────────────────────────────
    if (filters.region && filters.region !== "ALL") {
      if (trek.region !== filters.region) return false;
    }

    // ── Accommodation ────────────────────────────────────────────────────────
    if (filters.accommodation && filters.accommodation !== "ALL") {
      // Fuzzy match: "Huts/Refugios" should match filter "Huts"
      const acc = (trek.accommodation || "").toLowerCase();
      const filterAcc = filters.accommodation.toLowerCase();
      if (!acc.includes(filterAcc) && !filterAcc.includes(acc)) return false;
    }

    // ── Duration — uses durationBucket field ─────────────────────────────────
    // Short: ≤7 days | Medium: 8–14 days | Long: ≥15 days
    if (filters.duration && filters.duration !== "ALL") {
      const bucket = trek.durationBucket || getDurationBucket(trek.totalDays);
      if (bucket !== filters.duration) return false;
    }

    // ── Difficulty — uses difficulty field ───────────────────────────────────
    // Easy | Moderate | Hard | Extreme
    if (filters.difficulty && filters.difficulty !== "ALL") {
      if ((trek.difficulty || "").toLowerCase() !== filters.difficulty.toLowerCase()) return false;
    }

    return true;
  });
}

// Fallback: compute duration bucket from totalDays string if field missing
function getDurationBucket(totalDays: string | number | undefined): string {
  const match = String(totalDays || "").match(/\d+/);
  if (!match) return "Medium";
  const days = parseInt(match[0], 10);
  if (days <= 7) return "Short";
  if (days <= 14) return "Medium";
  return "Long";
}
