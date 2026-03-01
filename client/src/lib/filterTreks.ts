// lib/filterTreks.ts
// All filters map to real fields in treks.json.
// Accommodation + terrain use category matching since raw values are verbose strings.

interface Filters {
  tier?:          string | number | null;
  region?:        string | null;
  accommodation?: string | null;
  terrain?:       string | null;
  duration?:      string | null;
  popularity?:    string | null;
}

export function filterTreks(treks: any[], filters: Filters): any[] {
  return treks.filter((trek) => {

    // ── Tier: matches trek.tier (1 | 2 | 3) ──────────────────────────────
    if (filters.tier && filters.tier !== "ALL") {
      const n = parseInt(String(filters.tier).replace(/\D/g, ""), 10);
      if (!isNaN(n) && trek.tier !== n) return false;
    }

    // ── Region: matches trek.region exactly ───────────────────────────────
    if (filters.region && filters.region !== "ALL") {
      if (trek.region !== filters.region) return false;
    }

    // ── Accommodation: category-matched against trek.accommodation ────────
    // Raw values are verbose ("Camping, refugios", "Mountain huts, camping")
    // so we bucket them before comparing.
    if (filters.accommodation && filters.accommodation !== "ALL") {
      if (getAccommodationCategory(trek.accommodation) !== filters.accommodation) return false;
    }

    // ── Terrain: category-matched against trek.terrain ────────────────────
    // 54 raw terrain strings → 7 categories
    if (filters.terrain && filters.terrain !== "ALL") {
      if (getTerrainCategory(trek.terrain) !== filters.terrain) return false;
    }

    // ── Duration: bucketed from trek.totalDays string ─────────────────────
    if (filters.duration && filters.duration !== "ALL") {
      if (getDurationBucket(trek.totalDays) !== filters.duration) return false;
    }

    // ── Popularity: bucketed from trek.popularityScore (1–10) ────────────
    if (filters.popularity && filters.popularity !== "ALL") {
      if (getPopularityBucket(trek.popularityScore) !== filters.popularity) return false;
    }

    return true;
  });
}

// ── Category helpers (exported so FilterPopup can use same logic) ─────────────

export function getAccommodationCategory(raw: string = ""): string {
  const a = raw.toLowerCase();
  if (a.includes("teahouse"))                                             return "Teahouses";
  if (a.includes("rifugio") || a.includes("refuge") || a.includes("hut") ||
      a.includes("albergue") || a.includes("gite") || a.includes("ryokan") ||
      a.includes("minshuku") || a.includes("monastery") || a.includes("cave") ||
      a.includes("public hut") || a.includes("mountain hut"))            return "Huts/Refuges";
  if (a.includes("guesthouse") || a.includes("homestay") || a.includes("hotel") ||
      a.includes("b&b") || a.includes("pension") || a.includes("lodge"))  return "Guesthouses";
  if (a.includes("camp") || a.includes("wilderness") || a.includes("backcountry"))
                                                                          return "Camping";
  return "Guesthouses"; // fallback
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
  return "Alpine"; // fallback — most treks are some form of alpine
}

export function getDurationBucket(totalDays: string | number | undefined): string {
  const m = String(totalDays ?? "").match(/\d+/);
  if (!m) return "Medium";
  const d = parseInt(m[0], 10);
  if (d <= 5)  return "Short";   // 1–5 days
  if (d <= 10) return "Medium";  // 6–10 days
  if (d <= 16) return "Long";    // 11–16 days
  return "Epic";                 // 17+ days
}

export function getPopularityBucket(score: number | undefined): string {
  if (!score) return "Hidden Gem";
  if (score >= 8) return "Iconic";     // 20 treks
  if (score >= 5) return "Popular";    // 22 treks
  return "Hidden Gem";                 // 24 treks
}
