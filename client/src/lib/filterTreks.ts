// lib/filterTreks.ts — multi-select version
// Each filter is now an array. Empty array = "ALL".

interface Filters {
  tier?:          (string | number)[];
  region?:        string[];
  accommodation?: string[];
  terrain?:       string[];
  duration?:      string[];
  popularity?:    string[];
}

export function filterTreks(treks: any[], filters: Filters): any[] {
  return treks.filter((trek) => {

    // ── Tier ──────────────────────────────────────────────────────────────
    if (filters.tier?.length) {
      const nums = filters.tier.map(t => parseInt(String(t).replace(/\D/g,""), 10));
      if (!nums.includes(trek.tier)) return false;
    }

    // ── Region ────────────────────────────────────────────────────────────
    if (filters.region?.length) {
      if (!filters.region.includes(trek.region)) return false;
    }

    // ── Accommodation ─────────────────────────────────────────────────────
    if (filters.accommodation?.length) {
      if (!filters.accommodation.includes(getAccommodationCategory(trek.accommodation))) return false;
    }

    // ── Terrain ───────────────────────────────────────────────────────────
    if (filters.terrain?.length) {
      if (!filters.terrain.includes(getTerrainCategory(trek.terrain))) return false;
    }

    // ── Duration ──────────────────────────────────────────────────────────
    if (filters.duration?.length) {
      if (!filters.duration.includes(getDurationBucket(trek.totalDays))) return false;
    }

    // ── Popularity ────────────────────────────────────────────────────────
    if (filters.popularity?.length) {
      if (!filters.popularity.includes(getPopularityBucket(trek.popularityScore))) return false;
    }

    return true;
  });
}

export function getAccommodationCategory(raw: string = ""): string {
  const a = raw.toLowerCase();
  if (a.includes("teahouse"))                                              return "Teahouses";
  if (a.includes("rifugio") || a.includes("refuge") || a.includes("hut") ||
      a.includes("albergue") || a.includes("gite") || a.includes("ryokan") ||
      a.includes("minshuku") || a.includes("monastery") || a.includes("cave"))
                                                                           return "Huts/Refuges";
  if (a.includes("guesthouse") || a.includes("homestay") || a.includes("hotel") ||
      a.includes("b&b") || a.includes("pension") || a.includes("lodge"))  return "Guesthouses";
  if (a.includes("camp") || a.includes("wilderness") || a.includes("backcountry"))
                                                                           return "Camping";
  return "Guesthouses";
}

export function getTerrainCategory(raw: string = ""): string {
  const t = raw.toLowerCase();
  if (t.includes("volcanic"))                                              return "Volcanic";
  if (t.includes("coastal") || t.includes("coast"))                       return "Coastal";
  if (t.includes("jungle") || t.includes("rainforest") ||
      t.includes("cloud forest") || t.includes("tropical"))               return "Jungle/Forest";
  if (t.includes("desert") || t.includes("canyon") ||
      t.includes("wadi") || t.includes("sandstone"))                      return "Desert";
  if (t.includes("arctic") || t.includes("tundra") ||
      t.includes("glacial") || t.includes("glaciated"))                   return "Glacial/Arctic";
  if (t.includes("high alpine") || t.includes("high sierra") ||
      t.includes("andean") || t.includes("high plateau") ||
      t.includes("high desert"))                                           return "High Alpine";
  if (t.includes("alpine"))                                               return "Alpine";
  return "Alpine";
}

export function getDurationBucket(totalDays: string | number | undefined): string {
  const m = String(totalDays ?? "").match(/\d+/);
  if (!m) return "Medium";
  const d = parseInt(m[0], 10);
  if (d <= 5)  return "Short";
  if (d <= 10) return "Medium";
  if (d <= 16) return "Long";
  return "Epic";
}

export function getPopularityBucket(score: number | undefined): string {
  if (!score) return "Hidden Gem";
  if (score >= 8) return "Iconic";
  if (score >= 5) return "Popular";
  return "Hidden Gem";
}
