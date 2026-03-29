// ─────────────────────────────────────────────────────────────────────────────
// TrekFinder.tsx — Tier 5 patches
// Apply these targeted changes to TrekFinder__3_.tsx
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. REPLACE deriveDifficulty (line ~46) ────────────────────────────────────
// Tier 5 = always "Extreme" (high altitude + technical gear required)
function deriveDifficulty(trek: any): "Easy" | "Moderate" | "Hard" | "Extreme" {
  const alt = parseAlt(trek.maxAltitude);
  const tier = trek.tier;
  if (tier === 5)          return "Extreme"; // trekking peaks
  if (alt >= 5000 || tier >= 4) return "Extreme";
  if (alt >= 4000 || tier === 3) return "Hard";
  if (alt >= 2500 || tier === 2) return "Moderate";
  return "Easy";
}

// ── 2. REPLACE scoreTrek() experience rank + vibe + tier bonus ────────────────
// Inside scoreTrek(), make these changes:

// a) expRank — add alpinist
const expRank: Record<string, number> = {
  beginner: 1, intermediate: 2, experienced: 3, expert: 4, alpinist: 4,
};

// b) vibe scoring — add summit case (add alongside existing vibe checks)
if (prefs.vibe === "summit" && trek.tier === 5) {
  score += 10;
  reasons.push(`Tier 5 trekking peak — the gateway to alpinism`);
}

// c) Tier bonus — replace the existing line (near bottom of scoreTrek):
// OLD: score += Math.max(0, (4 - trek.tier)) * 3;
// NEW:
const tierBonus = trek.tier === 5
  ? (prefs.altitude === "extreme" ? 8 : 2) // peaks get a small base + big bonus if extreme altitude
  : Math.max(0, (4 - trek.tier)) * 3;
// score += tierBonus;   ← assign this instead

// ── 3. ADD to STEPS vibe options array ────────────────────────────────────────
// In the vibe step, add this option:
const newVibeOption = {
  value: "summit",
  icon: "🗻",
  label: "Summit a peak",
  sub: "Crampons, ice axe, first alpinism",
};

// ── 4. ADD to Prefs interface ─────────────────────────────────────────────────
// vibe: "iconic" | "remote" | "scenic" | "cultural" | "summit" | "";

// ── 5. UPDATE MAX_SCORE line ──────────────────────────────────────────────────
// Old: const MAX_SCORE = 30 + 25 + 20 + 15 + 15 + 10 + 9;
// New: const MAX_SCORE = 30 + 25 + 20 + 15 + 15 + 10 + 8;
// (tier bonus for T5 at extreme alt = 8, matches old max T1 bonus)
