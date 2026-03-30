// types/filters.ts
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Added month: string[] to FilterState and EMPTY_FILTERS.
// This resolves the blank-screen crash when the month filter is used.
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterState {
  tier:          string[];
  region:        string[];
  duration:      string[];
  terrain:       string[];
  accommodation: string[];
  popularity:    string[];
  month:         string[]; // ← ADDED: numeric strings "1"–"12"
}

export const EMPTY_FILTERS: FilterState = {
  tier:          [],
  region:        [],
  duration:      [],
  terrain:       [],
  accommodation: [],
  popularity:    [],
  month:         [], // ← ADDED: must be [] not undefined
};

export function countActiveFilters(f: FilterState): number {
  // Null-safe: guard each field with ?? []
  return (
    (f.tier          ?? []).length +
    (f.region        ?? []).length +
    (f.duration      ?? []).length +
    (f.terrain       ?? []).length +
    (f.accommodation ?? []).length +
    (f.popularity    ?? []).length +
    (f.month         ?? []).length  // ← ADDED
  );
}

export type FilterKey = keyof FilterState;
