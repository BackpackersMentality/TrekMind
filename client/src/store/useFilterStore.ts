// store/useFilterStore.ts
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Added "month" field to FilterState, initial state, and setMonth action.
// This resolves the TypeError: Cannot read properties of undefined (reading 'length')
// which crashed the app when a month was selected in the filter popup.
//
// The crash occurred because:
//   1. FilterPopup wrote month to the store
//   2. useFilterStore had no "month" in its initial state (undefined)
//   3. GlobeViewer's filteredTreks useMemo called undefined.length -> crash
//
// Deploy this file alongside the updated GlobeViewer_updated.tsx (which adds
// null-safe guards) and filterTreks_updated.ts (which reads seasonMonths[]).
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";

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
  month:         [], // ← ADDED
};

interface FilterStore {
  filters:    FilterState;
  // Legacy single-value fields (kept for GlobeViewer embed compat)
  tier:       string | null;
  continent:  string | null;
  month:      string | null; // ← ADDED single-value alias for embed filter path

  setFilters:   (f: FilterState) => void;
  resetFilters: () => void;
  setTier:      (t: string | null) => void;
  setContinent: (c: string | null) => void;
  setMonth:     (m: string | null) => void; // ← ADDED
  toggleFilter: (key: keyof FilterState, value: string) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters:   EMPTY_FILTERS,
  tier:      null,
  continent: null,
  month:     null, // ← ADDED: initialised to null (not undefined) — prevents crash

  setFilters:   (filters)  => set({ filters }),
  resetFilters: ()         => set({ filters: EMPTY_FILTERS, tier: null, continent: null, month: null }),
  setTier:      (tier)     => set({ tier }),
  setContinent: (continent)=> set({ continent }),
  setMonth:     (month)    => set({ month }), // ← ADDED

  toggleFilter: (key, value) =>
    set(state => {
      const current = state.filters[key] ?? []; // null-safe: default to []
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { filters: { ...state.filters, [key]: next } };
    }),
}));
