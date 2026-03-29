// filterOptions.ts
// Complete filter options for TrekMind including Tier 5 (Trekking Peaks) and month filter.
// Import these into your filter panel / FilterGroup components.

export const TIER_OPTIONS = [
  { value: "1", label: "Tier 1 — Iconic" },
  { value: "2", label: "Tier 2 — Classic" },
  { value: "3", label: "Tier 3 — Remote" },
  { value: "4", label: "Tier 4 — Thru-Hike" },
  { value: "5", label: "Tier 5 — Trekking Peak" },
];

export const REGION_OPTIONS = [
  { value: "Asia", label: "Asia" },
  { value: "Europe", label: "Europe" },
  { value: "South America", label: "South America" },
  { value: "North America", label: "North America" },
  { value: "Africa", label: "Africa" },
  { value: "Oceania", label: "Oceania" },
  { value: "Central America", label: "Central America" },
];

export const DURATION_OPTIONS = [
  { value: "Short",  label: "Short (1–5 days)" },
  { value: "Medium", label: "Medium (6–10 days)" },
  { value: "Long",   label: "Long (11–16 days)" },
  { value: "Epic",   label: "Epic (17+ days)" },
  { value: "Thru",   label: "Thru-Hike (months)" },
];

export const ACCOMMODATION_OPTIONS = [
  { value: "teahouse", label: "Teahouses / Huts" },
  { value: "camping",  label: "Camping" },
  { value: "lodge",    label: "Lodges" },
  { value: "mixed",    label: "Mixed" },
];

// Month filter — value is numeric string (1–12) matching parseSeasonMonths() output
export const MONTH_OPTIONS = [
  { value: "1",  label: "Jan" },
  { value: "2",  label: "Feb" },
  { value: "3",  label: "Mar" },
  { value: "4",  label: "Apr" },
  { value: "5",  label: "May" },
  { value: "6",  label: "Jun" },
  { value: "7",  label: "Jul" },
  { value: "8",  label: "Aug" },
  { value: "9",  label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

// ─── Usage example ────────────────────────────────────────────────────────────
//
// <FilterGroup
//   label="Tier"
//   name="tier"
//   options={TIER_OPTIONS}
//   selected={activeFilters.tier ? [activeFilters.tier] : []}
//   onChange={(val) => setFilter("tier", val)}
// />
//
// <FilterGroup
//   label="When to Trek"
//   name="month"
//   options={MONTH_OPTIONS}
//   selected={activeFilters.month ? [activeFilters.month] : []}
//   onChange={(val) => setFilter("month", val)}
// />
//
// Tier 5 pin colour (rose) — add to your globe pin colour map:
//   case 5: return "#f43f5e"; // rose-500
